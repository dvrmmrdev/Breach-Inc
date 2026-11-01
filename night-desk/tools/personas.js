// Plays The Night Desk as defined kinds of player: each persona lists, for
// every decision, the options it prefers in order (indexes into the scene's
// choices). The first one open to it is taken; recommendations can still be
// overruled. Sensible personas should finish; careless ones should not.
var fs = require("fs"), dir = __dirname + "/../";
global.window = {};
eval(fs.readFileSync(dir + "story.js", "utf8") + fs.readFileSync(dir + "interludes.js", "utf8"));

var PERSONAS = {
  "Resilience first (does what the lessons recommend)": {
    act0_start: [0], act0_alerts: [0, 1], act1_plug: [0], act2_chat: [0], act2_customers: [0],
    act2_sam: [0], act2_identity: [0], act2_board: [1, 0], act2_priority: [2, 0], act3_goodsin: [2, 1],
    act3_tell: [0], act3_carehome: [1], act3_desk: [1, 0], act4_bank: [2, 0], act4_insurer: [0],
    act4_name: [0, 1], act4_took: [2, 1, 3, 4], act4_review: [0, 1],
  },
  "Savvy (principled, but picks battles and spends influence carefully)": {
    act0_start: [1], act0_alerts: [0, 1], act1_plug: [0], act2_chat: [0], act2_customers: [0],
    act2_sam: [0], act2_identity: [0], act2_board: [1, 0], act2_priority: [0], act3_goodsin: [1],
    act3_tell: [0, 1], act3_carehome: [0, 2], act3_desk: [1, 0], act4_bank: [1], act4_insurer: [0],
    act4_name: [0, 1], act4_took: [2, 1, 3, 4], act4_review: [1],
  },
  "People first (looks after the team and Sam)": {
    act0_start: [1], act0_alerts: [1], act1_plug: [0], act2_chat: [0], act2_customers: [0],
    act2_sam: [0], act2_identity: [0], act2_board: [1, 0], act2_priority: [1, 0], act3_goodsin: [2, 0],
    act3_tell: [0], act3_carehome: [1], act3_desk: [0], act4_bank: [2, 1], act4_insurer: [0],
    act4_name: [0, 1], act4_took: [2, 1, 3, 4], act4_review: [1],
  },
  "Commercial pragmatist (keeps the business moving)": {
    act0_start: [2], act0_alerts: [3], act1_plug: [1], act2_chat: [0], act2_customers: [1],
    act2_sam: [1], act2_identity: [1], act2_board: [0], act2_priority: [0], act3_goodsin: [0],
    act3_tell: [1], act3_carehome: [2], act3_desk: [1, 2], act4_bank: [1], act4_insurer: [1],
    act4_name: [2], act4_took: [1, 4], act4_review: [2],
  },
  "By the book (follows Legal and HR's advice)": {
    act0_start: [1], act0_alerts: [1], act1_plug: [2], act2_chat: [2], act2_customers: [1],
    act2_sam: [1], act2_identity: [0], act2_board: [1, 0], act2_priority: [0], act3_goodsin: [1],
    act3_tell: [1], act3_carehome: [2], act3_desk: [0], act4_bank: [0], act4_insurer: [1],
    act4_name: [2], act4_took: [1, 4], act4_review: [2],
  },
  "Careless (pushes through, overpromises, cuts corners)": {
    act0_start: [2], act0_alerts: [3], act1_plug: [1], act2_chat: [1], act2_customers: [2],
    act2_sam: [1], act2_identity: [2], act2_board: [0], act2_priority: [0], act3_goodsin: [0],
    act3_tell: [2], act3_carehome: [2], act3_desk: [2], act4_bank: [0], act4_insurer: [2],
    act4_name: [2], act4_took: [0, 5], act4_review: [2],
  },
};

function lo(id) { return STATS[id].min != null ? STATS[id].min : 0; }
function hi(id) { return STATS[id].max != null ? STATS[id].max : 100; }
function statsOf(step, flags, stats) { return typeof step.stats === "function" ? step.stats(flags, stats) : step.stats || {}; }
function short(s) { return "Inf " + s.internalInfluence + " · Team " + s.teamHealth + " · You " + s.playerHealth; }

