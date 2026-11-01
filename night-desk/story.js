// Breach Inc.: Outage. A working draft of the second scenario, a ransomware
// outage at a regional distributor. Same engine and conventions as the first
// game: scenes keyed by id, each choice saying where it leads, how many days
// it takes, how it moves the stats and what happened. Interludes are in
// interludes.js.
//
// Everything here is anonymised: the company, people, places and dates are
// fictional or generic, and the events are a composite.

var STATS = {
  internalInfluence: { label: "Influence", start: 50 }, // fourteen years of goodwill
  teamHealth: { label: "Team health", start: 65 }, // a team you've led for years
  playerHealth: { label: "Your health", start: 100 },
  // How much of the company's service is running. It falls to nothing in
  // the blackout, and climbs back far more slowly than anyone wants.
  service: { label: "Service", start: 100, unit: "%" },
};

var START_NODE = "i_career";

// The day the screens go black: Day 1. Dates elsewhere are written the same
// way (the year is never shown; it only fixes the days of the week).
var BLACKOUT_DATE = "2025-12-05";

// The counter that runs from the blackout: in the first game it was the
// days you couldn't tell anyone.
var COUNTER = {
  label: "Days offline",
  summary: function (days) {
    return " ACME Logistics was offline for " + days + (days === 1 ? " day" : " days") + " of them.";
  },
};

// Choices that need extra spend can only be picked with this much Influence.
var BUDGET_INFLUENCE = 45;

// Recommending the board go against the room needs this much Influence.
var BOARD_INFLUENCE = 40;

// The Service a full night run needs, at the end of Act 3.
var SERVICE_FULL = 60;

// The attackers' timer. Unlike Legal's date in the first game, nothing is
// squeezed into nights: when it passes, the stolen data is published, and
// `leaked` is set (with `leaked_new` for the one screen that breaks it).
var DEADLINE = {
  label: "Their timer",
  passes: true,
  set: "leaked",
  warn: "their timer runs out",
  stats: { internalInfluence: -10, teamHealth: -5, playerHealth: -5 },
  // How the timer looks on the screen after it ends: [value, note].
  ended: {
    passed: ["Ran out", "the stolen data is published"],
    stopped: ["Stopped", "the ransom was paid"],
  },
  log: {
    title: "Their timer",
    outcome: "The countdown ran out, and ACME Logistics went up on the attackers' site, with a sample of what they took.",
  },
};

// How quickly the rebuild can go, from 0 to 2: depots that only need
// checking (the plug was pulled), and restore timings that are known (the
// tests were run). The board's estimate and the last rebuild's date both
// come from this, so the estimate is a promise the story keeps.
function rebuildSpeed(flags) {
  return (flags.isolated ? 1 : 0) + (flags.restore_tested ? 1 : 0);
}

// The news of the leak, on whichever screen comes first after it.
function leakNews(flags) {
  return flags.leaked_new
    ? "The countdown on the attackers' site has run out. ACME Logistics is on their list of victims now, with a sample of what they took: delivery contracts, customer addresses, and the payroll, bank details and all."
    : null;
}

// The company's cash, from the night the board hear the number. Nothing is
// invoiced while the screens are dark, so it runs out in the new year: how
// soon depends on the supermarket contract the migration was meant to win,
// and on what's paid out in the meantime. Then the overdraft carries the
// company until the insurer pays for the lost business. Days are counted
// from the blackout (0 is Friday 5 December).
var CASH = {
  label: "Company liquidity remaining",
  // Shorter, for the cost line on a choice: "liquidity −4 days".
  cost: "liquidity",
  // Shown at the top of the screen where it first appears.
  intro: "Nothing has been invoiced since the screens went, so almost no money is coming in, while wages, fuel and suppliers still have to be paid. This is how long the company's cash will last. From here on, it's the clock that matters most.",
  from: "act2_board",
  // The day it runs out.
  out: function (flags) {
    // Thursday 15, 22 or 29 January, by the supermarket's advance.
    var day = flags.restore_tested ? 41 : flags.restore_hq ? 48 : 55;
    // The insurer's early payment, with nothing to argue about.
    if (flags.restore_tested && flags.monitoring) day += 7;
    if (flags.first_payroll) day -= 3; // December's overtime
    if (flags.paid_suppliers) day -= 4;
    if (flags.goodsin_strict) day += 2;
    if (flags.competitor) day -= 3;
    return day;
  },
  // The day the insurer's first payment for lost business arrives, once
  // there is one: mid-January, or 2 March, 16 March or 17 April.
  paid: function (flags) {
    if (flags.restore_tested && flags.monitoring) return 40;
    if (flags.insurer_board) return 87;
    if (flags.insurer_open) return 101;
    if (flags.insurer_fight) return 133;
    return null;
  },
};

// On the path where the insurer pays nothing until April, the job cuts land
// on top of whatever is decided in March.
function withCuts(stats) {
  return function (flags) {
    if (!flags.insurer_fight) return stats;
    var cut = {};
    for (var id in stats) cut[id] = stats[id];
    cut.teamHealth = (cut.teamHealth || 0) - 10;
    cut.playerHealth = (cut.playerHealth || 0) - 5;
    return cut;
  };
}

// After What They Took: the last system, if it's due at the end of March.
function afterTook(flags) {
  return rebuildSpeed(flags) === 1 ? "i_lastsystem" : "act4_review";
}

// A day counted from the blackout, as a date, and as the name of its day.
function blackoutPlus(days) {
  return new Date(Date.parse(BLACKOUT_DATE) + days * 86400000).toISOString().slice(0, 10);
}
function weekday(days) {
  return new Date(Date.parse(BLACKOUT_DATE) + days * 86400000).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
}

