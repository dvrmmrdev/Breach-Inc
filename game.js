// The game engine: shows the current scene, applies choices, keeps the log
// and decides the ending. The story itself lives in story.js.

(function () {
  var SAVE_KEY = "breach-inc-save";
  var state;

  function freshState() {
    var stats = {};
    for (var id in STATS) stats[id] = STATS[id].start;
    return { node: START_NODE, spent: 0, days: 0, stats: stats, flags: {}, log: [], ended: null };
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
    return typeof node.text === "function" ? node.text(state.flags) : node.text;
  }

  function choose(choice) {
    var node = GAME_NODES[state.node];
    state.spent += choice.cost || 0;
    state.days += choice.days || 0;
    var changes = [];
    for (var id in choice.stats || {}) {
      var delta = choice.stats[id];
      state.stats[id] = Math.max(0, Math.min(100, state.stats[id] + delta));
      if (delta) changes.push(STATS[id].label + " " + signed(delta));
    }
    if (choice.set) state.flags[choice.set] = true;
    state.log.push({
      title: node.title,
      choice: choice.text,
      outcome: choice.outcome || "",
      effects: [money(choice.cost || 0), (choice.days || 0) + " days"].concat(changes).join(" · "),
    });

    for (var stat in EARLY_ENDINGS) {
      if (state.stats[stat] <= 0) { state.ended = { early: stat }; break; }
    }
    if (!state.ended) {
      if (GAME_NODES[choice.nextNode]) state.node = choice.nextNode;
      else state.ended = { early: null };
    }
    save();
    render();
    window.scrollTo(0, 0);
    document.getElementById("main").focus();
  }

  function restart() {
    state = freshState();
    save();
    render();
  }

  function renderHud() {
    var hud = document.getElementById("hud");
    hud.textContent = "";
    function box(label, value, meter) {
      var b = el("div", "stat-box");
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
      row.appendChild(el("div", "log-title", entry.title + ": " + entry.choice));
      if (entry.outcome) row.appendChild(el("div", "log-outcome", entry.outcome));
      row.appendChild(el("div", "log-effects", entry.effects));
      panel.appendChild(row);
    }
  }

  function renderScene(card) {
    var node = GAME_NODES[state.node];
    card.appendChild(el("div", "act-tag", node.act));
    card.appendChild(el("h1", null, node.title));
    card.appendChild(el("p", "narrative", nodeText(node)));
    node.choices.forEach(function (choice) {
      var btn = el("button", "choice-btn", choice.text);
      btn.type = "button";
      btn.appendChild(el("span", "choice-cost", money(choice.cost || 0) + " · " + (choice.days || 0) + " days"));
      btn.addEventListener("click", function () { choose(choice); });
      card.appendChild(btn);
    });
  }

  function renderEnding(card) {
    var early = state.ended.early && EARLY_ENDINGS[state.ended.early];
    var ending = early || ENDINGS.filter(function (e) { return e.test(state.stats); })[0];
    card.appendChild(el("div", "act-tag", early ? "Game over" : "Epilogue"));
    card.appendChild(el("h1", null, ending.title));
    card.appendChild(el("p", "narrative", ending.text));
    card.appendChild(el("p", "narrative summary",
      "You spent " + money(state.spent) + " over " + state.days + " days and made " + state.log.length + " decisions."));
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
    var card = document.getElementById("main");
    card.textContent = "";
    if (state.ended) renderEnding(card);
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