var verbose = process.argv.indexOf("-v") >= 0;
Object.keys(PERSONAS).forEach(function (name) {
  var prefs = PERSONAS[name];
  var st = { node: START_NODE, days: 0, stats: {}, flags: {}, deadline: null, silence: null }, lastAct = "", acts = [], low = {}, overruled = [], picks = [];
  for (var id in STATS) { st.stats[id] = STATS[id].start; low[id] = STATS[id].start; }
  var ended = null;
  for (var g = 0; g < 200 && !ended; g++) {
    var node = GAME_NODES[st.node];
    if (node.silence === "start" && st.silence == null) st.silence = st.days;
    if (node.deadline && !st.deadline) st.deadline = { day: st.days + node.deadline };
    if (typeof CASH !== "undefined" && st.node === CASH.from) st.flags.cashKnown = true;
    var nd = typeof node.date === "function" ? node.date(st.flags) : node.date;
    if (nd && st.silence != null) st.days = st.silence + Math.round((Date.parse(nd) - Date.parse(BLACKOUT_DATE)) / 86400000);
    if (node.act !== lastAct) { if (lastAct) acts.push(lastAct.split(":")[0] + ": " + short(st.stats)); lastAct = node.act; }
    var step = node;
    if (node.type !== "interlude") {
      var open = function (c) {
        if (c.when && !c.when(st.flags)) return false;
        for (var k in c.needs || {}) if (st.stats[k] < c.needs[k]) return false;
        return true;
      };
      var list = (prefs[st.node] || []).concat(node.choices.map(function (_, i) { return i; }));
      var idx = list.filter(function (i) { return node.choices[i] && open(node.choices[i]); })[0];
      var c = node.choices[idx];
      if ((prefs[st.node] || [])[0] !== idx) picks.push(node.title + " (fell back to option " + (idx + 1) + ")");
      step = c;
      if (c.overruled && st.stats.internalInfluence < c.carries) { step = Object.assign({}, c, c.overruled); overruled.push(node.title); }
    }
    var startDay = st.days;
    delete st.flags.leaked_new;
    st.days += step.days || 0;
    var s = statsOf(step, st.flags, st.stats);
    if (process.argv.indexOf("-t") >= 0 && process.argv.indexOf(name.split(" ")[0]) >= 0 && Object.keys(s).some(function (k) { return k !== "service" && s[k]; })) console.log("     " + node.title + " " + JSON.stringify(s).replace(/internalInfluence/g, "inf").replace(/teamHealth/g, "team").replace(/playerHealth/g, "you").replace(/\"service\":-?\d+,?/, ""));
    for (var k2 in s) { st.stats[k2] = Math.max(lo(k2), Math.min(hi(k2), st.stats[k2] + s[k2])); low[k2] = Math.min(low[k2], st.stats[k2]); }
    if (step.set) st.flags[step.set] = true;
    if (step.deadlineShift && st.deadline) st.deadline.day = Math.max(startDay + 1, st.deadline.day + step.deadlineShift);
    if (step.stopDeadline && st.deadline) st.deadline.done = true;
    if (st.deadline && !st.deadline.done && st.days >= st.deadline.day) {
      st.deadline.done = true; st.flags.leaked = st.flags.leaked_new = true;
      for (var d in DEADLINE.stats) { st.stats[d] = Math.max(lo(d), st.stats[d] + DEADLINE.stats[d]); low[d] = Math.min(low[d], st.stats[d]); }
    }
    for (var e in EARLY_ENDINGS) if (st.stats[e] <= lo(e)) { ended = "EARLY: " + EARLY_ENDINGS[e].title + " at " + node.title + " (" + node.act.split(":")[0] + ")"; break; }
    var next = step.nextNode || step.next;
    if (typeof next === "function") next = next(st.flags);
    if (!ended && !GAME_NODES[next]) ended = ENDINGS.filter(function (x) { return x.test(st.stats, st.flags); })[0].title;
    st.node = next;
  }
  console.log("\n" + name);
  if (verbose) acts.forEach(function (a) { console.log("   " + a); });
  console.log("   final:  " + short(st.stats) + "   lowest: " + short(low));
  console.log("   ending: " + ended);
  if (overruled.length) console.log("   overruled at: " + overruled.join(", "));
  if (picks.length) console.log("   locked out of first choice at: " + picks.join(", "));
});