var GAME_NODES = {
  act0_start: {
    act: "Act 0: Business as Usual",
    date: "2025-10-06",
    time: "11:15",
    title: "Eight Weeks to Peak",
    text: [
      "ACME Logistics delivers the things people can't go without for long. Every night, four hundred lorries leave three depots with medicines for pharmacies, food and dressings for care homes, and stock for the region's high streets. Most of the people who depend on it have never heard of you. They just know the van comes. In the fourteen years since you started on the loading bays, there hasn't been a night when the lorries didn't leave.",
      "Everything runs on the warehouse system: every order, every stock count, every route. Without it, the lorries don't know where to go. And with fuel prices squeezing thin margins, when the technology already works, it's hard to make the case for spending more on it.",
      "Your big project this year has been the backups. For nine years, each site kept its own copies, on the system you designed as a young engineer. Now they're all in one place, so any site can be brought back. Two steps are left: prove it, by restoring each site in full against the clock; then lock it down, so no copy can be changed or deleted, not even by an administrator. Peak's change freeze means the lockdown waits until January either way.",
      "Then the Chief Operating Officer calls you in. The board's flagship programme, moving the warehouse system to a new platform, has to be live before peak, eight weeks away, and it's behind. If it's live in time, a supermarket chain will move its peak overflow to ACME Logistics, paid in advance: the biggest new contract in years. They need your best engineers from Monday.",
      "The engineers who'd run the restore tests are the same ones the migration needs. What do you do?",
    ],
    choices: [
      {
        text: "Hold your ground: run the full restore tests now, at every site, ready to lock down in January.",
        nextNode: "i_nightdesk",
        days: 10,
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        set: "restore_tested",
        outcome: "The Chief Operating Officer takes it to the Chief Executive, and the migration slips past peak. The supermarket takes its overflow to a competitor. Your tests find two depots whose copies were missing a database, and show that a full restore of headquarters takes four days, far longer than anyone guessed. You fix the gaps, write the numbers down, and book the lockdown for the first week of January.",
      },
      {
        text: "Split the difference: test headquarters now, then hand your engineers over. The depots wait for January.",
        nextNode: "i_nightdesk",
        days: 7,
        stats: { teamHealth: -10, playerHealth: -5 },
        set: "restore_hq",
        outcome: "Your engineers give up two weekends to finish the headquarters test before Monday. It works, slowly: four days for a full restore. The depot tests go on January's list, ahead of the lockdown, and the migration goes live a week before peak. The supermarket signs, for half the volume, until the new system has proved itself.",
      },
      {
        text: "Back the flagship: pause the backups now, and test and lock them down in January.",
        nextNode: "i_nightdesk",
        days: 5,
        stats: { internalInfluence: 10, teamHealth: -5 },
        outcome: "The new warehouse system goes live two weeks before peak, the supermarket signs for everything it offered, and the Chief Operating Officer thanks your team by name at the board. The copies are all in one place now. Nobody has tried bringing a site back from them.",
      },
    ],
  },

  act0_alerts: {
    act: "Act 0: Business as Usual",
    date: "2025-10-27",
    time: "09:30",
    title: "Nobody Watching at Night",
    text: [
      "You raise the unread alerts at Monday's leadership meeting. Your security lead is blunt: three people can cover the working day, but not the nights, the weekends or peak season.",
      "The tool flags something most nights. Most of it is nothing. Some of it might not be. Until someone looks, nobody knows which.",
      "The Finance Director reminds the room that fuel is up again this month, and the flagship programme is already over budget.",
      "Peak starts in five weeks. What do you do about the nights?",
    ],
    choices: [
      {
        text: "Call in some favours and risk going over budget to buy a round-the-clock monitoring service: specialists who watch the alerts all night, and call you if something looks wrong.",
        nextNode: "i_peak",
        days: 5,
        needs: { internalInfluence: BUDGET_INFLUENCE },
        stats: { internalInfluence: -10, teamHealth: 5 },
        set: "monitoring",
        outcome: "It takes two lunches, a favour you'd been saving for years, and a promise to find the money elsewhere by March. The Finance Director signs it off with a sigh. The service starts two weeks later, with your mobile number at the top of its call list.",
      },
      {
        text: "Ask the night helpdesk to keep an eye on the alerts, with a one-page guide and your number for anything serious.",
        nextNode: "i_peak",
        days: 2,
        stats: { teamHealth: -5 },
        set: "helpdesk_watch",
        outcome: "The night helpdesk take it on without complaint. Sam prints the guide and pins it above their desk.",
      },
      {
        text: "Switch the security tool from watching to blocking. It costs nothing, but last time it stopped the picking scanners, and out of hours the only person there to spot a wrong block and undo it is whoever's on the night helpdesk.",
        nextNode: "i_peak",
        days: 1,
        stats: { teamHealth: -5 },
        set: "blocking",
        outcome: "Your security lead switches it over on Thursday night. In the first week it stops a few things that should be stopped, and a few that shouldn't. Each time, the night helpdesk is the only one awake to decide what to do.",
      },
      {
        text: "Get through peak first, and make the case for proper cover in January.",
        nextNode: "i_peak",
        days: 0,
        stats: { internalInfluence: 5 },
        outcome: "The alerts keep arriving each night. Each morning, the security team read the ones they have time for.",
      },
    ],
  },

  act1_plug: {
    act: "Act 1: Lights Out",
    time: "15:52",
    title: "Pull the Plug",
    // The days offline start counting here, and so does their timer:
    // 72 hours from the blackout.
    silence: "start",
    deadline: 3,
    text: function (flags) {
      return [
        "15:52. The IT floor is chaos. Half the screens are black, and the other half show the same page of white text. Your phone hasn't stopped since the screens went.",
        // Paying for night cover buys expert advice at the moment it counts.
        flags.monitoring
          ? "The monitoring service has been calling since 15:41. From headquarters, they can see the attack reaching out across the network, probing machines at all three depots. Nothing there is scrambled yet. Their advice is clear: cut the depots off now, while they're still clean."
          : null,
        "Your security lead has the facts so far, and there aren't many. Something is spreading from machine to machine, scrambling files as it goes, faster than anyone can follow. Headquarters is mostly gone. The depots' screens are still working, for now.",
        "The Chief Operating Officer arrives, out of breath. 'Tonight's run is the biggest of the year. Six hundred care homes. Eleven hundred pharmacies, in the middle of a flu wave. If the depots go down, those deliveries don't happen. Can we keep them running?'",
        "Nobody knows what's already infected. Cutting everything off the network, depots included, might stop it spreading. It would certainly stop tonight's deliveries.",
        "The Chief Executive turns to you. 'You know these systems better than anyone. What do we do?'",
        "'We can't just switch the company off,' the Chief Operating Officer says, to the room rather than to you.",
      ].filter(Boolean);
    },
    // Act 2 pays this off: pulling the plug keeps the depots' warehouse
    // systems clean, so service comes back weeks sooner. Keeping the depots
    // on loses them at 19:20, and waiting loses them at 17:05.
    choices: [
      {
        text: "Pull the plug on everything, depots included: stop it spreading, and accept that tonight's deliveries won't leave.",
        nextNode: "i_warroom",
        days: 0,
        // With the monitoring service's advice behind you, it costs less.
        stats: function (flags) {
          return flags.monitoring ? { playerHealth: -5 } : { internalInfluence: -5, playerHealth: -5 };
        },
        set: "isolated",
        outcome: "You walk to the server room yourself and start pulling cables. By 16:30, the company is offline. Tonight's lorries stay in the yard, and the Chief Operating Officer doesn't speak to you for the rest of the evening.",
      },
      {
        text: "Cut off headquarters, but keep the depots connected so tonight's run can go. Watch them closely, and pull them if anything changes.",
        nextNode: "i_warroom",
        days: 0,
        stats: { internalInfluence: 5, playerHealth: -5 },
        set: "depots_on",
        outcome: "Headquarters goes dark on purpose at 16:10. The depots keep picking, and the first lorries leave on time. For three hours, it looks like the right call.",
      },
      {
        text: "Hold for an hour: get advice from the insurer's response experts before doing anything that can't be undone.",
        nextNode: "i_warroom",
        days: 0,
        stats: { playerHealth: -5 },
        set: "waited",
        outcome: "It takes forty minutes to find the insurer's hotline number. By the time an expert calls back, the decision has been made for you.",
      },
    ],
  },
  act2_chat: {
    act: "Act 2: The Price",
    time: "11:30",
    title: "The Chat",
    text: [
      "The negotiator explains how this works. The people on the other end run it like a business, because it is one. They have a reputation to keep: if they took the money and didn't deliver, nobody would pay them next time.",
      "The timer on their site counts down to the moment they start publishing what they took. They haven't said yet what that is. Groups like this will often stretch the timer for a customer who's talking, the negotiator says. They stop stretching it for one who isn't.",
      "'Whatever we say next,' the negotiator says, 'they'll read it as a signal.' The Chief Executive asks what you'd recommend.",
    ],
    choices: [
      {
        text: "Keep them talking through the negotiator: ask questions, ask for time, and promise nothing.",
        nextNode: "i_backups",
        days: 1,
        deadlineShift: 4,
        stats: { internalInfluence: -5, playerHealth: -5 },
        set: "talking",
        outcome: "The support manager is happy to talk. They give you four more days 'as a gesture of good faith', and ask, in passing, whether your insurance covers this. Two of the board ask afterwards why you're negotiating with criminals.",
      },
      {
        text: "Ask for proof that they have the data, before saying anything else.",
        nextNode: "i_backups",
        days: 1,
        deadlineShift: 1,
        stats: { playerHealth: -10 },
        set: "proof",
        outcome: "Within the hour, they send twenty files. One is a page from the payroll: names, addresses and bank details for staff from every site. You know half the names. They give you one more day to look.",
      },
      {
        text: "Say nothing for now: assess the damage first, and give them nothing to work with.",
        nextNode: "i_backups",
        days: 1,
        stats: { internalInfluence: 5 },
        set: "silent",
        outcome: "The chat stays open on the negotiator's laptop, with no reply. On Sunday night, the support manager sends one more message: 'We are still here. The timer is not.'",
      },
    ],
  },

  // Sunday evening: with the backups gone, nothing is coming back quickly,
  // and the customers will ring in the morning.
  act2_customers: {
    act: "Act 2: The Price",
    time: "18:30",
    title: "What Do We Tell Them?",
    text: function (flags) {
      return [
        leakNews(flags),
        "At half past six, the Chief Executive calls the leadership team into their office. Nobody needs telling what the backups mean: nothing is coming back quickly.",
        "Tomorrow morning, eleven hundred pharmacies, six hundred care homes and the supermarkets on the region's high streets will ring to ask where their deliveries are. So will the local paper. The customer service team have a whiteboard, a printed list of phone numbers and one working line.",
        flags.isolated
          ? "The depots can start on Friday's orders by hand. Beyond that, nobody can say when anything will move."
          : "Nobody can say when anything will move.",
        "Legal want as little said as possible until the investigators know more. The Chief Operating Officer wants to protect the contracts. The Chief Executive turns to you. 'What do we tell them?'",
      ].filter(Boolean);
    },
    choices: [
      {
        text: "Recommend the truth: a cyber attack, deliveries on paper where we can manage them, and no date until we have one we can keep.",
        nextNode: "i_nineyears",
        days: 0,
        stats: { internalInfluence: -5, teamHealth: 5 },
        set: "customers_truth",
        // Saying the word before the investigators are ready goes against Legal.
        carries: BOARD_INFLUENCE,
        overruled: {
          stats: {},
          set: "customers_vague",
          outcome: "Legal win: 'a technical issue', and nothing more until the investigators are ready. On Monday, the customer service team read it out four hundred times. On Wednesday, a driver tells the local paper the real word.",
        },
        outcome: "Legal go through the wording line by line until midnight. On Monday, the customer service team read it out four hundred times. Most customers are angry, and most of them ring back on Tuesday to place an order on paper.",
      },
      {
        text: "Recommend 'a technical issue': we're working to restore services as soon as possible, and we'll say more when the investigators know more.",
        nextNode: "i_nineyears",
        days: 0,
        stats: { internalInfluence: 5 },
        set: "customers_vague",
        outcome: "It buys a quiet Monday. On Wednesday, a driver tells the local paper the real word, and the customer service team spend the rest of the week explaining why they said otherwise.",
      },
      {
        text: "Recommend giving them a date: deliveries back to normal within a week. Customers need something to plan around.",
        nextNode: "i_nineyears",
        days: 0,
        stats: { internalInfluence: 10, playerHealth: -5 },
        set: "customers_date",
        outcome: "Customers are reassured, and the Chief Operating Officer shakes your hand on the way out. You lie awake working out what a week would take, and the sums don't add up.",
      },
    ],
  },

  act2_priority: {
    act: "Act 2: The Price",
    time: "18:00",
    title: "What Comes Back First?",
    text: function (flags) {
      return [
        leakNews(flags),
        flags.isolated
          ? "The depots have been running on their own since Monday, on clean systems that still hold Friday's orders and the standing orders care homes and pharmacies place every week. It's about half a normal night, with routes planned by hand on the canteen wall, and nobody can invoice for any of it."
          : "Since Sunday, a handful of lorries have gone out every night on paper, with orders phoned in and pick lists written by hand. It's a fraction of a normal night, nobody knows what's in stock until someone walks the aisles, and nobody can invoice for any of it.",
        "On Friday afternoon, the lead investigator signs off the new network. They know how the attackers got in, every account has been reset, and the way back in is closed. Systems can start moving across from the tapes, one at a time, each one checked on the way in. The new network runs on rented servers and borrowed laptops: the old machines are evidence now, and new ones won't arrive until January. In the next week, there's time to restore one thing properly. Everything else waits.",
        "The Chief Operating Officer wants the warehouse system: without it, the lorries don't know where to go. The Finance Director wants payroll rebuilt, from March's tapes, the bank's records and peak week's paper timesheets.",
        "Without payroll, the bank can repeat November's payment run next Friday, so everyone gets their basic pay, and the handful who started this month are paid by hand. But nobody gets the double overtime they worked all through peak, and next Friday is the last payday before Christmas.",
        "And the care home manager has rung for the fourth time.",
        "At six, the Chief Executive asks for your recommendation. It's their decision, and they lean towards the lorries.",
      ].filter(Boolean);
    },
    choices: [
      {
        text: "Recommend the warehouse system: get the lorries moving again, even on printed routes.",
        nextNode: "i_week",
        days: 2,
        stats: { service: 20, teamHealth: -10, internalInfluence: 5 },
        set: "first_warehouse",
        outcome: "By Monday, the routes taped to every dashboard at the northern depot are printed from the warehouse system, not written by hand. The warehouse floor learns that next Friday, the bank will repeat November's pay run, and their peak-week overtime won't be paid until the new year.",
      },
      {
        text: "Recommend payroll: the people who carried peak week get their overtime before the holidays.",
        nextNode: "i_week",
        days: 2,
        stats: { service: 5, teamHealth: 10, internalInfluence: -5 },
        set: "first_payroll",
        carries: BOARD_INFLUENCE,
        overruled: {
          stats: { service: 20, teamHealth: -5 },
          set: "first_warehouse",
          outcome: "The Chief Executive hears you out, then goes with the lorries. By Monday, the routes taped to every dashboard at the northern depot are printed from the warehouse system. Next Friday, the bank will repeat November's pay run, without the peak-week overtime. The Finance Director catches your eye across the table, and shrugs: you tried.",
        },
        outcome: "Payroll comes back from the tapes, and the overtime is worked out by hand from a box of timesheets, ready for next Friday. The lorries are still in the yard.",
      },
      {
        text: "Call in favours, and recommend putting pharmacy and care home orders first: a cut-down service for the people who can least afford to wait, over the heads of the Chief Operating Officer and the Finance Director.",
        nextNode: "i_week",
        days: 2,
        stats: { service: 10, internalInfluence: -10 },
        set: "first_vulnerable",
        // Going over two directors' heads takes more standing.
        carries: BUDGET_INFLUENCE,
        overruled: {
          stats: { service: 20, teamHealth: -10 },
          set: "first_warehouse",
          outcome: "The Chief Executive is sympathetic, and goes with the lorries: 'If everything moves, the pharmacies move too.' By Monday, the routes taped to every dashboard at the northern depot are printed from the warehouse system. The Chief Operating Officer knows exactly whose heads you tried to go over.",
        },
        outcome: "Your engineers build a proper order list for pharmacies and care homes from the restored copies, and from Sunday night, medicines and dressings go out first, every night, in full. The care home manager doesn't ring on Monday. Next Friday, the bank will repeat November's pay run, without the peak-week overtime.",
      },
    ],
  },

  act2_sam: {
    act: "Act 2: The Price",
    time: "10:30",
    title: "Before Two O'Clock",
    text: function (flags) {
      return [
        leakNews(flags),
        "HR have been told. Their advice is the standard advice: Sam should be suspended on full pay while the investigation runs. It protects the investigation, they say, and it protects Sam.",
        "You think about the warehouse floor two years ago, the jammed scanner, and the coffee you didn't ask for.",
        "It's half past ten. What do you do?",
      ].filter(Boolean);
    },
    choices: [
      {
        text: "Tell Sam yourself, now, before anyone else does: what happened, that it wasn't theirs alone, and that you'll be in the interview with them.",
        nextNode: "act2_identity",
        days: 1,
        stats: { teamHealth: 10, internalInfluence: -5 },
        set: "told_sam",
        outcome: "Sam goes white, then asks if anyone was hurt. You sit with them until two. HR are furious that you went first, and tell the Chief Operating Officer so.",
      },
      {
        text: "Let HR and the investigators follow the process, so the investigation is fair and nobody can say it was mishandled.",
        nextNode: "act2_identity",
        days: 1,
        stats: { teamHealth: -10, internalInfluence: 5, playerHealth: -10 },
        set: "sam_suspended",
        outcome: "Sam is called into a meeting room at two and walked out of the building at three, with their lanyard in an envelope. Nobody tells the night helpdesk why. By the evening, everyone knows anyway.",
      },
      {
        text: "Move Sam quietly to the eastern depot's helpdesk until it's over, out of the line of fire.",
        nextNode: "act2_identity",
        days: 1,
        needs: { internalInfluence: BUDGET_INFLUENCE },
        needsFor: "to overrule HR",
        stats: { teamHealth: 5, internalInfluence: -10 },
        set: "sam_moved",
        outcome: "HR agree, reluctantly, because it's you asking. Sam goes to the eastern depot without being told why, and works there as hard as they've ever worked. If it ever comes out, it will look like a cover-up.",
      },
    ],
  },

  act2_identity: {
    act: "Act 2: The Price",
    time: "08:15",
    title: "Every Account",
    text: function (flags) {
      return [
        leakNews(flags),
        "Before anyone can work on the new network, all eleven hundred people at ACME Logistics need a new login, checked and issued one at a time. The attackers had an administrator's keys, so the investigators treat every account in the company as theirs.",
        "After 01:20, everyone knows how it was done last time: a voice on the phone, and a helpdesk that wanted to help." +
          (flags.sam_suspended ? " The night helpdesk is one person short." : flags.sam_moved ? " Sam is at the eastern depot, and the night helpdesk is one person short." : ""),
        "Half the warehouse staff work shifts that never overlap with an office. Orders are still coming in by phone. How do you do it?",
      ].filter(Boolean);
    },
    choices: [
      {
        text: "In person, with photo ID, at every site and on every shift: nobody gets a new login without being seen.",
        nextNode: "act2_board",
        days: 1,
        stats: { teamHealth: -10, playerHealth: -5, service: -5 },
        set: "reset_inperson",
        outcome: "It takes three days and nights. Your team set up tables in canteens and on loading bays at two in the morning, and check eleven hundred faces against eleven hundred badges. A driver turned away for forgetting their ID calls it a police state. The lead investigator calls it the first thing that's gone right.",
      },
      {
        text: "Managers vouch for their own people: each confirms their team face to face, and the helpdesk only resets names on a manager's signed list.",
        nextNode: "act2_board",
        days: 1,
        stats: { teamHealth: -5, internalInfluence: -5 },
        set: "reset_managers",
        outcome: "Most managers do it properly, and it's quicker: the checking happens where people know each other's faces. Two lists come back signed without anyone being seen, and one of the names on them left the company in the summer. The investigators find it, and both managers start again.",
      },
      {
        text: "Speed first: text everyone a reset link at the mobile number HR holds, and let the helpdesk sort out anyone it misses.",
        nextNode: "act2_board",
        days: 1,
        stats: { service: 10, teamHealth: -10, internalInfluence: -5 },
        set: "reset_text",
        outcome: "Three quarters of the company are back in by the morning. The numbers came off March's tapes, so the rest ring the helpdesk, four hundred of them, and the helpdesk resets passwords over the phone for anyone who sounds right, exactly as it did at 01:20. The lead investigator reads the call log, and asks whether you've read their report.",
      },
    ],
  },

  act2_board: {
    act: "Act 2: The Price",
    time: "17:30",
    title: "The Board",
    text: function (flags, stats, left) {
      // How long a rebuild would take, from everything that went right.
      var good = rebuildSpeed(flags);
      return [
        leakNews(flags),
        "The board meet in the Chief Executive's office, around a screen borrowed from a supplier. The negotiator, the lead investigator and the insurer's lawyer join by phone.",
        "The new network should be signed off tomorrow. Your estimate from there, without paying: " +
          (good === 2
            ? "the warehouse system and orders by Christmas, most of headquarters by mid-January, and everything by the end of February."
            : good === 1
              ? "the warehouse system and orders in the new year, most of headquarters by early February, and everything by the end of March."
              : "the warehouse system by late January, and everything else by May, at best."),
        "Then the Finance Director gives the number nobody wants. Nothing has been invoiced since the screens went, so almost nothing is coming in, while wages, fuel and suppliers still have to be paid. At this rate, the cash runs out in about " +
          ["five", "six", "seven", "eight"][Math.round((CASH.out(flags) - 6) / 7) - 5] + " weeks" +
          (flags.restore_tested
            ? "."
            : ", and that's with the supermarket's advance for peak in the bank. Without it, it would be " + (flags.restore_hq ? "a week" : "two weeks") + " less.") +
          " The insurance will pay, eventually, but not before then.",
        "Paying might be faster, the negotiator says, but not by much: decryption tools are slow, and some systems never come back from them. Law enforcement's advice is not to pay. The insurer will only cover a payment if a sanctions check on the group comes back clear, and that takes days.",
        flags.leaked
          ? "The data is already out. Paying now would buy a decryption tool, and nothing else."
          : (left == null ? "Their timer is still running." : "Their timer has " + (left === 1 ? "one day" : left + " days") + " left.") +
            " They've promised, as businesses do, to delete everything they took once they're paid.",
        "The Chief Executive wants the lorries moving before the holidays, and says so. 'If paying gets us there, I can live with it.' Then they turn to you.",
      ].filter(Boolean);
    },
    choices: [
      {
        // Without the standing to argue the room round, paying isn't your
        // recommendation: it's the majority's, and you go along with it.
        text: function (flags, stats) {
          return stats.internalInfluence < BOARD_INFLUENCE
            ? "Go with the majority and pay. You haven't the standing to turn the room, and paying gets the business back sooner."
            : "Recommend paying: get the business back sooner, and keep whatever you can off their site.";
        },
        nextNode: "act2_priority",
        days: 1,
        stopDeadline: true,
        stats: { internalInfluence: 5, playerHealth: -5 },
        set: "paid",
        outcome: "The sanctions check comes back clear, and the money goes two days later. The decryption tool arrives within the hour, from a support manager who thanks you for your business. The investigators take it apart for two days before anyone is allowed to run it.",
      },
      {
        text: "Recommend refusing: rebuild from what you have, and accept that the data will be published.",
        nextNode: "act2_priority",
        days: 1,
        needs: { internalInfluence: BOARD_INFLUENCE },
        needsFor: "to carry the room",
        stats: { internalInfluence: -5, teamHealth: 5 },
        set: "refused",
        outcome: "It takes an hour, and the Finance Director votes against. The negotiator closes the chat without a reply. Your engineers hear the news at midnight, cheer, and get back to work.",
      },
      {
        text: "Recommend paying only to stop the leak, and rebuild everything else yourselves.",
        when: function (flags) { return !flags.leaked; },
        nextNode: "act2_priority",
        days: 1,
        stopDeadline: true,
        needs: { internalInfluence: BOARD_INFLUENCE },
        needsFor: "to carry the room",
        stats: { internalInfluence: -10, playerHealth: -5 },
        set: "paid_leak",
        outcome: "The board agree on the third vote. The negotiator talks the price down to £2.1 million for deletion alone. The support manager sends a video of files being deleted. There's no way to know whether they were the only copies.",
      },
    ],
  },
  act3_goodsin: {
    act: "Act 3: Paper and Pens",
    time: "10:00",
    title: "Goods In",
    text: function (flags) {
      return [
        leakNews(flags),
        "At ten, a lorry from a dressings maker backs into the goods-in bay at the northern depot: twenty-six pallets, and a delivery note for an order placed in November.",
        "Purchase orders are raised at headquarters, and headquarters' records stop at the end of March. Nobody can say whether this order was placed, what price was agreed, or whether the pallets are needed. And there's no way to pay for it: the finance system is still dark, and the bank details of every supplier added or changed since spring went with it.",
        "The dressings maker's owner rings you while their driver waits. They're a family firm, with forty staff, and you're their biggest customer. 'We've had nothing from you since November. I've got wages to pay on Friday.'",
        "You ring the Chief Operating Officer, who's at the eastern depot with three lorries of their own waiting. 'You're there,' they say. 'It's your call.'",
        "There are thirty more deliveries due this week. What does goods-in do?",
      ].filter(Boolean);
    },
    choices: [
      {
        text: "Take everything in, and match the paperwork later.",
        nextNode: "i_sam3",
        days: 1,
        stats: { service: 5, internalInfluence: -5 },
        set: "goodsin_all",
        outcome: "The bays fill up, and nothing runs short. By January, the warehouse is holding pallets for orders that customers cancelled during the outage, some of them short-dated, and finance spend weeks agreeing prices with suppliers whose paperwork doesn't match anything you have.",
      },
      {
        text: "Only take in what you can match to a customer order on paper, and turn the rest away until the systems are back.",
        nextNode: "i_sam3",
        days: 1,
        stats: { service: -5 },
        set: "goodsin_strict",
        outcome: "Goods-in turns away eleven lorries in two days. Two suppliers put ACME Logistics on stop, and a pharmacy order goes out short of dressings. The dressings maker's owner stops returning your calls.",
      },
      {
        text: "Pay your smallest suppliers by hand: a list on paper, a phone call to confirm each one, and the Finance Director's signature on every payment.",
        nextNode: "i_sam3",
        days: 1,
        needs: { internalInfluence: BUDGET_INFLUENCE },
        needsFor: "to get Finance to sign",
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        set: "paid_suppliers",
        outcome: "The Finance Director signs forty payments over a weekend, from a list you build on paper and check by phone, one supplier at a time. The dressings maker pays their staff on Friday. In February, the reconciliation finds three suppliers paid twice: once by hand, and again when their invoices came back through the restored system.",
      },
    ],
  },

  act3_tell: {
    act: "Act 3: Paper and Pens",
    time: "14:00",
    title: "Telling Them",
    text: function (flags) {
      return [
        leakNews(flags),
        "The lawyers notified the regulator on the first Sunday, inside the seventy-two hours the law allows, with what little anyone knew. Now the investigators have finished counting. The stolen files include the payroll for every member of staff: names, home addresses, bank details and, for some, the passport scans HR took when they joined.",
        flags.leaked
          ? "The files are already on the attackers' site. Some of your staff have already looked."
          : "The files aren't public. Nobody can promise they won't be.",
        "Everyone at ACME Logistics needs to hear this. How is the Chief Executive's call, with HR and Legal, and they want your recommendation first.",
      ].filter(Boolean);
    },
    choices: [
      {
        text: "Recommend telling every site in person, and offer to go to each depot yourself, with what you know and what you don't.",
        nextNode: "i_name",
        days: 2,
        stats: { playerHealth: -10, teamHealth: 15, internalInfluence: -5 },
        set: "told_in_person",
        carries: BOARD_INFLUENCE,
        overruled: {
          days: 0,
          stats: {},
          set: "hr_letter",
          outcome: "The Chief Executive agrees with every word, and goes with HR. The letter goes out on Thursday. It's accurate, careful and completely cold. The night shift pin a copy on the canteen wall, with 'IS THAT IT?' written across the top.",
        },
        outcome: "You do six briefings in two days, in canteens and on loading bays. People are angry, and tell you so, and then they ask what they should do. At the eastern depot, someone brings you a cup of tea halfway through.",
      },
      {
        text: "Recommend a letter from HR, in the lawyers' wording, with a free credit-monitoring offer.",
        nextNode: "i_name",
        days: 0,
        stats: { teamHealth: -5, internalInfluence: 5 },
        set: "hr_letter",
        outcome: "The letter goes out on Thursday. It's accurate, careful and completely cold. The night shift pin a copy on the canteen wall, with 'IS THAT IT?' written across the top.",
      },
      {
        text: "Recommend waiting until the investigation confirms exactly whose data was taken, so nobody is worried unnecessarily.",
        nextNode: "i_name",
        days: 0,
        stats: function (flags) {
          return flags.leaked ? { teamHealth: -15, internalInfluence: -5 } : { internalInfluence: 5 };
        },
        set: "waited_confirm",
        outcome: function (flags) {
          return flags.leaked
            ? "Before the investigation is finished, a driver finds their own bank details in the leaked files and shows the rest of the depot on their phone. By the time the confirmed list arrives, nobody is waiting for it."
            : "Three weeks later, the investigation confirms the list: everyone. The letter that follows is accurate, and late.";
        },
      },
    ],
  },

  act3_carehome: {
    act: "Act 3: Paper and Pens",
    time: "07:00",
    title: "The Care Home",
    text: function (flags) {
      return [
        "The care home manager gets your mobile number from a depot supervisor, and rings you at seven in the morning." +
          (flags.customers_date
            ? " 'You said a week,' they say. It's been nearly a fortnight."
            : flags.customers_vague
              ? " 'A technical issue,' they say. 'I read the paper.'"
              : ""),
        flags.first_vulnerable
          ? "They start by saying thank you: their own order came through, medicines first, just as you promised. Then they tell you about the three homes on the next road, who aren't on your list, and who are down to one day's insulin for three residents."
          : "The flu has reached their home. Three of the residents who've caught it depend on insulin, and being ill pushes up how much they need, so it's running out faster than usual. They have one day's supply left. Their pharmacy can't get more to them. Their pharmacy gets everything from you.",
        "Your restore plan has the medicines run back in two days. In the next room, the depot manager is on the phone to a supermarket, promising them tomorrow.",
        "Handing customers to a competitor would be the Chief Operating Officer's call, and they'd hate it.",
      ];
    },
    choices: [
      {
        text: "Recommend asking a competitor to cover your care home and pharmacy deliveries until you're back.",
        nextNode: "i_news",
        days: 1,
        stats: { internalInfluence: -10 },
        set: "competitor",
        carries: BOARD_INFLUENCE,
        overruled: {
          days: 0,
          stats: { service: 10 },
          set: "plan_overruled",
          outcome: "The Chief Operating Officer won't hear of it: 'Once they're in, they don't leave.' The medicines run stays on the plan, two days out. You ring the care home manager back, and tell them you're sorry.",
        },
        outcome: "The competitor says yes within the hour, and has lorries out that night. The Chief Operating Officer says, to nobody in particular, that some of those customers will never come back.",
      },
      {
        text: "Drive it yourself, tonight.",
        nextNode: "i_news",
        days: 1,
        stats: { playerHealth: -10, teamHealth: 5 },
        set: "drove",
        outcome: "You collect the insulin from the wholesaler at nine, and drive the last forty minutes on roads you haven't driven since your warehouse days. The manager meets you at the door in a dressing gown. Three residents get their insulin. There are hundreds more on lists you can't see.",
      },
      {
        text: "Stick to the plan: the restore schedule serves the most people fastest.",
        nextNode: "i_news",
        days: 0,
        stats: { service: 10 },
        set: "plan",
        outcome: "You tell the manager the medicines run will be back in two days, and that you're sorry. They thank you for being honest, and hang up before you can say anything else.",
      },
    ],
  },

  act3_desk: {
    act: "Act 3: Paper and Pens",
    time: "22:30",
    title: "Under the Desk",
    text: [
      "Your lead infrastructure engineer has slept under their desk for most of the last fortnight. You've told them to go home. They've told you they will, after the next server.",
      "At four in the morning, they restore a clean server onto the old network, the one the attackers were in, and a day's work disappears in a minute. Nobody shouts. They go into the server room and cry where they think nobody can see.",
      "Christmas is days away. Everyone wants the full night run back before then. Everyone is running on nothing.",
    ],
    choices: [
      {
        text: "Send the team home in shifts: nobody in for more than twelve hours, starting with yourself.",
        nextNode: "i_vans",
        days: 2,
        stats: { service: -5, teamHealth: 10, playerHealth: 10, internalInfluence: -5 },
        set: "shifts",
        outcome: "The engineer argues, then sleeps for fourteen hours. You go home at six in the evening for the first time since the screens went, and your partner doesn't know what to do with you. The restores slow down, and the board notice the empty desks a week before Christmas.",
      },
      {
        text: "Bring in the insurer's recovery engineers to take the nights.",
        nextNode: "i_vans",
        days: 2,
        needs: { internalInfluence: BUDGET_INFLUENCE },
        stats: { service: 15, teamHealth: 10, internalInfluence: -10 },
        set: "contractors",
        outcome: "Six strangers arrive with their own coffee and work the nights. Your team hand over at eight each evening, and the restore goes faster than it has all month.",
      },
      {
        text: "Push through to the holidays: one more week, and then everyone rests.",
        nextNode: "i_vans",
        days: 2,
        stats: { service: 20, teamHealth: -20, playerHealth: -10 },
        set: "push",
        outcome: "The servers come back faster than anyone hoped. The engineer stops talking in meetings. On Thursday, a second person cries in the server room, and this time someone sees.",
      },
    ],
  },

  // The cash clock reaches zero: the Monday of the week it runs out.
  act4_bank: {
    act: "Act 4: Rebuild",
    date: function (flags) {
      var out = CASH.out(flags);
      return blackoutPlus(out - ((out - 3) % 7 + 7) % 7);
    },
    time: "09:00",
    title: "The Overdraft",
    text: function (flags) {
      var costs = [
        flags.first_payroll ? "December's overtime" : null,
        flags.paid_suppliers ? "the suppliers you paid by hand" : null,
        flags.competitor ? "the competitor's bill for covering your care homes" : null,
      ].filter(Boolean);
      var out = CASH.out(flags), today = (out - 3) % 7 === 0;
      return [
        today
          ? "The Finance Director's spreadsheet has one cell in red, and it's today's date. Today is the day the cash runs out."
          : "The Finance Director's spreadsheet has one cell in red: " + weekday(out) + ". That's the day the cash runs out.",
        flags.restore_tested && flags.monitoring
          ? (CASH.paid(flags) > out - ((out - 3) % 7 + 7) % 7
            ? "The insurer's first payment for lost business is due on Wednesday, with nothing in the file to argue about. It buys seven days."
            : "The insurer's first payment for lost business arrived last week, with nothing in the file to argue about. It bought seven days.")
          : flags.restore_tested
            ? "The supermarket's peak contract, the one the migration was meant to win, went to a competitor in November. Nobody mentions it."
            : "Without the supermarket's advance for peak, it would have run out " + (flags.restore_hq ? "last week." : "a fortnight ago."),
        costs.length
          ? costs.slice(0, -1).join(", ") + (costs.length > 1 ? " and " : "") + costs[costs.length - 1] + (costs.length > 1 ? " each" : "") + " brought it a few days closer."
          : null,
        "The bank will stretch the overdraft until the insurer pays, on conditions: a higher rate, a cash report every Monday, and a plan by Friday to cut what the company spends by a tenth until the claim is settled. Every head of department has been asked for their share.",
        "IT's share is £150,000 a month. Almost everything IT spends this year is the rebuild." +
          (flags.monitoring ? " The rest is the monitoring service." : " The rest is the night cover the investigators have told you to buy."),
        "Word gets round the depots that the money has run out. It's a frightening week for everyone, and you spend it answering the same question: will we still be paid?",
        "The Finance Director wants your number by Wednesday. Where does it come from?",
      ].filter(Boolean).map(function (t) { return t.charAt(0).toUpperCase() + t.slice(1); });
    },
    choices: [
      {
        text: function (flags) {
          return flags.contractors
            ? "The rebuild: send the insurer's recovery engineers home, and hand back the rented servers as the new ones arrive. Your own team carry the rest."
            : "The rebuild: cancel the extra engineers booked for the spring, and hand back the rented servers as the new ones arrive. Your own team carry the rest.";
        },
        nextNode: "i_newyear",
        days: 2,
        stats: { teamHealth: -15, playerHealth: -5, internalInfluence: 5 },
        set: "cut_rebuild",
        outcome: "The Finance Director thanks you for being first with a number. Your engineers go back to twelve-hour days. The last systems at headquarters will come back on evenings and weekends, from people who have already given theirs.",
      },
      {
        text: function (flags) {
          return flags.monitoring
            ? "The night cover: pause the monitoring service until the insurer pays, and hand the alerts back to the day team for a few months."
            : "The night cover: put off the round-the-clock monitoring until the insurer pays, and leave the alerts with the day team for a few months.";
        },
        nextNode: "i_newyear",
        days: 2,
        stats: { internalInfluence: 5, teamHealth: -10 },
        set: "cover_paused",
        outcome: "It's the easiest saving on the list, and the bank's adviser ticks it without a question. For a few months, nobody will watch the alerts at night. Again. You know exactly how long the attackers needed last time: three days.",
      },
      {
        text: "Neither: tell the board that IT can't cut while the rebuild is running, and that the saving has to come from somewhere else.",
        nextNode: "i_newyear",
        days: 2,
        needs: { internalInfluence: BOARD_INFLUENCE },
        needsFor: "to hold the line",
        stats: { internalInfluence: -10 },
        set: "it_protected",
        outcome: "The board agree, and the saving comes from the agency staff: the thirty people typing up paper delivery notes in finance and counting stock at the depots. They finish on Friday. The Finance Director tells you, without any heat, that the invoices will now go out a month later.",
      },
    ],
  },

  act4_insurer: {
    act: "Act 4: Rebuild",
    date: "2026-02-09",
    time: "11:00",
    title: "The Small Print",
    text: function (flags) {
      var delayed = !flags.restore_tested;
      return [
        "The insurer's lawyers want every document about the decisions made before peak: emails, meeting notes, the lot.",
        delayed
          ? "The question they keep coming back to is question 14 on last year's renewal form: 'Are backups restored and tested at least annually?' The form went out under the Finance Director's name, with answers your team supplied. The answer is yes. It was true when it was written."
          : "Your restore tests are in the file, and they like those. The question they keep coming back to is question 22 on last year's renewal form: 'Are security alerts reviewed around the clock?' The form went out under the Finance Director's name, with answers your team supplied. The answer is yes.",
        delayed
          ? "Your own email is in the bundle too, from eight weeks before peak: 'Agreed. We'll finish the restore tests in January.'"
          : "Your own notes from the Monday meeting are in the bundle too: three people can't cover the nights.",
        "The claim is worth more than the company made last year, and the bank's patience is running out. The Finance Director signs the claim and Legal will write the reply, and both want your recommendation.",
      ];
    },
    choices: [
      {
        text: "Recommend handing over everything as it is, including the emails that show what you knew and when.",
        nextNode: "i_phishing",
        days: 2,
        stats: { internalInfluence: -5, playerHealth: 5 },
        set: "insurer_open",
        carries: BOARD_INFLUENCE,
        overruled: {
          stats: { playerHealth: -5 },
          set: "insurer_board",
          outcome: "Legal thank you for your honesty, and write their own letter: careful, true, and setting it all in context, the board's budget decisions included. At the start of March, the insurer releases its first payment for lost business, at eighty per cent. Your emails are in the bundle anyway.",
        },
        outcome: "The insurer's lawyers read it all, and so does the board. In the middle of March, the insurer releases its first payment for lost business, at seventy per cent of what's been agreed so far. The Finance Director says it could have been worse, and doesn't look at you while they say it. You sleep better than you have since November.",
      },
      {
        text: function (flags) {
          return flags.restore_tested
            ? "Recommend letting Legal set it in context: night cover was the board's budget decision, in a year of rising fuel prices."
            : "Recommend letting Legal set it in context: the delay was the board's decision, for the board's flagship programme.";
        },
        nextNode: "i_phishing",
        days: 2,
        stats: { playerHealth: -5 },
        set: "insurer_board",
        outcome: "Legal's letter is careful, and true. At the start of March, the insurer releases its first payment for lost business, at eighty per cent. The Chief Operating Officer reads the letter twice, and from then on copies their own lawyer into every email they send you.",
      },
      {
        text: "Recommend fighting it: argue that the question was ambiguous, and that the answer was true as everyone understood it.",
        nextNode: "i_phishing",
        days: 2,
        stats: { internalInfluence: 5, playerHealth: -10 },
        set: "insurer_fight",
        outcome: "The argument takes until April, two firms of lawyers and a barrister's opinion, and the insurer pays nothing for lost business until it's over. Then it settles for ninety per cent. By then, the legal fees have eaten most of the difference, and most of your evenings.",
      },
    ],
  },

  act4_name: {
    act: "Act 4: Rebuild",
    date: "2026-02-26",
    time: "14:30",
    title: "A Name for the Board",
    text: function (flags) {
      return [
        "At the board's review of the report, one of the non-executive directors, new this year, puts the summary down. 'Two pages, and not a single name. Our customers, our staff and the regulator will all ask the same question: who was responsible? I'd like the report to answer it.'",
        flags.sam_suspended
          ? "Sam has been suspended for eleven weeks. HR's investigation is finished, and their findings are on the table too, waiting for this meeting."
          : flags.sam_moved
            ? "Sam is still at the eastern depot. Everyone at headquarters knows why by now, and HR's findings are on the table, waiting for this meeting."
            : "Sam is back on the night helpdesk. HR's findings are on the table, waiting for this meeting.",
        "Nobody says the word 'helpdesk'. Everybody looks at you.",
      ];
    },
    choices: [
      {
        text: "Name the process, not a person: nobody had the cover, the checks or the training to stop a call like that, and fixing that is the board's job and yours.",
        nextNode: function (flags) { return rebuildSpeed(flags) === 2 ? "i_lastsystem" : "act4_took"; },
        days: 1,
        needs: { internalInfluence: BOARD_INFLUENCE },
        needsFor: "to hold the room",
        stats: { internalInfluence: -5, teamHealth: 10 },
        set: "named_process",
        outcome: "It takes most of the meeting. The non-executive director doesn't change their mind, but the Chief Executive does, and the report goes out with recommendations instead of a name. Sam hears about it the next morning, from three people at once.",
      },
      {
        text: "Put your own name to it: the helpdesk, the security team and the backups were all yours.",
        nextNode: function (flags) { return rebuildSpeed(flags) === 2 ? "i_lastsystem" : "act4_took"; },
        days: 1,
        stats: { internalInfluence: -10, playerHealth: -10, teamHealth: 10 },
        set: "named_self",
        outcome: "The minutes record it in one sentence. The non-executive director thanks you for your candour. Afterwards, in the car park, the Chief Operating Officer tells you it was the bravest thing they've seen in a boardroom, and the most stupid.",
      },
      {
        text: "Leave it to HR: it's their process, and their findings.",
        nextNode: function (flags) { return rebuildSpeed(flags) === 2 ? "i_lastsystem" : "act4_took"; },
        days: 1,
        stats: { internalInfluence: 5, teamHealth: -15 },
        set: "named_hr",
        outcome: function (flags) {
          return flags.sam_suspended
            ? "HR's findings name the helpdesk analyst who reset the password. Sam is given a final written warning, and resigns a week later. Their leaving card goes round the night helpdesk, and fills both sides."
            : flags.sam_moved
              ? "HR's findings name the helpdesk analyst who reset the password, and note that they were moved to another site 'outside the normal process'. Sam resigns. The note about the move goes into your file."
              : "HR's findings name the helpdesk analyst who reset the password. Sam reads it, keeps working, and stops coming to the canteen.";
        },
      },
    ],
  },

  // Months later, the stolen payroll comes back: as a second demand if
  // the company paid, as fraud calls to staff's families if it didn't.
  act4_took: {
    act: "Act 4: Rebuild",
    date: "2026-03-10",
    time: "11:20",
    title: "What They Took",
    text: function (flags) {
      var paid = flags.paid || flags.paid_leak;
      return [
        insurerNews(flags),
        paid
          ? "Then an email arrives from a group nobody has heard of. They have ACME Logistics' payroll files, and a sample to prove it: a page of staff names, bank details and all. They want £400,000 to keep them to themselves."
          : "Then the calls start. Someone rings a driver's partner, says they're from the bank, and knows their account number, their address and which nights the driver works. In a week, the helpdesk logs forty calls like it. The leaked payroll is being put to work, one family at a time.",
        paid
          ? (flags.paid_leak
            ? "They're the files you paid £2.1 million to have deleted. Maybe the first group sold a copy before they deleted theirs. Maybe they never deleted anything."
            : "They're the files the first group promised to delete once they were paid. Maybe they sold a copy. Maybe they never deleted anything.")
          : "Two families have already lost money. The company is still on its overdraft, and the bank reads every line of the Monday report.",
        paid
          ? "The negotiator isn't surprised. 'You're on a list now,' they say. 'The list of companies that pay.' The insurer won't cover a second payment, and Legal would like this kept quiet."
          : null,
        "The Chief Executive asks what you'd recommend.",
      ].filter(Boolean);
    },
    choices: [
      {
        text: "Recommend paying, quietly: £400,000 is less than another leak would cost, and nobody need ever know.",
        when: function (flags) { return flags.paid || flags.paid_leak; },
        nextNode: afterTook,
        days: 2,
        stats: withCuts({ internalInfluence: 5, playerHealth: -10 }),
        set: "paid_again",
        outcome: "The board agree, and it comes out of the overdraft. The negotiator gets the price down to £280,000. Six weeks later, a third group writes, with the same sample and a lower price. The negotiator was right about the list.",
      },
      {
        text: "Recommend refusing, and reporting it to the police and the regulator.",
        when: function (flags) { return flags.paid || flags.paid_leak; },
        nextNode: afterTook,
        days: 2,
        stats: withCuts({ internalInfluence: -5, teamHealth: -5 }),
        set: "refused_again",
        outcome: "The police add it to a file with a great many others. A fortnight later, the files appear on a forum, and most of your staff hear about it from the local paper.",
      },
      {
        text: "Recommend refusing, and telling every member of staff before the files appear: what was taken, and exactly what to watch for.",
        when: function (flags) { return flags.paid || flags.paid_leak; },
        nextNode: afterTook,
        days: 2,
        stats: withCuts({ internalInfluence: -5, teamHealth: 5, playerHealth: -5 }),
        set: "warned_staff",
        carries: BOARD_INFLUENCE,
        overruled: {
          stats: withCuts({ internalInfluence: -5, teamHealth: -5 }),
          set: "refused_again",
          outcome: "Legal win: refuse, report it, and say nothing until there's something to say. A fortnight later, the files appear on a forum, and most of your staff hear about it from the local paper.",
        },
        outcome: "Legal hate it, and the Chief Executive does it anyway. The email goes to every member of staff that afternoon, and you take the questions at every depot. When the files appear on a forum a fortnight later, most of the scam calls that follow get the phone put down on them.",
      },
      {
        text: "Recommend a fraud helpline and a year's identity protection for every family, paid for now, on the overdraft.",
        when: function (flags) { return !(flags.paid || flags.paid_leak); },
        nextNode: afterTook,
        days: 2,
        stats: withCuts({ teamHealth: 10, internalInfluence: -10 }),
        set: "helpline",
        carries: BOARD_INFLUENCE,
        overruled: {
          stats: withCuts({ teamHealth: -5, playerHealth: -5 }),
          set: "sessions",
          outcome: "The Finance Director takes it to the bank, and the bank say no: not on an overdraft. Your security team run sessions in every canteen instead, on how to spot the calls. The night shift come, and ask good questions, and one of them asks why nobody did this before.",
        },
        outcome: "The Finance Director takes it to the bank, and the bank agree, with a sigh you can hear down the phone. The helpline takes three hundred calls in its first week. Nobody else loses money, as far as the company hears.",
      },
      {
        text: "Recommend sessions in every canteen, run by your security team, on how to spot the calls.",
        when: function (flags) { return !(flags.paid || flags.paid_leak); },
        nextNode: afterTook,
        days: 2,
        stats: withCuts({ teamHealth: -5, playerHealth: -5 }),
        set: "sessions",
        outcome: "The night shift come, and ask good questions, and one of them asks why nobody did this before. The calls carry on. Fewer of them work.",
      },
      {
        text: "Recommend leaving it to the banks: fraud is their job, and the company can't afford more.",
        when: function (flags) { return !(flags.paid || flags.paid_leak); },
        nextNode: afterTook,
        days: 2,
        stats: withCuts({ internalInfluence: 5, teamHealth: -15 }),
        set: "left_to_banks",
        outcome: "The banks refund most of it, eventually. In April, a forklift driver at the eastern depot loses £3,000 to a caller who knew their shift pattern. The canteen wall has a new piece of paper on it: a charity's phone number, in someone's careful capitals.",
      },
    ],
  },

  act4_review: {
    act: "Act 4: Rebuild",
    date: "2026-04-15",
    time: "10:00",
    title: "The Review",
    text: [
      "The no-blame review is finished: what happened, why each decision made sense to the people making it at the time, and what will change. Your security lead wrote most of it at their kitchen table, in the evenings.",
      "Since Christmas, three other distributors have rung you, quietly, to ask what happened and what they should check. One of them has the same warehouse system, and the same night helpdesk.",
      "The lawyers would like every copy of the review marked privileged and locked away. Who gets to read it?",
    ],
    choices: [
      {
        text: "Publish a summary openly, so that other companies can learn from it.",
        nextNode: "i_final",
        days: 1,
        needs: { internalInfluence: BOARD_INFLUENCE },
        needsFor: "to get it past the lawyers",
        stats: { internalInfluence: -5, teamHealth: 10 },
        set: "published",
        outcome: "The summary goes out in May, eleven pages long. Your security lead presents it at a logistics conference to four hundred people, with shaking hands. Afterwards, there's a queue to talk to them.",
      },
      {
        text: "Share it inside the company: every site, every shift.",
        nextNode: "i_final",
        days: 1,
        stats: { teamHealth: 10, playerHealth: -5 },
        set: "shared",
        outcome: "You print it, and take it to the depots yourself. On the northern depot's canteen wall, someone pins up page six, the one about the overtime email, and writes underneath in marker pen: 'IF IN DOUBT, RING IT IN.'",
      },
      {
        text: "Keep it privileged, as the lawyers advise.",
        nextNode: "i_final",
        days: 1,
        stats: { internalInfluence: 5, teamHealth: -5 },
        set: "privileged",
        outcome: "The review goes into a locked cabinet in Legal's office. Its recommendations go into next year's plan, where they compete with everything else. You ring the other three distributors back, and tell them what you can, off the record.",
      },
    ],
  },
};

