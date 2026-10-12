// The game engine: shows the current scene or interlude, applies choices,
// keeps the log and decides the ending. The story lives in story.js and
// interludes.js.

(function () {
  var SAVE_KEY = "breach-inc-save";
  var state;

  function freshState() {
    var stats = {};
    for (var id in STATS) stats[id] = STATS[id].start;
    return { node: START_NODE, spent: 0, days: 0, stats: stats, flags: {}, log: [], silence: null, ended: null };
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

  function money(n) {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(n % 1000000 ? 2 : 0) + "m";
    if (n >= 1000) return "$" + Math.round(n / 1000) + "k";
    return "$" + n;
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
    var text = typeof node.text === "function" ? node.text(state.flags, state.stats) : node.text;
    return [].concat(text);
  }

  // Days spent unable to tell anyone, so far or in total.
  function silenceDays() {
    if (!state.silence) return null;
    return (state.silence.to != null ? state.silence.to : state.days) - state.silence.from;
  }

  function enter(nodeId) {
    state.node = nodeId;
    var node = GAME_NODES[nodeId];
    if (node.silence === "start" && !state.silence) state.silence = { from: state.days, to: null };
  }

  // Applies a choice, or an interlude's Continue, then moves on.
  function advance(step, logChoice) {
    var node = GAME_NODES[state.node];
    state.spent += step.cost || 0;
    state.days += step.days || 0;
    var changes = [];
    for (var id in step.stats || {}) {
      var delta = step.stats[id];
      state.stats[id] = Math.max(0, Math.min(100, state.stats[id] + delta));
      if (delta) changes.push(STATS[id].label + " " + signed(delta));
    }
    if (step.set) state.flags[step.set] = true;
    // The silence ends once you've read the interlude that ends it.
    if (node.silence === "end" && state.silence && state.silence.to == null) state.silence.to = state.days;
    if (logChoice || changes.length) {
      state.log.push({
        title: node.title,
        choice: logChoice || "",
        outcome: step.outcome || "",
        effects: (logChoice ? [money(step.cost || 0), (step.days || 0) + " days"] : []).concat(changes).join(" · "),
      });
    }

    for (var stat in EARLY_ENDINGS) {
      if (state.stats[stat] <= 0) { state.ended = { early: stat }; break; }
    }
    if (!state.ended) {
      var next = step.nextNode || step.next;
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
    box("Spent", money(state.spent));
    box("Days", String(state.days));
    for (var id in STATS) box(STATS[id].label, String(state.stats[id]), state.stats[id]);
    if (state.silence && state.silence.to == null && !state.ended) {
      box("Days in silence", String(silenceDays()), null, "silence");
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
    card.className = "card";
    card.appendChild(el("div", "act-tag", node.act));
    card.appendChild(el("h1", null, node.title));
    renderParagraphs(card, node, "narrative");
    node.choices.forEach(function (choice) {
      var btn = el("button", "choice-btn", choice.text);
      btn.type = "button";
      btn.appendChild(el("span", "choice-cost", money(choice.cost || 0) + " · " + (choice.days || 0) + " days"));
      btn.addEventListener("click", function () { advance(choice, choice.text); });
      card.appendChild(btn);
    });
  }

  function renderInterlude(card) {
    var node = GAME_NODES[state.node];
    card.className = "card interlude";
    card.appendChild(el("div", "clock", "Day " + state.days + " · " + node.time));
    card.appendChild(el("h1", null, node.title));
    var paragraphs = nodeText(node);
    renderParagraphs(card, node, "narrative reveal");
    var btn = el("button", "next-btn reveal", "Continue");
    btn.type = "button";
    btn.style.animationDelay = paragraphs.length * 0.6 + "s";
    btn.addEventListener("click", function () { advance(node); });
    card.appendChild(btn);
  }

  function renderEnding(card) {
    var early = state.ended.early && EARLY_ENDINGS[state.ended.early];
    var ending = early || ENDINGS.filter(function (e) { return e.test(state.stats); })[0];
    card.className = "card";
    card.appendChild(el("div", "act-tag", early ? "Game over" : "Epilogue"));
    card.appendChild(el("h1", null, ending.title));
    card.appendChild(el("p", "narrative", ending.text));
    var summary = "You spent " + money(state.spent) + " over " + state.days + " days and made " +
      state.log.filter(function (e) { return e.choice; }).length + " decisions.";
    var silent = silenceDays();
    if (silent != null) {
      summary += " For " + silent + " of those days, you couldn't tell anyone, not even your family, what you were going through.";
    }
    card.appendChild(el("p", "narrative summary", summary));
    card.appendChild(el("h2", null, "Lessons from a real breach"));
    var list = el("ul", "lessons");
    LESSONS.forEach(function (l) { list.appendChild(el("li", null, l)); });
    card.appendChild(list);
    var again = el("button", "choice-btn restart-btn", "Play again");
    again.type = "button";
    again.addEventListener("click", restart);
    card.appendChild(again);
  }

  function render() {
    renderHud();
    renderPressure();
    var card = document.getElementById("main");
    card.textContent = "";
    if (state.ended) renderEnding(card);
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
