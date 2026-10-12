// The game engine: shows the current scene or interlude, applies choices,
// keeps the log and decides the ending. The story lives in story.js and
// interludes.js.

(function () {
  var SAVE_KEY = "breach-inc-save";
  var state;

  function freshState() {
    var stats = {};
    for (var id in STATS) stats[id] = STATS[id].start;
    return { node: START_NODE, days: 0, stats: stats, flags: {}, log: [], silence: null, deadline: null, ended: null };
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && (saved.ended || GAME_NODES[saved.node])) return saved;
    } catch (e) { /* storage unavailable or corrupt */ }
    return null;
  }

  // Each day of work that doesn't fit before Legal's date is done at night,
  // costing this much Team health and Your health.
  var OVERRUN_COST = 2;

  function dayCount(n) {
    return (n || 0) + (n === 1 ? " day" : " days");
  }

  function signed(n) {
    return (n > 0 ? "+" : n < 0 ? "−" : "±") + Math.abs(n);
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function nodeText(node) {
    var text = typeof node.text === "function" ? node.text(state.flags, state.stats, daysLeft()) : node.text;
    return [].concat(text);
  }

  // Days until Legal's announcement date, or null outside the countdown.
  function daysLeft() {
    var d = state.deadline;
    return d && !d.done ? d.day - state.days : null;
  }

  // Days spent unable to tell anyone, so far or in total.
  function silenceDays() {
    if (!state.silence) return null;
    return (state.silence.to != null ? state.silence.to : state.days) - state.silence.from;
  }

  function enter(nodeId) {
    state.node = nodeId;
    var node = GAME_NODES[nodeId];
    if (node.readIn) state.flags.readIn = true;
    if (node.silence === "start" && !state.silence) state.silence = { from: state.days, to: null };
    if (node.deadline && state.deadline == null) state.deadline = { day: state.days + node.deadline, done: false };
  }

  function applyStats(stats, changes) {
    if (typeof stats === "function") stats = stats(state.flags, state.stats);
    for (var id in stats || {}) {
      var delta = stats[id];
      state.stats[id] = Math.max(0, Math.min(100, state.stats[id] + delta));
      if (delta) changes.push(STATS[id].label + " " + signed(delta));
    }
  }

  // Legal's date doesn't move. Until the announcement, the clock can't pass
  // the day before it: work that doesn't fit is squeezed into nights, at a
  // cost, as soon as it happens. The announcement itself is on the date.
  function holdToDeadline(announcing) {
    var deadline = state.deadline;
    if (!deadline || deadline.done) return;
    if (announcing) {
      state.days = deadline.day;
      deadline.done = true;
      return;
    }
    var over = state.days - (deadline.day - 1);
    if (over <= 0) return;
    state.flags.overrun = (state.flags.overrun || 0) + over;
    var changes = [];
    applyStats({ teamHealth: -OVERRUN_COST * over, playerHealth: -OVERRUN_COST * over }, changes);
    state.log.push({
      title: "Legal's deadline",
      choice: "",
      outcome: "The date doesn't move. " + dayCount(over) + " of work squeezed into nights.",
      effects: changes.join(" · "),
    });
    state.days = deadline.day - 1;
  }

  // Applies a choice, or an interlude's Continue, then moves on.
  function advance(step, logChoice) {
    var node = GAME_NODES[state.node];
    var startDay = state.days;
    state.days += step.days || 0;
    var changes = [];
    applyStats(step.stats, changes);
    if (step.set) state.flags[step.set] = true;
    // Legal can bring the date forward, but never to before tomorrow.
    if (step.deadlineShift && state.deadline) {
      state.deadline.day = Math.max(startDay + 1, state.deadline.day + step.deadlineShift);
    }
    // The silence ends once you've read the interlude that ends it.
    if (node.silence === "end" && state.silence && state.silence.to == null) state.silence.to = state.days;
    if (logChoice || changes.length) {
      state.log.push({
        title: node.title,
        choice: logChoice || "",
        outcome: step.outcome || "",
        effects: (logChoice ? [dayCount(step.days)] : []).concat(changes).join(" · "),
      });
    }
    var next = step.nextNode || step.next;
    holdToDeadline(!!(GAME_NODES[next] && GAME_NODES[next].deadlineCheck));

    for (var stat in EARLY_ENDINGS) {
      if (state.stats[stat] <= 0) { state.ended = { early: stat }; break; }
    }
    if (!state.ended) {
      if (GAME_NODES[next]) enter(next);
      else state.ended = { early: null };
    }
    save();
    render();
    window.scrollTo(0, 0);
    document.getElementById("main").focus();
  }

  function restart() {
    state = freshState();
    enter(START_NODE);
    save();
    render();
  }

  function renderHud() {
    var hud = document.getElementById("hud");
    hud.textContent = "";
    function box(label, value, meter, cls) {
      var b = el("div", "stat-box" + (cls ? " " + cls : ""));
      b.appendChild(el("span", "stat-label", label));
      b.appendChild(el("span", "stat-val", value));
      if (meter != null) {
        var m = el("div", "meter");
        var fill = el("div", "meter-fill" + (meter <= 25 ? " low" : meter <= 50 ? " mid" : ""));
        fill.style.width = meter + "%";
        m.appendChild(fill);
        b.appendChild(m);
      }
      hud.appendChild(b);
    }
    box("Days", String(state.days));
    for (var id in STATS) box(STATS[id].label, String(state.stats[id]), state.stats[id]);
    if (state.silence && state.silence.to == null && !state.ended) {
      box("Days in silence", String(silenceDays()), null, "silence");
    }
    var announcing = !state.ended && GAME_NODES[state.node].deadlineCheck;
    if (state.deadline && !state.ended && (!state.deadline.done || announcing)) {
      var left = state.deadline.day - state.days;
      box("Legal's date", left === 0 ? "TODAY" : left > 0 ? "in " + dayCount(left) : dayCount(-left) + " over", null, left <= 5 ? "silence" : "");
    }
  }

  // The edges of the screen close in as your health falls, and more so
  // while you can't talk to anyone.
  function renderPressure() {
    var health = state.ended ? 100 : state.stats.playerHealth;
    var silent = state.silence && state.silence.to == null && !state.ended;
    var pressure = Math.min(1, (100 - health) / 80 + (silent ? 0.25 : 0));
    document.documentElement.style.setProperty("--pressure", pressure.toFixed(2));
  }

  function renderLog() {
    var panel = document.getElementById("log");
    panel.textContent = "";
    if (!state.log.length) {
      panel.appendChild(el("div", "log-empty", "Your decisions and their consequences will appear here."));
      return;
    }
    for (var i = state.log.length - 1; i >= 0; i--) {
      var entry = state.log[i];
      var row = el("div", "log-entry");
      row.appendChild(el("div", "log-title", entry.title + (entry.choice ? ": " + entry.choice : "")));
      if (entry.outcome) row.appendChild(el("div", "log-outcome", entry.outcome));
      row.appendChild(el("div", "log-effects", entry.effects));
      panel.appendChild(row);
    }
  }

  function renderParagraphs(card, node, cls) {
    nodeText(node).forEach(function (text, i) {
      var p = el("p", cls, text);
      p.style.animationDelay = i * 0.6 + "s";
      card.appendChild(p);
    });
  }

  function renderScene(card) {
    var node = GAME_NODES[state.node];
    card.className = "card" + (node.jolt ? " jolt" : "");
    card.appendChild(el("div", "act-tag", node.act));
    card.appendChild(el("h1", null, node.title));
    renderParagraphs(card, node, "narrative");
    node.choices.forEach(function (choice) {
      var btn = el("button", "choice-btn", choice.text);
      btn.type = "button";
      btn.appendChild(el("span", "choice-cost", dayCount(choice.days)));
      btn.addEventListener("click", function () { advance(choice, choice.text); });
      card.appendChild(btn);
    });
  }

  function renderInterlude(card) {
    var node = GAME_NODES[state.node];
    card.className = "card interlude" + (node.turn ? " turning" : "");
    card.appendChild(el("div", "clock", (node.when || "Day " + state.days) + " · " + node.time));
    card.appendChild(el("h1", null, node.title));
    var paragraphs = nodeText(node);
    renderParagraphs(card, node, "narrative reveal");
    var btn = el("button", "next-btn reveal", "Continue");
    btn.type = "button";
    btn.style.animationDelay = paragraphs.length * 0.6 + "s";
    // A turning interlude drains to red as its last paragraph appears.
    card.style.setProperty("--turn-delay", (paragraphs.length - 1) * 0.6 + "s");
    btn.addEventListener("click", function () { advance(node); });
    card.appendChild(btn);
  }

  // A screen of its own at the start of each act: just the number and title.
  function renderDivider(card, act) {
    var parts = act.split(": ");
    card.className = "card divider";
    // Each act's art is art/act<N>.svg; a missing file is simply hidden.
    var art = el("img", "divider-art");
    art.src = "art/" + parts[0].toLowerCase().replace(/\s+/g, "") + ".svg";
    art.alt = "";
    art.onerror = function () { art.remove(); };
    card.appendChild(art);
    card.appendChild(el("div", "divider-act", parts[0]));
    card.appendChild(el("h1", "divider-title", parts[1] || ""));
    var btn = el("button", "next-btn", "Continue");
    btn.type = "button";
    btn.addEventListener("click", function () {
      state.actShown = act;
      save();
      render();
      document.getElementById("main").focus();
    });
    card.appendChild(btn);
  }

  // A paragraph of text ending in a link that opens in a new tab.
  function link(before, label, href) {
    var p = el("p", null, before);
    var a = el("a", null, label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    p.appendChild(a);
    p.appendChild(document.createTextNode("."));
    return p;
  }

  function renderEnding(card) {
    var early = state.ended.early && EARLY_ENDINGS[state.ended.early];
    var ending = early || ENDINGS.filter(function (e) { return e.test(state.stats); })[0];
    card.className = "card";
    card.appendChild(el("div", "act-tag", early ? "Game over" : "Epilogue"));
    card.appendChild(el("h1", null, ending.title));
    card.appendChild(el("p", "narrative", ending.text));
    var summary = "You made " + state.log.filter(function (e) { return e.choice; }).length +
      " decisions over " + state.days + " days.";
    var silent = silenceDays();
    if (silent != null) {
      summary += " For " + silent + " of those days, you couldn't tell anyone, not even your family, what you were going through.";
    }
    card.appendChild(el("p", "narrative summary", summary));
    card.appendChild(el("h2", null, "Lessons learned: how to prepare today for what might come tomorrow"));
    var list = el("ul", "lessons");
    LESSONS.forEach(function (l) { list.appendChild(el("li", null, l)); });
    card.appendChild(list);
    var author = el("div", "author-note");
    author.appendChild(link("Going through a breach, or struggling with the personal aftermath of one? I'm happy to talk. ",
      "Get in touch on LinkedIn", "https://www.linkedin.com/in/rimmerd/"));
    author.appendChild(link("Feedback on the game is very welcome: ", "send me a message on LinkedIn", "https://www.linkedin.com/in/rimmerd/"));
    author.appendChild(link("If this game was useful to you, you can ", "support it on Ko-fi", "https://ko-fi.com/dvrmmr"));
    card.appendChild(author);
    var again = el("button", "choice-btn restart-btn", "Play again");
    again.type = "button";
    again.addEventListener("click", restart);
    card.appendChild(again);
  }

  function render() {
    document.documentElement.classList.toggle("breached", !!(state.flags.readIn || state.silence));
    renderHud();
    renderPressure();
    var card = document.getElementById("main");
    card.textContent = "";
    var act = !state.ended && GAME_NODES[state.node].act;
    if (state.ended) renderEnding(card);
    else if (act && act !== state.actShown) renderDivider(card, act);
    else if (GAME_NODES[state.node].type === "interlude") renderInterlude(card);
    else renderScene(card);
    renderLog();
  }

  document.addEventListener("DOMContentLoaded", function () {
    state = load() || freshState();
    document.getElementById("restart").addEventListener("click", function () {
      if (confirm("Start again from the beginning?")) restart();
    });
    render();
  });
})();