// Endings: early ones if a stat runs out, otherwise the first of ENDINGS
// whose test passes. Endings here can depend on the flags as well.
var EARLY_ENDINGS = {
  playerHealth: {
    title: "Signed Off",
    text: [
      "You don't remember deciding to see a doctor. Your partner made the appointment, and drove you there.",
      "The doctor listens for ten minutes, then signs you off, starting today. You try to explain that the company is still rebuilding. They've heard that before.",
      "Your phone keeps buzzing for two more days. Then someone else takes over, and it stops. The rebuild carries on without you.",
      "Duty of care applies to you as well as your team.",
    ],
  },
  teamHealth: {
    title: "The Team Walks",
    text: [
      "The first resignation is your lead infrastructure engineer: polite, apologetic, and final. Two more follow by the end of the week. Recruiters were ready for every one of them.",
      "They take with them everything nobody had time to write down: how the depots' systems really fit together, which servers were rebuilt by hand, and why. The rebuild stalls, and the people left behind carry even more.",
      "Nobody blames you to your face. They don't have to.",
      "A recovery is only as strong as the people still standing to deliver it.",
    ],
  },
  internalInfluence: {
    title: "Sidelined",
    text: [
      "The board bring in an outside firm to run the recovery. Their consultants are polite, and well paid, and ask you where things are.",
      "You're still in the building, and your title hasn't changed. You're just not in the room when decisions are made.",
      "Influence isn't vanity in a crisis. Without it, you can't protect your team or shape the recovery, however right you are.",
    ],
  },
};

