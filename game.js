// The game engine: shows the current scene or interlude, applies choices,
// keeps the log and decides the ending. The story lives in story.js and
// interludes.js.

(function () {
  var SAVE_KEY = "breach-inc-save";
  var state;

  function freshState() {
    var stats = {};
    for (var id in STATS) stats[id] = STATS[id].start;
    // `started` is false until the player leaves the opening screen. Saves
    // from before there was one don't have it, and carry on where they were.
    // `choices` records the option picked in each scene, by index, for the
    // lessons at the end.
    // `held` keeps Public trust changes made before the announcement, which
    // only land once the public know.
    return { node: START_NODE, days: 0, stats: stats, held: {}, flags: {}, choices: {}, log: [], silence: null, deadline: null, ended: null, started: false };
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && (saved.ended || GAME_NODES[saved.node])) {
        // Saves from before Public trust existed start it fresh.
        for (var id in STATS) if (saved.stats[id] == null) saved.stats[id] = STATS[id].start;
        saved.held = saved.held || {};
        return saved;
      }
    } catch (e) { /* storage unavailable or corrupt */ }
    return null;
  }

  // Each day of work that doesn't fit before Legal's date is done at night,
  // costing this much Team health, Your health and Influence.
  var OVERRUN_COST = 5;

  // Seconds between an interlude's paragraphs appearing, unless it sets its
  // own `pace`.
  var PACE = 0.6;

  // Timed effects within a screen, cancelled whenever it's redrawn. With
  // reduced motion, they jump straight to how they end.
  var REDUCED = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var timers = [];
  function later(seconds, fn) {
    timers.push(setTimeout(fn, REDUCED ? 0 : seconds * 1000));
  }

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

  // How many days a choice would run past Legal's date, squeezed into nights,
  // so its button can warn. Mirrors advance() and holdToDeadline().
  // What a choice needs and the player lacks, as [stat, level], or null. A
  // choice that takes extra spend `needs` Influence to get the budget, and
  // one that goes against the room needs it to carry the room (`needsFor`).
  function shortOf(choice) {
    for (var id in choice.needs || {}) {
      if (state.stats[id] < choice.needs[id]) return [id, choice.needs[id]];
    }
    return null;
  }

  function daysPast(choice) {
    var d = state.deadline;
    if (!d || d.done) return 0;
    var next = GAME_NODES[choice.nextNode || choice.next];
    if (next && next.deadlineCheck) return 0;
    var day = choice.deadlineShift ? Math.max(state.days + 1, d.day + choice.deadlineShift) : d.day;
    return Math.max(0, state.days + (choice.days || 0) - (day - 1));
  }

  // The day of the incident, counting the briefing night as Day 1. The
  // silence starts that night, so it marks the day. Null before then.
  function incidentDay() {
    return state.silence ? state.days - state.silence.from + 1 : null;
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

  // Each stat runs from 0 to 100 unless it says otherwise. Reaching the
  // bottom ends the game early.
  function statMin(id) { return STATS[id].min != null ? STATS[id].min : 0; }
  function statMax(id) { return STATS[id].max != null ? STATS[id].max : 100; }

  // Whether the breach is public yet: set once the player has lived through
  // the announcement itself.
  function announced() {
    return !!state.flags.public;
  }

  function applyStats(stats, changes) {
    if (typeof stats === "function") stats = stats(state.flags, state.stats);
    for (var id in stats || {}) {
      var delta = stats[id];
      if (!delta) continue;
      // The public can't judge what they don't know about yet: hold the
      // change until the announcement.
      if (STATS[id].public && !announced()) {
        state.held[id] = (state.held[id] || 0) + delta;
        changes.push(STATS[id].label + " " + signed(delta) + " when it's public");
        continue;
      }
      state.stats[id] = Math.max(statMin(id), Math.min(statMax(id), state.stats[id] + delta));
      changes.push(STATS[id].label + " " + signed(delta));
    }
  }

  // Announcement day: the shock of the news itself, plus everything held
  // back until the public knew.
  function goPublic() {
    var changes = [];
    var stats = {};
    var shock = 0, prepared = 0;
    for (var id in STATS) {
      if (!STATS[id].public) continue;
      shock += STATS[id].announcement || 0;
      prepared += state.held[id] || 0;
      stats[id] = (STATS[id].announcement || 0) + (state.held[id] || 0);
    }
    state.held = {};
    state.flags.public = true;
    applyStats(stats, changes);
    if (changes.length) {
      state.log.push({
        title: "Announcement day",
        choice: "",
        outcome: "The public hear the news (" + signed(shock) + "), and judge everything you prepared for them (" + signed(prepared) + ").",
        effects: changes.join(" · "),
      });
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
    // Escalating the share sale brings the date forward: overrunning after
    // that isn't the player's failure, and the epilogue says so.
    if (state.flags.date_forward) state.flags.forward_overrun = true;
    // Shown on the next screen, so the deadline bites when it happens.
    state.squeezed = over;
    var changes = [];
    applyStats({ teamHealth: -OVERRUN_COST * over, playerHealth: -OVERRUN_COST * over, internalInfluence: -OVERRUN_COST * over }, changes);
    state.log.push({
      title: "Legal's deadline",
      choice: "",
      outcome: "The date doesn't move. " + dayCount(over) + " of work squeezed into nights, and the board noticed it was late.",
      effects: changes.join(" · "),
    });
    state.days = deadline.day - 1;
  }

  // Applies a choice, or an interlude's Continue, then moves on.
  function advance(step, logChoice) {
    var node = GAME_NODES[state.node];
    var startDay = state.days;
    state.squeezed = 0;
    state.days += step.days || 0;
    var changes = [];
    applyStats(step.stats, changes);
    if (step.set) state.flags[step.set] = true;
    if (node.deadlineCheck) goPublic();
    if (logChoice && state.choices) state.choices[state.node] = node.choices.indexOf(step);
    // Remember any option that was out of reach, for the lessons.
    if (logChoice && node.choices.some(shortOf)) {
      state.flags.lockedOut = state.flags.lockedOut || {};
      state.flags.lockedOut[state.node] = true;
    }
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
      if (state.stats[stat] <= statMin(stat)) { state.ended = { early: stat }; break; }
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
    for (var id in STATS) {
      if (STATS[id].public && !announced() && !state.ended) {
        box(STATS[id].label, "Not public", null, "pending");
        continue;
      }
      // A stat that can go below zero shows its sign, and its meter runs
      // from the bottom of its range to the top.
      var v = state.stats[id], lo = statMin(id), hi = statMax(id);
      box(STATS[id].label, lo < 0 && v ? signed(v) : String(v), Math.round((v - lo) / (hi - lo) * 100));
    }
    if (state.silence && state.silence.to == null && !state.ended) {
      box("Days in silence", String(silenceDays()), null, "silence days-silent");
    }
    var announcing = !state.ended && GAME_NODES[state.node].deadlineCheck;
    if (state.deadline && !state.ended && (!state.deadline.done || announcing)) {
      var left = state.deadline.day - state.days;
      box("Legal's date", left === 0 ? "TODAY" : left > 0 ? "in " + dayCount(left) : dayCount(-left) + " over", null,
        (left <= 5 ? "silence" : "") + (state.squeezed ? " bite" : ""));
      if (state.squeezed) {
        hud.lastChild.appendChild(el("span", "stat-note", dayCount(state.squeezed) + " squeezed into nights"));
      }
    }
  }

  // The edges of the screen close in as your health falls, and more so
  // while you can't talk to anyone. At home, for a while, they lift.
  function renderPressure() {
    var health = state.ended ? 100 : state.stats.playerHealth;
    var silent = state.silence && state.silence.to == null && !state.ended;
    var home = !state.ended && !!GAME_NODES[state.node].homecoming;
    var collapse = !!(state.ended && state.ended.early && !state.ended.reviewed);
    var pressure = home ? 0 : collapse ? 1 : Math.min(1, (100 - health) / 80 + (silent ? 0.25 : 0));
    document.documentElement.classList.toggle("unwinding", home);
    document.documentElement.classList.toggle("collapsing", collapse);
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

  // When paragraph i appears, in seconds: one every `pace`, plus any pauses
  // up to and including it.
  function appearAt(node, i, offset) {
    var at = (offset || 0) + i * (node.pace || PACE);
    for (var j in node.pauses || {}) if (j <= i) at += node.pauses[j];
    return at;
  }

  function renderParagraphs(card, node, cls, offset) {
    nodeText(node).forEach(function (text, i) {
      var p = el("p", cls, text);
      p.style.animationDelay = appearAt(node, i, offset) + "s";
      card.appendChild(p);
    });
  }

  function minutes(time) {
    var parts = time.split(":");
    return parts[0] * 60 + Number(parts[1]);
  }

  function clockTime(mins) {
    return ("0" + Math.floor(mins / 60)).slice(-2) + ":" + ("0" + (mins % 60)).slice(-2);
  }

  // Ticks the clock on a minute at a time, reaching `to` after `seconds`.
  function countDown(clock, time, from, to, seconds) {
    var start = minutes(from), steps = minutes(to) - start;
    for (var i = 1; i <= steps; i++) {
      (function (i) {
        later(seconds * i / steps, function () {
          time.textContent = clockTime(start + i);
          if (i === steps) clock.classList.add("zero");
        });
      })(i);
    }
  }

  // Messages pile in faster than anyone could read them, newest on top,
  // while the unread count climbs. Returns how long that takes, in seconds.
  function renderNoise(card, noise) {
    var box = el("div", "noise");
    box.setAttribute("aria-hidden", "true");
    var badge = el("div", "noise-badge", "0 unread");
    var stack = el("div", "noise-stack");
    box.appendChild(badge);
    box.appendChild(stack);
    card.appendChild(box);
    var gap = 0.15, count = noise.messages.length;
    noise.messages.forEach(function (text, i) {
      later(0.3 + i * gap, function () {
        stack.insertBefore(el("div", "noise-msg", text), stack.firstChild);
        badge.textContent = Math.round(noise.unread * (i + 1) / count) + " unread";
      });
    });
    var done = 0.3 + count * gap + 0.4;
    later(done, function () { box.classList.add("settled"); });
    return done;
  }

  function renderScene(card) {
    var node = GAME_NODES[state.node];
    card.className = "card" + (node.jolt ? " jolt" : "");
    card.appendChild(el("div", "act-tag", node.act));
    card.appendChild(el("h1", null, node.title));
    // Scenes normally appear at once, so the player can weigh the whole
    // situation. A `stage`d scene unfolds like an interlude instead, starting
    // `stage` seconds in, and its choices appear only after the last line.
    var offset = node.stage || 0;
    renderParagraphs(card, node, "narrative" + (node.stage ? " reveal" : ""), offset);
    var choicesAt = appearAt(node, nodeText(node).length, offset);
    node.choices.forEach(function (choice, i) {
      var btn = el("button", "choice-btn" + (node.stage ? " reveal" : ""), choice.text);
      if (node.stage) btn.style.animationDelay = choicesAt + i * 0.2 + "s";
      btn.type = "button";
      var past = daysPast(choice);
      var short = shortOf(choice);
      if (short) {
        // Out of reach: shown, so the player sees what influence would buy.
        btn.disabled = true;
        btn.appendChild(el("span", "choice-cost locked", "Needs " + STATS[short[0]].label + " " + short[1] +
          " " + (choice.needsFor || "to get the budget") + " · you have " + state.stats[short[0]]));
      } else {
        btn.appendChild(el("span", "choice-cost" + (past ? " past" : ""),
          dayCount(choice.days) + (past ? " · " + dayCount(past) + " past Legal's date" : "")));
      }
      btn.addEventListener("click", function () { advance(choice, choice.text); });
      card.appendChild(btn);
    });
  }

  function renderInterlude(card) {
    var node = GAME_NODES[state.node];
    var pace = node.pace || PACE;
    card.className = "card interlude" + (node.turn ? " turning" : "") + (node.homecoming ? " homecoming" : "");
    var day = incidentDay();
    var clock = el("div", "clock", (node.when || (day ? "Day " + day : "Summit week")) + " · ");
    var time = el("span", null, node.time);
    clock.appendChild(time);
    card.appendChild(clock);
    card.appendChild(el("h1", null, node.title));
    var offset = node.noise ? renderNoise(card, node.noise) : 0;
    var paragraphs = nodeText(node);
    renderParagraphs(card, node, "narrative reveal", offset);
    var last = appearAt(node, paragraphs.length - 1, offset);
    var btn = el("button", "next-btn reveal", "Continue");
    btn.type = "button";
    btn.style.animationDelay = last + pace + "s";
    // A turning interlude drains to red as its last paragraph appears; a
    // homecoming drains back to blue across the whole card.
    card.style.setProperty("--turn-delay", last + "s");
    card.style.setProperty("--reveal-time", last + pace + "s");
    if (node.countdown) countDown(clock, time, node.time, node.countdown.to, appearAt(node, node.countdown.at, offset));
    if (node.buzz != null) later(appearAt(node, node.buzz, offset), function () { card.classList.add("buzz"); });
    if (node.flashback != null) later(appearAt(node, node.flashback, offset), function () { card.classList.add("flashback"); });
    // The silence ends on screen: the counter is struck through.
    if (node.silence === "end") {
      later(last, function () {
        var counter = document.querySelector(".days-silent");
        if (counter) counter.classList.add("ended");
      });
    }
    btn.addEventListener("click", function () {
      if (!node.homecoming) return advance(node);
      // Falling asleep: the screen fades out before the story moves on.
      btn.disabled = true;
      card.classList.add("asleep");
      later(1.8, function () { advance(node); });
    });
    card.appendChild(btn);
  }

  // A narrative paragraph mixing text with links, given as [label, href]
  // or [label, href, true] to open in a new tab.
  function paragraph(parts) {
    var p = el("p", "narrative");
    parts.forEach(function (part) {
      if (typeof part === "string") return p.appendChild(document.createTextNode(part));
      var a = el("a", null, part[0]);
      a.href = part[1];
      if (part[2]) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      p.appendChild(a);
    });
    return p;
  }

  // The opening screen, before Act 0: what the game is, where it comes from,
  // and how it may be used.
  function renderIntro(card) {
    card.className = "card intro";
    card.appendChild(el("div", "act-tag", "Before you begin"));
    card.appendChild(el("h1", null, "Breach Inc."));
    [
      "Breach Inc. is a text-based game for security, tech and business leaders. You'll live through a major data breach from the inside: the weeks of secrecy before the announcement, the storm that follows it, and what it costs the people who respond.",
      "Breach Inc. is fiction, inspired by my experience of working through a major cyber breach. The company, people and events are invented or composites, and it isn't an account of any real organisation's response, or of what I or anyone else decided. What's real is what it felt like - the pressure, the silence and the impossible choices.",
      "Your choices shape the story, and many of its events and outcomes only happen on some paths. None of them should be read as a record of what really happened, or of what anyone really did.",
      "Every decision takes time and moves four things - your influence, your team's health, your own health, and, once the breach is public, how far the public trust ACME Inc.'s response. Some choices need extra spending, and you'll only get the budget if you have enough influence. There's no perfect path. The aim is to help you think about how to prepare today for what might come tomorrow. After your story ends, the game shows you how your choices affected the scenario and provides some questions to take back to your team.",
    ].forEach(function (text) { card.appendChild(el("p", "narrative", text)); });
    card.appendChild(el("h2", null, "Using Breach Inc."));
    card.appendChild(paragraph([
      "You're welcome to use Breach Inc. in your organisation's security awareness programmes, as long as you use it as it is and include a link to ",
      ["breach-inc.com", "https://breach-inc.com/"],
      ". An organisation licence lets you adapt it for your own staff and pay by invoice, and including it in a paid course needs a licence too. ",
      ["Read the licence", "licence.html"],
      " for the details.",
    ]));
    card.appendChild(paragraph([
      "If it's useful to your organisation, please consider ",
      ["supporting it on Ko-fi", "https://ko-fi.com/dvrmmr", true],
      ".",
    ]));
    var btn = el("button", "next-btn primary-btn", "Begin");
    btn.type = "button";
    btn.addEventListener("click", function () {
      state.started = true;
      save();
      render();
      document.getElementById("main").focus();
    });
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
    if (/^https?:/.test(href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    p.appendChild(a);
    p.appendChild(document.createTextNode("."));
    return p;
  }

  function renderEnding(card) {
    var early = state.ended.early && EARLY_ENDINGS[state.ended.early];
    var ending = early || ENDINGS.filter(function (e) { return e.test(state.stats); })[0];
    // An early ending collapses: the edges close to black, then the words
    // come through one at a time.
    card.className = "card" + (early ? " collapse" : "");
    var parts = [el("div", "act-tag", early ? "Game over" : "Epilogue"), el("h1", null, ending.title)];
    [].concat(ending.text).forEach(function (text) { parts.push(el("p", "narrative", text)); });
    if (state.flags.overrun) {
      parts.push(el("p", "narrative", state.flags.forward_overrun
        ? "Legal brought the date forward after you escalated the share sale, and the work that no longer fitted was squeezed into nights. Doing the right thing had a price, and your team paid it in overtime and lost sleep."
        : "You weren't able to deliver everything that was required before Legal's deadline, and your team paid the price in overtime and lost sleep."));
    }
    var day = incidentDay();
    var summary = "You made " + state.log.filter(function (e) { return e.choice; }).length + " decisions" +
      (day ? ". " + dayCount(day) + " passed between the night you were briefed and the end." : ".");
    var silent = silenceDays();
    if (silent != null) {
      summary += " For " + silent + " of those days, you couldn't tell anyone, not even your family, what you were going through.";
    }
    parts.push(el("p", "narrative summary", summary));
    var btn = el("button", "next-btn primary-btn", "What this breach taught you →");
    parts.push(btn);
    parts.forEach(function (part, i) {
      if (early) {
        part.classList.add("reveal");
        part.style.animationDelay = 1.6 + i * 0.9 + "s";
      }
      card.appendChild(part);
    });
    btn.type = "button";
    btn.addEventListener("click", function () {
      state.ended.reviewed = true;
      save();
      render();
      window.scrollTo(0, 0);
      document.getElementById("main").focus();
    });
  }

  // Unfold every lesson before printing, so the PDF has all of them.
  window.addEventListener("beforeprint", function () {
    [].forEach.call(document.querySelectorAll("details.lesson-more"), function (d) { d.open = true; });
  });

  var VERDICTS = { paid: "Paid off", manage: "Impact to manage", tradeoff: "Trade-off" };

  // The browsers built into other apps (LinkedIn, Facebook, Instagram, the
  // Google app...) mostly ignore window.print(), so the Print button does
  // nothing there. They say who they are in the user agent.
  var IN_APP_BROWSER = /LinkedInApp|FBAN|FBAV|Instagram|GSA\/|MicroMessenger|Line\/|Snapchat|Twitter/i.test(navigator.userAgent || "");

  // Every question as plain text, for email or the clipboard.
  function questionsText() {
    var lines = ["Questions to take to your leadership team, from Breach Inc. (https://breach-inc.com)", ""];
    var n = 0;
    LESSONS.forEach(function (lesson) {
      lesson.ask.forEach(function (q) { lines.push(++n + ". " + q); });
    });
    return lines.join("\n");
  }

  // Copies text, with a fallback for browsers without the clipboard API.
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return copyByHand(text); });
    }
    return Promise.resolve(copyByHand(text));
  }

  function copyByHand(text) {
    var area = el("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  // The lessons, as the final act: each one looks back at the player's own
  // choices, then turns them into questions to take back to work. Saves from
  // before choices were recorded get the lessons without the look back.
  function renderLessons(card) {
    card.className = "card lessons-screen";
    card.appendChild(el("div", "act-tag", "Lessons learned"));
    card.appendChild(el("h1", null, "Your breach in review"));
    card.appendChild(el("p", "narrative", LESSONS_INTRO));
    var record = state.choices && { choices: state.choices, flags: state.flags, stats: state.stats, log: state.log, finished: !state.ended.early };
    LESSONS.forEach(function (lesson, i) {
      var box = el("section", "lesson reveal");
      box.style.animationDelay = i * 0.3 + "s";
      box.appendChild(el("div", "lesson-scenes", lesson.scenes));
      var head = el("div", "lesson-head");
      head.appendChild(el("h2", null, (i + 1) + ". " + lesson.title));
      var review = record && lesson.review(record);
      if (review) head.appendChild(el("span", "verdict " + review.verdict, VERDICTS[review.verdict]));
      box.appendChild(head);
      if (record) {
        box.appendChild(el("div", "lesson-label", "In your game"));
        box.appendChild(el("p", review ? null : "lesson-missed", review ? review.text : "Your breach ended before this point."));
      }
      // The lesson and its questions stay folded away, so the screen opens
      // as one line per lesson. Printing unfolds them all.
      var more = el("details", "lesson-more");
      more.appendChild(el("summary", null, "Click here to view the lesson and " + lesson.ask.length +
        (lesson.ask.length === 1 ? " question" : " questions") + " for your team"));
      more.appendChild(el("div", "lesson-label", "The lesson"));
      more.appendChild(el("p", null, lesson.lesson));
      more.appendChild(el("div", "lesson-label", "Ask your team"));
      var asks = el("ul");
      lesson.ask.forEach(function (q) { asks.appendChild(el("li", null, q)); });
      more.appendChild(asks);
      box.appendChild(more);
      card.appendChild(box);
    });
    // Every question in one place, ready to print or save as a PDF.
    var questions = el("section", "questions");
    questions.appendChild(el("h2", null, "Questions to take to your leadership team"));
    var list = el("ol");
    LESSONS.forEach(function (lesson) {
      lesson.ask.forEach(function (q) { list.appendChild(el("li", null, q)); });
    });
    questions.appendChild(list);
    // The one place the game asks for support: straight after it has given
    // the player something to take away. A plain link, not Ko-fi's widget,
    // so nothing loads from another site.
    // Organisations are pointed to the licence, which they can pay by
    // invoice, rather than asked to tip from a training budget.
    var support = paragraph([
      "Breach Inc. is free, with no ads and no tracking, and it's going to stay that way. If it's given you something to take back to your team, you can help keep it free. If your organisation is using it, an ",
      ["organisation licence", "licence.html#organisation"],
      " lets you adapt it for your own staff and pay by invoice, and includes a briefing on running it as a workshop with the free ",
      ["facilitator guide", "facilitator.html"],
      ".",
    ]);
    support.className += " support";
    questions.appendChild(support);
    var actions = el("div", "actions");
    var print = el("button", "next-btn", "Print or save as PDF");
    print.type = "button";
    print.addEventListener("click", function () { window.print(); });
    actions.appendChild(print);
    // Email and Copy work everywhere, including the in-app browsers that
    // can't print.
    var email = el("a", "next-btn", "Email me the questions");
    email.href = "mailto:?subject=" + encodeURIComponent("Breach Inc.: questions for my team") + "&body=" + encodeURIComponent(questionsText());
    actions.appendChild(email);
    var copy = el("button", "next-btn", "Copy the questions");
    copy.type = "button";
    var copied = el("p", "narrative copy-status");
    copied.setAttribute("role", "status");
    copy.addEventListener("click", function () {
      copyText(questionsText()).then(function (ok) {
        copied.textContent = ok ? "Copied. Paste them into a note, message or email." : "Couldn't copy here. Try Email instead.";
      });
    });
    actions.appendChild(copy);
    var kofi = el("a", "next-btn", "Support Breach Inc. on Ko-fi");
    kofi.href = "https://ko-fi.com/dvrmmr";
    kofi.target = "_blank";
    kofi.rel = "noopener noreferrer";
    actions.appendChild(kofi);
    questions.appendChild(actions);
    questions.appendChild(copied);
    if (IN_APP_BROWSER) {
      questions.appendChild(el("p", "narrative print-note",
        "Printing isn't available in this app's built-in browser. To print, open breach-inc.com in Safari or Chrome, or use Email or Copy above."));
    }
    card.appendChild(questions);
    var author = el("div", "author-note");
    author.appendChild(link("Going through a breach, or struggling with the personal aftermath of one? I'm happy to talk. ",
      "Get in touch by email", "mailto:hello@breach-inc.com?subject=Breach%20Inc.%3A%20getting%20in%20touch"));
    author.appendChild(link("Feedback on the game is very welcome: ", "email me", "mailto:hello@breach-inc.com?subject=Breach%20Inc.%20feedback"));
    card.appendChild(author);
    var again = el("button", "next-btn primary-btn", "Play again with different choices");
    again.type = "button";
    again.addEventListener("click", restart);
    card.appendChild(again);
  }

  function render() {
    timers.forEach(clearTimeout);
    timers = [];
    // The lessons step out of the story: the red goes, and the calm blue
    // of before the breach comes back.
    var reflecting = !!(state.ended && state.ended.reviewed);
    document.documentElement.classList.toggle("reflecting", reflecting);
    document.documentElement.classList.toggle("breached", !reflecting && !!(state.flags.readIn || state.silence));
    document.documentElement.classList.toggle("aftermath", !!state.flags.home);
    renderHud();
    renderPressure();
    var card = document.getElementById("main");
    card.textContent = "";
    var act = !state.ended && GAME_NODES[state.node].act;
    if (state.ended) (state.ended.reviewed ? renderLessons : renderEnding)(card);
    else if (state.started === false) renderIntro(card);
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