var ENDINGS = [
  {
    // Somebody was named, and it wasn't the process.
    title: "The Name in the Report",
    test: function (s, flags) { return flags.named_hr; },
    text: function (flags) {
      return [
        "ACME Logistics recovers. The lorries run, the claim is settled, and the report answers the board's question. It names the person who picked up the phone at 01:20, not the thin night cover, the unread alerts or the email nobody saw, and not the decisions that left one person on the night helpdesk to judge a convincing caller.",
        flags.sam_suspended || flags.sam_moved
          ? "Sam works somewhere else now. You don't hear from them."
          : "Sam still works the night helpdesk. They check every caller twice now, and some nights they don't reset anyone's password at all.",
        "The next time someone on the night shift isn't sure about a call, they'll remember what happened to the last person who was. Whether they ring it in, or keep quiet, is the question nobody in the boardroom asked.",
      ];
    },
  },
  {
    title: "Rebuilt",
    test: function (s) { return s.teamHealth >= 45 && s.playerHealth >= 30 && s.internalInfluence >= 30; },
    text: function (flags) {
      return [
        "ACME Logistics comes back, and comes back different. The restore tests run every quarter, at every site, on dates nobody is allowed to move, and the backups are locked down: copies nobody can change or delete, not even an administrator, and another in a vault with nothing connected to it. " +
          (flags.cover_paused ? "Since the insurer paid, someone watches the alerts all night. " : "Someone watches the alerts all night. ") +
          "The night helpdesk ring a manager back on a number they already have before they reset anything.",
        flags.named_self
          ? "Your name is in the report, and you're still here. It turns out a board can forgive someone who tells them the truth."
          : "Your team stayed together, and you're still standing. When you say something needs fixing now, the board listen.",
        flags.published
          ? "Other distributors still ring you, and you always answer."
          : "Nobody outside the company knows how close it came. You do.",
        "In the summer, a recruiter rings about a job at another company, for more money, in a building where nothing has ever gone wrong. You thank them, and say no. There's a restore test at the eastern depot on Thursday, and you want to be there.",
      ];
    },
  },
  {
    title: "Moving On",
    test: function (s) { return s.playerHealth < 30 || s.internalInfluence < 30; },
    text: [
      "In the summer, a recruiter rings about a job at another company: head of IT, a hospital supplier, two hundred miles away. You say no. Then you say yes.",
      "On your last day, the northern depot buys you a cake shaped like a lorry. Sam writes the card.",
      "In your new job, the first thing you ask for is a full restore test at every site, and backups that nobody, not even you, can delete. Nobody there understands why you're in such a hurry. You hope they never have to.",
    ],
  },
  {
    title: "Standing, Just",
    test: function () { return true; },
    text: [
      "You made it through. ACME Logistics is running, your team is still yours, and you're still standing, though all three are worn thin.",
      "The restore tests are on next year's plan. So is locking down the backups. So is the night cover. So is everything else.",
    ],
  },
];

// The lessons at the end, in the order the game reaches them. Each one looks
// back at the player's own game: `review` gets { choices, flags, stats, log,
// finished }, where `choices` maps each scene's id to the index of the option
// picked (for a recommendation, the one recommended, even if the room
// overruled it: the flags say what actually happened). It returns the verdict
// ("paid", "manage" or "tradeoff") and what happened, or null if the player
// never reached that point. `ask` is what to take back, each question
// addressed to the seat that would answer it.
var LESSONS_INTRO = "Every choice you made had a cost, and most of the big calls belonged to people outside IT. Here's how yours played out, and what to take back to your own organisation, whichever seat you sit in.";

// "Thursday 22 January", for a day counted from the blackout.
function lessonDate(days) {
  return new Date(Date.parse(blackoutPlus(days))).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

var LESSONS = [
  {
    title: "Test your backups, and lock them down",
    scenes: "Eight Weeks to Peak · The Backups · Nine Years Ago",
    review: function (r) {
      var c = r.choices.act0_start;
      if (c == null) return null;
      var text = [
        "You held your ground and ran full restore tests at every site, and the supermarket's peak contract went to a competitor. The tests found two depots missing a database, and timed a headquarters restore at four days.",
        "You tested headquarters, then gave your engineers to the migration, and won half the supermarket's contract. You knew headquarters took four days to restore. Nobody had tried the depots.",
        "You backed the flagship, and the supermarket's advance bought the company weeks of cash. Nobody had ever brought a site back from the backups.",
      ][c];
      if (r.choices.act2_chat != null) {
        text += " When the attackers encrypted the central backup store, the tapes in the vault were all that was left" +
          (c === 0
            ? ", and you knew exactly what they held, what was missing and how long each site would take."
            : c === 1
              ? ". Headquarters came back as planned. Two depots' backups had been missing their stock records for years."
              : ". They held the old warehouse system, and two depots' backups had been missing their stock records for years.") +
          " The lockdown that would have saved the backup store was still waiting for January.";
      }
      return { verdict: c === 0 ? "paid" : c === 1 ? "tradeoff" : "manage", text: text };
    },
    lesson: "Backups only matter if they survive an attack and you can restore from them against the clock. Attackers go for the backups first. Testing proves you can bring a site back; locking the backups down, so that no copy can be changed or deleted, not even by an administrator, with one more kept offline, makes sure there's still something to bring back. Don't let either wait for a quieter month. Resilience work competes with delivery for the same people, so make that trade-off openly, at board level, and write down what each side buys.",
    ask: [
      "Tech/Cyber: When did we last restore a whole site, end to end, and how long did it take?",
      "Tech/Cyber: Is at least one copy of our backups offline or unchangeable? Could the account that runs our backups destroy them?",
      "Tech/Cyber: Where are our incident plan, network diagrams and backup index kept, and could we reach them if every server were encrypted?",
      "Business Leaders: When resilience work and a flagship programme need the same people, who decides between them, and is the decision recorded?",
    ],
  },
  {
    title: "Someone has to be watching at night",
    scenes: "Nobody Watching at Night · Record Week · 01:20",
    review: function (r) {
      var c = r.choices.act0_alerts;
      if (c == null) return null;
      var text = [
        "You found the money for round-the-clock monitoring. It saw the attack reaching for the depots at 15:41 and rang you with clear advice. Even so, it closed the 01:20 sign-in as expected: a reset the helpdesk had approved looked legitimate.",
        "You asked the night helpdesk to keep an eye on the alerts. When the alert for the 01:20 sign-in came up, Sam saw their own reset, and moved on.",
        "You switched the security tool to blocking. It cost forty late lorries in peak week, and the attackers switched it off nine minutes before the screens went.",
        "You left the nights until January. The alert for the 01:20 sign-in, and the phishing email before it, were still in the unread queue when the screens went black.",
      ][c];
      if (r.flags.lockedOut && r.flags.lockedOut.act0_alerts && c !== 0) text += " You didn't have the influence to get the budget for monitoring.";
      if (r.flags.cover_paused) text += " In January, you paused the night cover to satisfy the bank, and a 2am alert went unseen until nine.";
      text += " Reliance on one automated tool should be avoided.";
      return { verdict: c === 0 && !r.flags.cover_paused ? "paid" : c === 0 ? "tradeoff" : "manage", text: text };
    },
    lesson: "A security tool that flags things nobody reads is just a record of what you missed. Attackers work nights, weekends and peak weeks, because that's when nobody is looking. Decide who watches out of hours, and what they're allowed to do about what they see, before you need them. And make sure the answers on your insurance renewal are still true.",
    ask: [
      "Tech/Cyber: Who looks at our security alerts at 2am on a Sunday in our busiest week, and what are they allowed to do about them?",
      "Tech/Cyber: How many security alerts went unread last month?",
      "Business Leaders: Who fills in our cyber insurance renewal, and who checks the answers are still true?",
      "Business Leaders: When we cut costs, is out-of-hours monitoring on the list, and do we know what that risk would cost us?",
    ],
  },
  {
    title: "Decide in advance who can switch the company off",
    scenes: "Pull the Plug",
    review: function (r) {
      var c = r.choices.act1_plug;
      if (c == null) return null;
      return [
        { verdict: "paid", text: "You pulled the plug on everything, depots included, and the biggest night of the year stayed in the yard. The depots' systems stayed clean, and saved weeks of the rebuild." + (r.flags.monitoring ? " The monitoring service's advice made the call easier to defend." : "") },
        { verdict: "manage", text: "You kept the depots connected to run the biggest night of the year. At 19:20, the attack reached them, and every depot had to be rebuilt from the tapes as well." },
        { verdict: "manage", text: "You waited for the insurer's experts. It took forty minutes to find the hotline number, and by 17:05 the depots were lost." },
      ][c];
    },
    lesson: "In the first hour, every minute of debate is a minute of spread. Isolating systems is a business decision as much as a technical one, so agree in advance who can make it, what it will cost, and when they don't need to ask anyone. Keep the insurer's hotline, your incident plan and the numbers you'll need on paper, outside the systems you might lose.",
    ask: [
      "Business Leaders: Who can take the company offline without asking anyone, and do they know they can?",
      "Business Leaders: Where is our insurer's incident hotline number, and could we find it if our email and files were encrypted?",
      "Tech/Cyber: Can we cut off each site separately, and have we practised doing it?",
    ],
  },
  {
    title: "The helpdesk is the front door",
    scenes: "01:20 · Every Account",
    review: function (r) {
      var c = r.choices.act2_identity;
      if (c == null) return null;
      var text = "At 01:20, a caller with an employee number and a manager's name got a password and login app reset over the phone. That was all the attackers needed. ";
      text += [
        "When every account had to be reset, you did it in person, with photo ID, at every site and on every shift. It took three days and nights.",
        "When every account had to be reset, managers vouched for their own people. It was quicker, but two lists came back signed without anyone being seen.",
        "When every account had to be reset, you texted links to the numbers HR held, and the helpdesk reset four hundred passwords over the phone, just as it had at 01:20.",
      ][c];
      return { verdict: ["paid", "tradeoff", "manage"][c], text: text };
    },
    lesson: "Attackers increasingly ring the helpdesk rather than break the code. Resetting someone's password and login app over the phone hands over their account, so check callers in a way a stolen employee number and a public org chart can't satisfy, such as calling back on a number you already hold. And plan how you'd reset every account in the company, because once an administrator's keys are stolen, you'll have to.",
    ask: [
      "Tech/Cyber: What would a caller need to know to get a password reset from our helpdesk at 1am, and could an attacker find it out?",
      "Tech/Cyber: How long would it take to reset every account in the company, including staff on shifts who never visit an office?",
      "Business Leaders: Which staff details, such as employee numbers and managers' names, are easy to find, inside or outside the company?",
    ],
  },
  {
    title: "Blame the person, and you lose the next warning",
    scenes: "Before Two O'Clock · A Name for the Board",
    review: function (r) {
      var sam = r.choices.act2_sam, name = r.choices.act4_name;
      if (sam == null) return null;
      var text = [
        "You told Sam yourself, before anyone else, and sat with them until two.",
        "You let HR follow the standard process, and Sam was walked out of the building with their lanyard in an envelope.",
        "You moved Sam quietly to another depot, out of the line of fire.",
      ][sam];
      if (name == null) return { verdict: sam === 0 ? "paid" : sam === 1 ? "manage" : "tradeoff", text: text };
      text += [
        " When the board wanted a name, you named the process, not a person, and the report went out with recommendations instead.",
        " When the board wanted a name, you put your own to it.",
        " When the board wanted a name, you left it to HR, and the report named the analyst who reset the password.",
      ][name];
      if (name !== 0 && r.flags.lockedOut && r.flags.lockedOut.act4_name) text += " You didn't have the influence to hold the room for naming the process.";
      return { verdict: name === 0 && sam !== 0 ? "tradeoff" : ["paid", "tradeoff", "manage"][name], text: text };
    },
    lesson: "The person who picked up the phone usually did what the system let them do: alone, at night, with nothing to check against. Naming them makes the report tidier and the next warning less likely, because everyone learns what happens to the person who gets it wrong. Look at the conditions instead, from cover to checks to training, and make it safe for people to ring in when they're unsure.",
    ask: [
      "Business Leaders: If one of our staff were tricked into letting attackers in, what would our process do to them, and is that what we want?",
      "Business Leaders: When we review an incident, do we ask who was responsible, or what made the mistake easy?",
      "Business Leaders: Would our night shift ring in a mistake at 2am, and how do we know?",
    ],
  },
  {
    title: "Decide your position on paying before anyone asks",
    scenes: "The Chat · The Board · What They Took",
    review: function (r) {
      var board = r.choices.act2_board, took = r.choices.act4_took;
      if (board == null) return null;
      var text = [
        "The board paid. The decryption tool was slow, and three servers never came back.",
        "You recommended refusing, and carried the room. The rebuild went on from the tapes, and the stolen data was published.",
        "The board paid £2.1 million for the stolen data to be deleted, with no way to know whether it was the only copy.",
      ][board];
      if (board !== 1 && r.flags.lockedOut && r.flags.lockedOut.act2_board) text += " You didn't have the standing to argue the room out of paying.";
      if (took != null) {
        var f = r.flags;
        text += " In March, " + (
          took === 0 ? "a second group demanded money for the same files. You recommended paying again, and a third group followed." :
          took === 1 ? "a second group demanded money for the same files. You recommended refusing and reporting it, and the files appeared on a forum." :
          took === 2 && f.warned_staff ? "a second group demanded money for the same files. You warned every member of staff first, and most of the scam calls failed." :
          took === 2 ? "a second group demanded money for the same files. You wanted to warn staff first, but Legal won, and staff heard about it from the local paper." :
          took === 3 && f.helpline ? "fraudsters started ringing staff's families. You funded a fraud helpline and identity protection for every family." :
          took === 3 ? "fraudsters started ringing staff's families. You recommended a fraud helpline, but the bank wouldn't fund it on an overdraft." :
          took === 4 ? "fraudsters started ringing staff's families. Your security team ran sessions in every canteen on how to spot the calls." :
          "fraudsters started ringing staff's families. You left it to the banks, and a forklift driver lost £3,000.");
      }
      return { verdict: board === 1 && took !== 5 ? "tradeoff" : "manage", text: text };
    },
    lesson: "Paying buys a decryption tool that may be slow and incomplete, and a criminal's promise to delete what they took. It also puts you on the list of companies that pay. Whether you'd pay, who decides, and how sanctions checks, law enforcement and your insurer fit in are all decisions to make calmly in advance, not late at night with a countdown on screen. Paid or not, plan how you'll protect the people whose data was taken.",
    ask: [
      "Business Leaders: Have we decided, in principle, whether we'd pay a ransom, and who would make the call on the day?",
      "Business Leaders: How would we check whether a payment was legal, and how long would that take?",
      "Business Leaders: What does our insurance cover if we pay, and if we don't?",
      "Business Leaders: If our staff's personal data were stolen, how would we protect them and their families from the fraud that follows?",
    ],
  },
  {
    title: "Agree what comes back first",
    scenes: "Strangers in the Building · What Comes Back First?",
    review: function (r) {
      var c = r.choices.act2_priority, f = r.flags;
      if (c == null) return null;
      var overruled = (c === 1 && !f.first_payroll) || (c === 2 && !f.first_vulnerable);
      var text = overruled
        ? "You recommended " + (c === 1 ? "payroll" : "putting pharmacies and care homes") + " first, but the Chief Executive went with the warehouse system, and the lorries."
        : [
          "You recommended the warehouse system first. The lorries moved on printed routes, and the warehouse floor waited until the new year for their peak overtime.",
          "You recommended payroll first, and the people who carried peak week were paid before Christmas, while the lorries waited.",
          "You recommended putting pharmacies and care homes first, and from that Sunday their medicines went out in full every night.",
        ][c];
      if (r.finished) text += " The last of headquarters' systems came back " +
        ["in May, more than five months after the attack.", "at the end of March, nearly four months after the attack.", "at the end of February, twelve weeks after the attack."][rebuildSpeed(f)];
      return { verdict: overruled ? "tradeoff" : c === 2 ? "paid" : "tradeoff", text: text };
    },
    lesson: "After ransomware, nothing comes back at once. The old network becomes evidence, a new one has to be built beside it, and each system is restored and checked on the way in, one at a time. Agree in advance which services come back first and who depends on them most, and how you'll pay people and serve vulnerable customers while they wait. That order is a business decision, not an IT one.",
    ask: [
      "Business Leaders: If everything were down tomorrow, what would we bring back first, and who has agreed that order?",
      "Business Leaders: Which of our customers can least afford to wait, and is there a list of them that doesn't live on the systems we'd lose?",
      "Business Leaders: If payroll were down on payday, how would people get paid?",
      "Tech/Cyber: Could we build a clean network from nothing, and on what hardware?",
    ],
  },
  {
    title: "Practise running on paper",
    scenes: "What Do We Tell Them? · Clipboards · Goods In · The Care Home",
    review: function (r) {
      var goods = r.choices.act3_goodsin, care = r.choices.act3_carehome, f = r.flags;
      if (goods == null) return null;
      var told = f.customers_truth
        ? "On the first Sunday, you recommended telling customers the truth, with no date until you had one you could keep. "
        : f.customers_date
          ? "On the first Sunday, you recommended promising customers a week. It took far longer, and they remembered the date. "
          : r.choices.act2_customers === 0
            ? "On the first Sunday, you recommended telling customers the truth, but Legal won, and they were told it was a technical issue. "
            : "On the first Sunday, you recommended telling customers it was a technical issue, and they read the real word in the paper. ";
      var text = told + [
        "At goods-in, you took everything in, and finance spent weeks agreeing prices for pallets nobody could match to an order.",
        "At goods-in, you turned away what you couldn't match, and two suppliers put ACME Logistics on stop.",
        "At goods-in, you paid your smallest suppliers by hand. The dressings maker paid its staff, and three suppliers were paid twice.",
      ][goods];
      if (goods !== 2 && f.lockedOut && f.lockedOut.act3_goodsin) text += " You didn't have the influence to get Finance to pay suppliers by hand.";
      var misled = f.customers_date || r.choices.act2_customers === 1;
      if (care == null) return { verdict: goods === 2 && !misled ? "paid" : "tradeoff", text: text };
      text += " " + (
        care === 0 && f.competitor ? "When the care home ran short of insulin, you asked a competitor to cover your care homes, and some of those customers never came back." :
        care === 0 ? "When the care home ran short of insulin, you recommended asking a competitor for help, but the Chief Operating Officer refused, and the medicines waited two days." :
        care === 1 ? "When the care home ran short of insulin, you drove it there yourself, and three residents got their insulin." :
        "When the care home ran short of insulin, you stuck to the restore plan, and the medicines run came back a day later than they needed it.");
      return { verdict: f.plan || f.plan_overruled || misled ? "manage" : "tradeoff", text: text };
    },
    lesson: "When the systems go, the business runs on whatever people can do with paper, phones and memory, and on whether customers still believe what you tell them. Tell them the truth early, and never give a date you can't keep. The first lorries left within days because supervisors knew their routes and customers knew their orders. Write down the manual workarounds, the suppliers and customers who matter most, and how you'd safely pay a small supplier by hand, and keep it all on paper. Agree in advance who can ask a competitor for help.",
    ask: [
      "Business Leaders: If our systems went down tonight, how would we take an order, pick it and deliver it, and when did we last try?",
      "Business Leaders: What would our customers hear from us on the first morning, and who would decide it?",
      "Business Leaders: Which suppliers depend on us to stay in business, and how would we pay them if our finance system were down?",
      "Business Leaders: Would we ask a competitor to cover our most vulnerable customers, and who could agree it?",
    ],
  },
  {
    title: "The money stops when invoicing stops",
    scenes: "The Board · The Overdraft · The Small Print",
    review: function (r) {
      var bank = r.choices.act4_bank, ins = r.choices.act4_insurer, f = r.flags;
      if (bank == null) return null;
      var text = "With nothing invoiced since the screens went, the cash ran out on " + lessonDate(CASH.out(f)) + ". " + [
        "To keep the overdraft, you cut the rebuild's extra hands, and your engineers went back to twelve-hour days.",
        "To keep the overdraft, you paused the night cover until the insurer paid.",
        "To keep the overdraft, you held the line for IT, and thirty agency staff went instead.",
      ][bank];
      if (f.restore_tested && f.monitoring) {
        text += " With tested restores and night cover in the file, the insurer had nothing to argue about, and paid early.";
        return { verdict: "paid", text: text };
      }
      if (ins == null) return { verdict: "tradeoff", text: text };
      text += " " + (
        ins === 0 && f.insurer_open ? "You handed the insurer everything, and its first payment arrived in the middle of March, at seventy per cent." :
        ins === 0 ? "You recommended handing the insurer everything, but Legal set it in context instead, and the first payment arrived at the start of March." :
        ins === 1 ? "Legal set it in context, and the insurer's first payment arrived at the start of March, at eighty per cent." :
        "You fought the insurer. It paid nothing for lost business until April, and forty-three people lost their jobs to keep the company going.");
      return { verdict: ins === 2 ? "manage" : "tradeoff", text: text };
    },
    lesson: "Deliveries can restart on paper long before the money does. Nothing can be invoiced until the finance systems are back, while wages, fuel and suppliers still have to be paid. Insurance pays eventually, once its questions are answered, and the answers you gave at renewal matter. Know your cash runway if you couldn't invoice, who would extend credit and on what terms, and what your policy really covers.",
    ask: [
      "Business Leaders: How many weeks could we keep going if we couldn't invoice anyone?",
      "Business Leaders: Who would we ask for credit, and what would they want in return?",
      "Business Leaders: If our insurer asked for every document about our decisions before an attack, what would they find?",
      "Business Leaders: Are the answers on our insurance renewal true today?",
    ],
  },
  {
    title: "Look after the people doing the rebuilding",
    scenes: "Telling Them · Under the Desk",
    review: function (r) {
      var tell = r.choices.act3_tell, desk = r.choices.act3_desk, f = r.flags;
      if (tell == null) return null;
      var text = tell === 0 && f.told_in_person
        ? "When the payroll files turned out to be among the stolen data, you told every site in person."
        : tell === 0
          ? "When the payroll files turned out to be among the stolen data, you recommended telling every site in person, but HR's letter went out instead."
          : tell === 1
            ? "When the payroll files turned out to be among the stolen data, staff got a letter from HR."
            : "When the payroll files turned out to be among the stolen data, you waited for the investigation to confirm whose data was taken.";
      if (desk == null) return { verdict: f.told_in_person ? "paid" : "manage", text: text };
      text += [
        " When your lead engineer was sleeping under their desk, you sent the team home in shifts, starting with yourself.",
        " When your lead engineer was sleeping under their desk, you brought in the insurer's recovery engineers to take the nights.",
        " When your lead engineer was sleeping under their desk, you pushed through to the holidays, and a second person cried in the server room.",
      ][desk];
      if (desk !== 1 && f.lockedOut && f.lockedOut.act3_desk) text += " You didn't have the influence to get the budget for outside help.";
      return { verdict: desk === 2 ? "manage" : f.told_in_person ? "paid" : "tradeoff", text: text };
    },
    lesson: "A ransomware recovery is a marathon run at a sprinter's pace. The few engineers who know how everything fits together are the ones sleeping under their desks, and tired people make the mistakes that cost a day's work. Rotate shifts from the first week, bring in outside help early, and tell staff the truth about their own data in person.",
    ask: [
      "Tech/Cyber: Which few people would our rebuild depend on, and what happens if they burn out or leave?",
      "Tech/Cyber: Do we have recovery engineers on contract, and how quickly could they start?",
      "Business Leaders: If our staff's own data were stolen, how and how quickly would we tell them?",
    ],
  },
  {
    title: "Share what you learned",
    scenes: "Where It Started · The Review",
    review: function (r) {
      var c = r.choices.act4_review;
      if (c == null) return null;
      var text = "The investigators could only say the attack probably started with a phishing email, lost in the backlog of alerts. " + [
        "You published a summary of the review, and your security lead presented it to four hundred people at a conference.",
        "You shared the review inside the company, at every site and on every shift.",
        "You kept the review privileged, as the lawyers advised, and told the other distributors what you could, off the record.",
      ][c];
      if (c !== 0 && r.flags.lockedOut && r.flags.lockedOut.act4_review) text += " You didn't have the influence to get it past the lawyers.";
      return { verdict: c === 2 ? "manage" : "paid", text: text };
    },
    lesson: "Most investigations end in 'probably', and the useful lessons are about conditions, not culprits. A review locked in Legal's cabinet changes very little. Sharing it, inside the company and beyond, is how your own people stop it happening again, and how the next company avoids the same night.",
    ask: [
      "Business Leaders: After an incident, who would read our review, and would it change next year's plan?",
      "Business Leaders: What could we safely share with our staff and our peers, and how quickly?",
      "Tech/Cyber: Are we part of a group of peers who'd tell each other what they learned?",
    ],
  },
];
