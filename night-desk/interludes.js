// Interludes: the moments between decisions, each with a single Continue
// button. Same conventions as the first game (see its interludes.js), plus:
//
//   `blackout`  the office goes dark. From paragraph `wave`, the lit
//               monitors behind the card go out in a wave across the floor,
//               and the Service meter falls to nothing at paragraph `map`.
//               At paragraph `screen`, the card itself goes black and the
//               ransom note types out, then the colours come back red.
//               `hold` is how many seconds the player gets to read the
//               screen paragraph before it goes black. `note` is the lines
//               typed on the black screen, then `timer` counts down for
//               `timerFor` seconds before the room comes back.
//   "|" / "||"  inside a paragraph: a short or longer beat before the words
//               after it appear.
//   `times`     seconds at which each paragraph appears, in place of
//               `pace` and `pauses`, for a scene timed to reading speed.
//   `career`    a staff ID badge whose job title changes as the years turn
//               in the clock line, with earlier roles stacking up beside
//               it, before the text appears. Each step is { ago, title,
//               note }.

var INTERLUDES = {
  // Fourteen years in ten steps: from loading cages to in charge of IT.
  i_career: {
    act: "Act 0: Business as Usual",
    when: "14 years ago",
    time: "",
    title: "Fourteen Years",
    career: [
      { ago: "14 years ago", title: "Warehouse Operative, Nights", note: "Northern depot. Loading cages for the four o'clock run." },
      { ago: "13 years ago", title: "Warehouse Systems Assistant", note: "You fixed a jammed scanner on your break. Someone noticed." },
      { ago: "11 years ago", title: "IT Support Analyst", note: "The helpdesk. Nights again, and you don't mind." },
      { ago: "9 years ago", title: "Infrastructure Engineer", note: "You design the company's backup system." },
      { ago: "7 years ago", title: "Senior Infrastructure Engineer", note: "You build the server room at headquarters." },
      { ago: "5 years ago", title: "Infrastructure Manager", note: "Your first team: four engineers." },
      { ago: "3 years ago", title: "IT Operations Manager", note: "Every depot. Every system." },
      { ago: "2 years ago", title: "Head of IT Operations", note: "In charge of IT." },
      { ago: "Last year", title: "Head of IT Operations", note: "After the restructure, the three-person security team is yours too." },
      { ago: "Today", title: "Head of IT Operations", note: "Two years in charge. Fourteen years at ACME Logistics. One night shift on the line, every year." },
    ],
    text: [
      "You've never worked anywhere else. You've never really wanted to.",
      "When anything breaks at ACME Logistics, people don't raise a ticket. They call you, and you fix it. It's who you are here.",
    ],
    next: "act0_start",
  },

  i_nightdesk: {
    act: "Act 0: Business as Usual",
    date: "2025-10-21",
    time: "02:15",
    title: "The Night Desk",
    // Why you're in at two in the morning follows from the first choice.
    text: function (flags) {
      return [
        (flags.restore_tested
          ? "You're in at two in the morning to run the last of the depot restore tests"
          : flags.restore_hq
            ? "You're in at two in the morning for a migration rehearsal, with the headquarters restore test still running on the next screen"
            : "You're in at two in the morning for a migration rehearsal") +
          ", and the only other light on the IT floor is the night helpdesk.",
      "Sam, the analyst on the desk tonight, came to you from the warehouse two years ago. They'd fixed a jammed scanner on their break, and you remembered doing exactly the same, once. Now they reset passwords, unlock accounts and keep the depots' screens alive until the day shift arrives. They're good at it. Callers like them, because they never make anyone feel stupid.",
      "They make you a coffee you didn't ask for, and ask whether there's a way from the helpdesk into security. You tell them there is, and that you'll help them find it.",
      "On your way out, you glance at the security team's screen. Forty-one alerts since midnight, all unread. The security tool can spot trouble, but it's been set to watch rather than act since it stopped the picking scanners last year. At night, nobody is watching it either.",
      ];
    },
    days: 1,
    next: "act0_alerts",
  },

  i_peak: {
    act: "Act 0: Business as Usual",
    date: "2025-12-02",
    time: "06:10",
    title: "Record Week",
    text: function (flags) {
      return [
        "Peak week. Seasonal flu is sweeping the country, and pharmacies are ordering double. Care homes are ordering extra to see them through the holidays. The depots run day and night, and the yard at the northern depot never empties. Every number on the operations board is a record.",
        "There's double overtime on the warehouse floor, and people from every office are pitching in: finance clerks on the packing benches, the marketing team loading cages, the Chief Operating Officer in borrowed hi-vis. You do your night on the picking line, as you have every peak week since you left the loading bays: one night shift a year, so you never forget who the systems are for. Your hands still remember the way.",
        flags.restore_tested
          ? "The old warehouse system creaks under the load. Twice it slows to a crawl, and twice your team nurse it back before the morning run. The supermarket's overflow lorries are a competitor's colours now, and you pass them on the motorway. Nobody on the board mentions the migration, but nobody needs to. At least you know, to the hour, how long it would take to bring each site back."
          : flags.restore_hq
            ? "The new warehouse system went live a week before peak, and it's holding, just, with half the supermarket's overflow on top. Your engineers are worn out from carrying two projects at once. You know headquarters can be restored in four days. Nobody knows about the depots yet."
            : "The new warehouse system takes the load without a stumble, with the supermarket's overflow on top. The Chief Operating Officer forwards you a screenshot of the dashboard with three exclamation marks. The restore tests are on January's list.",
        flags.blocking
          ? "In the early hours of Monday, the security tool blocks an update to the picking scanners at the southern depot. Sam is alone on the helpdesk, with a depot supervisor shouting down the phone and nothing in the guide that covers it. By the time Sam reaches you, and you talk them through switching off blocking for the depots, forty lorries have left late. Two care homes get their deliveries after lunch."
          : null,
        // The way in, as you'd really see it: one routine line in a log.
        "On Tuesday morning, you skim the overnight helpdesk log over your first coffee. Thirty-eight calls. A scanner at the eastern depot, two printers, and at 01:20 a depot manager, out helping with deliveries, locked out at a supplier's site with their phone lost: password and login app reset by Sam. A normal night.",
        flags.monitoring
          ? "The monitoring service's morning report has a single alert, closed as expected: a depot manager's account signing in from somewhere new, just after a helpdesk reset."
          : flags.helpdesk_watch
            ? "Sam's handover note says 'all quiet'."
            : flags.blocking
              ? "You glance at the security team's queue on the way past: three hundred overnight alerts, and nothing blocked since Monday. They'll get to them when they can."
              : "You glance at the security team's queue on the way past: three hundred overnight alerts. They'll get to them when they can.",
        "You're sleeping five hours a night, and it doesn't matter. It's working. This is the week you're all here for.",
      ].filter(Boolean);
    },
    // A wrong block in peak week costs the night's deliveries, and goodwill.
    stats: function (flags) {
      return flags.blocking
        ? { teamHealth: -10, playerHealth: -5, internalInfluence: -5 }
        : { teamHealth: -5, playerHealth: -5 };
    },
    days: 5,
    next: "i_blackout",
  },

  // The jolt, in the middle of the high point.
  i_blackout: {
    act: "Act 0: Business as Usual",
    date: "2025-12-05",
    time: "15:40",
    title: "The Operations Floor",
    // Timed to reading speed, so nobody is still reading the bunting when
    // the screens go. The screen dies 4 seconds after the laptop line;
    // the ransom note takes about four more, then the room comes back.
    times: [0, 7, 10.5, 17.5, 24, 27, 43.8, 46.3],
    blackout: {
      wave: 3, map: 4, screen: 5, hold: 4,
      note: [
        "Your files are encrypted.",
        "Don't panic. We are a business, like you.",
        "To get them back, talk to our support team before the timer runs out. The link is in README.txt on every machine.",
      ],
      timer: "72:00:00",
      timerFor: 5,
    },
    text: [
      "It's the last afternoon of peak week, and the Chief Executive has come down to the operations floor to say thank you. The board are with them. Someone has found bunting. Even now, the planners can't stop for long: tonight's routes are still being built. On the wall of screens at the front, the live delivery map shows the fleet as moving dots, as the lorries finish the day's last drops and head back to the depots to load for tonight.",
      "You're near the back, by the doors, which is where IT always stands at these things, ready to slip out if something breaks.",
      "The Chief Executive is halfway through thanking the night shift, and everyone who came down from the offices to help, when a planner near the windows says, out loud, 'What the...'||| They tail off as the whole floor turns to look at them.| Their screen has gone black.",
      "Then the desk beside them.|| Then the row behind.|| It moves across the floor| like a cloud's shadow crossing a field,| one monitor at a time,| and wherever it passes,| the keyboards stop.",
      "On the wall at the front, the delivery map freezes. Four hundred dots stop moving.",
      "Your laptop is open on the table beside you, with a half-written email on the screen. As you watch, the words disappear.",
      "The floor goes quiet enough to hear the air conditioning.",
      "Around you, people turn to look for someone. It takes you a moment to realise that the person they're looking for is you.",
    ],
    // In a crisis, the longest-serving leader in the building carries weight.
    // It comes after Act 0, so the budget calls there stay as hard.
    stats: { service: -100, internalInfluence: 10 },
    // From here on, the theme is red.
    set: "readIn",
    next: "act1_plug",
  },

  i_warroom: {
    act: "Act 1: Lights Out",
    time: "23:10",
    title: "The War Room",
    text: function (flags) {
      return [
        "By eleven, the leadership team have taken over the biggest meeting room at headquarters, because it has a whiteboard and a window that opens. There's no email, no shared drive and no video calls. Everyone is on their personal phones, in a group chat the Finance Director has called 'Friday'.",
        "The incident plan exists. You helped write it. It's on the shared drive, which is encrypted, along with the phone list inside it. It took forty minutes to find the insurer's hotline number. It was on a printed copy of the policy in the Finance Director's car.",
        "The insurer's response experts will be on site in the morning. Until then, the most useful thing in the building is a whiteboard marker, and nobody can find the lid.",
        flags.isolated
          ? "Out in the yards, four hundred lorries stand with their engines off. Tonight, for the first time in fourteen years, deliveries won't be leaving the yard."
          : flags.depots_on
            ? "At 19:20, the depots' screens went black mid-pick, with half the fleet still at the loading bays. A few lorries left with partial loads and handwritten lists. Most didn't leave at all."
            : "At 17:05, while you were still waiting for the expert to call back, the depots' screens went black. Tonight's run never started.",
        "At ten, Sam arrives for the night shift to a dark helpdesk, and asks what they can do. You put them on the phones, taking calls from depots and drivers, and they haven't stopped since.",
        // Sets up the chat window and the leak countdown in Act 2.
        "Someone photographed the ransom note on a dead laptop this afternoon, and the README file beside it: a web address for 'customer support', and a countdown with 71 hours and 40 minutes left. The Finance Director wants to know how much they're asking. The note doesn't say. The insurer's advice is the only advice anyone agrees on: nobody goes near the chat until their experts arrive.",
        "At midnight, the Chief Executive asks the question everyone has been waiting to ask. 'How long until we're back?'",
        // The restore tests make the answer more precise, but they were
        // designed for failures, not an attack: nobody knows if the copies
        // are clean.
        flags.restore_tested
          ? "The room turns to you. You know a full restore of headquarters takes four days, and each depot two. From a clean copy. Tonight, nobody knows whether the copies are clean. For the first time in your career, you say you don't know."
          : flags.restore_hq
            ? "The room turns to you. You know headquarters takes four days, from a clean copy. You don't know about the depots. And tonight, nobody knows whether any of the copies are clean. For the first time in your career, you say you don't know."
            : "The room turns to you. You've answered that question a thousand times. Tonight, for the first time, you say you don't know.",
      ];
    },
    stats: { playerHealth: -10, internalInfluence: -5 },
    days: 1, // past midnight: 03:04 is the next day
    next: "i_0304",
  },

  i_0304: {
    act: "Act 1: Lights Out",
    time: "03:04",
    title: "Three Minutes Past Three",
    buzz: 0,
    text: function (flags) {
      return [
        "You've gone home for a shower and two hours' sleep. Your phone, face down on the bedside table, buzzes and doesn't stop.",
        flags.isolated
          ? "It's the night supervisor at the northern depot. 'Sorry to wake you. Drivers are turning up for the four o'clock run and there's nothing for them. What do I tell them? And I've got a care home on the other line. They're asking about their insulin.'"
          : "It's the night supervisor at the northern depot. 'Sorry to wake you. Every printer in the building has just started printing on its own. Same page, over and over. And I've got a care home on the other line. They're asking about their insulin.'",
        flags.isolated
          ? null
          : "She sends a photo of one of the sheets on the warehouse floor. The page has changed since this afternoon. It has ACME Logistics' name at the top now, and a new line: We have your files. Staff, customers, contracts. Talk to us before the timer ends.",
        "Your partner is awake beside you, and has been listening. 'Go,' they say, before you can explain.",
        "You tell the supervisor you'll call back within the hour. You don't have an answer to give them. You get dressed in the dark.",
        "Somewhere in the region, a care home manager is counting what's left in the medicine fridge.",
      ].filter(Boolean);
    },
    stats: { playerHealth: -5 },
    next: "i_experts",
  },
  i_experts: {
    act: "Act 2: The Price",
    time: "08:30",
    title: "Strangers in the Building",
    text: function (flags) {
      return [
        "The insurer's experts arrive at half past eight on Saturday morning: six of them, in fleeces and lanyards, with their own laptops in sealed bags. By nine, the war room has a new seating plan, and you're no longer at the head of the table.",
        "Their first decision is that the old network is a crime scene. Nothing on it is to be switched on, wiped or trusted. Everything that comes back will come back onto a new network, built from nothing beside the old one: a new firewall, new administrator accounts, new laptops for the people who run it, and monitoring on every machine before it connects.",
        "The Chief Operating Officer asks what everyone in the room is waiting to ask: how long until the systems are back? 'Until the new network is ready? A week, if nothing goes wrong,' the lead investigator says. 'Then nothing moves across until we know how they got in, and after that, it's one system at a time.'",
        "They ask for the network diagrams. They're on the encrypted drive. They ask for a list of every server and who looks after it. You write it out from memory on the whiteboard, and it takes two hours.",
        flags.restore_tested
          ? "Then they ask how long a restore takes. You take a folder out of your bag: the printed report from your restore tests, every site, timed to the hour. The lead investigator reads it twice, and asks if they can keep it."
          : flags.restore_hq
            ? "Then they ask how long a restore takes. You have the timings for headquarters, printed, in your bag. For the depots, you have an estimate, and the lead investigator writes 'estimate' beside it."
            : "Then they ask how long a restore takes. You tell them what the plan says. They ask when it was last tested. You tell them it's on January's list.",
        "At eleven, with the Chief Executive and the Finance Director watching, the negotiator opens the link from the README file. A chat window. A blinking cursor. Then:",
        "'Hello. I am your support manager. How can we help you get your business back?'",
        "The price arrives a minute later, politely: £3.8 million in cryptocurrency, with thirty per cent off if it's paid within 48 hours. The Finance Director laughs, once, and then doesn't.",
      ];
    },
    pauses: { 5: 1.2, 6: 1.5 },
    next: "act2_chat",
  },

  i_backups: {
    act: "Act 2: The Price",
    time: "16:20",
    title: "The Backups",
    text: function (flags) {
      return [
        "On Sunday afternoon, your engineers get into the central backup store: the one you spent this year building, where every site's copies now live.",
        "It's encrypted. All of it. The logs show what happened, in order. Through Thursday night, files were copied out of the network to a server abroad, a few hundred gigabytes at a time, using an administrator account tied to a staff member who was likely asleep. Then, at 15:20 on Friday, twenty minutes before the screens went, the same account encrypted the backup store.",
        flags.blocking
          ? "There's more. At 15:31 on Friday, nine minutes before the screens went, the same account switched off the security tool at headquarters. The blocking you'd switched on never had the chance to block anything."
          : null,
        "Bringing every copy together into one place was meant to protect the company from a failed disk or a corrupted database. It did. It also gave anyone who got in one place to destroy them all. The lockdown that would have stopped them, copies that nobody could change or delete, was booked for the first week of January.",
        "The room goes quiet. Everyone in it knows whose project it was.",
      ].filter(Boolean);
    },
    stats: { playerHealth: -10 },
    next: "act2_customers",
  },

  // The old system the player designed, on the badge, nine years ago.
  i_nineyears: {
    act: "Act 2: The Price",
    time: "21:40",
    title: "Nine Years Ago",
    text: function (flags) {
      return [
        "It's the Finance Director who remembers, at twenty to ten on Sunday night. 'The archive company. We pay them every year for something. Isn't that a copy of everything?'",
        "Nine years ago, as a young engineer, you designed the backup system, with one rule Finance have grumbled about ever since. Once a year, at the end of the financial year, a full copy of everything goes onto tape, and into an archive company's vault two hundred miles away, connected to nothing. The auditors liked it. Nobody else ever thought about it.",
        "The attackers never knew it existed. The last copy went into the vault on the thirty-first of March, long before they arrived, so whatever comes back from it is clean.",
        "The archive company's emergency retrieval costs more than a year's fees. On Monday afternoon, the tapes arrive in a locked case in the back of a courier's van, and for the first time since Friday, the mood in the war room lifts.",
      ];
    },
    stats: { teamHealth: 5 },
    days: 2,
    next: "i_tapes",
  },

  // The cost: what's on the tapes, and what isn't.
  i_tapes: {
    act: "Act 2: The Price",
    time: "08:00",
    title: "What the Tapes Don't Have",
    text: function (flags) {
      return [
        "Your engineers have been reading tapes since Monday afternoon. The index of what's on each one was kept in the backup store, encrypted with everything else, so the only way to find out is to read them all.",
        flags.isolated
          ? "Eight and a half months of headquarters' records are gone: every order, invoice and purchase order, every new customer and every new starter since April. The depots are a different story. Because you pulled the plug on Friday, their own systems are clean. They still know what's on every shelf, and they still hold Friday's orders, the ones that never left. They'll need checking before they join the new network, but not restoring."
          : "Everything since April is gone, at headquarters and at every depot: every order, invoice and purchase order, every new customer and every new starter. Eight and a half months of the business, to be rebuilt from paper, inboxes and memory.",
        flags.restore_tested
          ? "Because you held your ground in the autumn, the new warehouse system never went live. The tapes hold the same system the company still runs."
          : "The tapes were also made before the migration. They hold the old warehouse system, the one the company stopped using in November. Bringing it back means running the business on a system everyone thought they'd seen the last of, or moving everything across to the new one a second time.",
        flags.restore_tested
          ? "And your restore tests found that two depots' backups had been quietly missing their stock records for years. You fixed it in the autumn, too late for the tapes, but you know exactly what's missing. Your engineers can plan around it: what comes back from tape, what has to be rebuilt by hand, and how long each will take."
          : (flags.restore_hq
              ? "Your tests prove headquarters can be brought back, and how long it will take. The depots were never tested. This morning, you found out why that matters: two depots' backups have been quietly missing their stock records for years, and nobody noticed, because nobody had ever tried bringing them back."
              : "Nobody has ever brought anything back from these tapes. This morning, you found out what that means: two depots' backups have been quietly missing their stock records for years. The restore tests on January's list would have found it.") +
            (flags.isolated
              ? " This time, it doesn't matter: the depots' own systems survived, and they know what's on every shelf. Next time, it might."
              : " Until every shelf in those two depots has been counted by hand, nobody can say what's really there, or promise a customer anything from it. The stock take starts on Wednesday, with the volunteers who carried peak week, and runs into the weekend."),
      ];
    },
    // Something to rebuild from, and not much more.
    stats: function (flags) {
      return { service: (flags.restore_tested ? 10 : flags.restore_hq ? 5 : 0) + (flags.isolated ? 20 : 0) };
    },
    next: "i_0120",
  },

  i_0120: {
    act: "Act 2: The Price",
    time: "10:15",
    title: "01:20",
    text: function (flags) {
      return [
        leakNews(flags),
        "The lead investigator asks for a word in the corridor, away from the war room. They have a printout of the helpdesk log from the Monday night of peak week, with one line highlighted.",
        "01:20. Depot manager, out helping with deliveries, locked out at a supplier's site, phone lost. Password and login app reset by Sam.",
        "You read that line over your first coffee that morning. You remember thinking: a normal night.",
        "The real depot manager was asleep at home. They'd been out on deliveries all week, like half the company, which is why nobody thought twice. The caller had their employee number and their line manager's name. The manager's name is on a professional networking site, for anyone to find. Nobody can say yet where the employee number came from. With a reset password, the attackers were able to log in as the depot manager, and spent three days finding the administrator account they needed.",
        flags.helpdesk_watch
          ? "An hour after the reset, the alert came up on the night helpdesk's screen. Sam saw their own reset, and moved on to the next call. It's all in the log."
          : flags.monitoring
            ? "An hour after the reset, the monitoring service saw the account sign in from somewhere new, checked the helpdesk log, and closed the alert as expected. Their report says so, in black and white."
            : "An hour after the reset, the security tool flagged the account signing in from somewhere new. The alert is still in the queue, unread.",
        "Sam doesn't know yet. They're on the phones in the next room, where they've been every night since Friday. The investigators want to interview them at two o'clock.",
      ].filter(Boolean);
    },
    stats: { playerHealth: -5 },
    next: "act2_sam",
  },

  // The end of the week, and of the draft so far.
  i_week: {
    act: "Act 2: The Price",
    time: "21:00",
    title: "Nine Days",
    art: "nine_days",
    text: function (flags) {
      return [
        flags.paid
          ? "The decryption tool works the way the negotiator said it would: slowly. It takes eleven hours to unlock a single server at headquarters, and three servers never come back at all. Your engineers rebuild those by hand, beside the people restoring from the tapes."
          : flags.paid_leak
            ? "The chat window closes for the last time with a thank you. On the attackers' site, ACME Logistics' name disappears from the list. For now, there's nothing to see."
            : flags.leaked
              ? "The chat window stays open on the negotiator's laptop, silent. On the attackers' site, the files keep coming, a few more every day, and every day someone finds their own name in them."
              : "The chat goes quiet. On the attackers' site, the timer keeps counting down. When it reaches zero, everything they took will be published. Your engineers keep working, and try not to look.",
        flags.paid && flags.leaked
          ? "The files they published stay published. Paying didn't change that."
          : null,
        "You get home at nine on Sunday night, nine days after the screens went.",
        "Your partner has put the decorations up without you, and left the lights on in the front window, so you'd see them from the road.",
      ].filter(Boolean);
    },
    days: 1,
    next: "i_clipboards",
  },
  i_clipboards: {
    act: "Act 3: Paper and Pens",
    time: "05:00",
    title: "Clipboards",
    text: function (flags) {
      return [
        leakNews(flags),
        "At five in the morning, the northern depot is running on paper. " +
          (flags.isolated
            ? "Order lists printed from the depot's own system, reconnected to the new network over the weekend, are taped to the cages."
            : "Order lists rebuilt by hand, from customers' emails, phone calls and their own records, are taped to the cages.") +
          " Drivers check their drops against paper maps, and the Chief Operating Officer is back in borrowed hi-vis, reading out addresses.",
        "Since the weekend, the leadership team have been on a rota, so every depot has someone on site who can make decisions on the spot. The Chief Operating Officer has run the northern depot since Saturday. You're here to take over for the rest of the week, and they've told you to watch first.",
        flags.first_payroll
          ? "The volunteers from peak week are back, in force. Payroll came back first, and they know it: their overtime will be in the bank on Friday. Someone has written 'THANK YOU IT' on the canteen whiteboard, and someone else has added a heart."
          : flags.first_warehouse
            ? "The volunteers from peak week came back anyway, knowing their overtime won't be paid until the new year. A shift manager tells you the floor will remember this. You can't tell whether it's a promise or a warning."
            : "The volunteers from peak week are back, though fewer of them. The ones who came are packing medicines and dressings first, the way you asked.",
        flags.paid
          ? "Half your engineers aren't here. They're at headquarters, sitting with the decryption tool while it crawls through one server at a time, waiting to see what comes back whole."
          : "Your engineers are rebuilding everything from scratch, from the tapes and from memory. Every server that comes back is one they built with their own hands.",
        "Running a depot on paper is slower than running it on a computer. Much slower. But at ten past six, the first lorry of the day pulls out of the gate, and the Chief Operating Officer hands you the clipboard.",
      ].filter(Boolean);
    },
    stats: function (flags) {
      return { service: flags.paid ? 15 : 10, teamHealth: -5 };
    },
    days: 1,
    next: "act3_goodsin",
  },

  i_sam3: {
    act: "Act 3: Paper and Pens",
    time: "22:40",
    title: "Sam",
    // Sam at a desk on the phones: not when they've been suspended.
    art: function (flags) { return flags.sam_suspended ? null : "sam"; },
    text: function (flags) {
      return flags.sam_suspended
        ? [
            "At twenty to eleven, your phone lights up with a number you know.",
            "'Is there anything I can do? I can't just sit here.'",
            "HR have told you not to contact Sam while the investigation runs. You read the message four times. You don't reply.",
          ]
        : flags.sam_moved
          ? [
              "At the eastern depot, the rumour has already arrived: someone on the helpdesk let the attackers in. Sam hears it in the canteen, before anyone has told them it's true.",
              "They ring you at twenty to eleven and ask, very quietly, whether it was them.",
              "You tell them the truth. It's the conversation you moved them to avoid.",
            ]
          : [
              "When you ring the helpdesk from the depot at twenty to eleven, Sam answers, as they have every night since the screens went.",
              "When a caller is angry, Sam apologises as if it were personal. You know that, for Sam, it is.",
            ];
    },
    stats: function (flags) {
      return flags.sam_suspended || flags.sam_moved ? { playerHealth: -10 } : { playerHealth: -5 };
    },
    days: 1,
    next: "act3_tell",
  },

  i_name: {
    act: "Act 3: Paper and Pens",
    time: "23:50",
    title: "Your Name",
    text: function (flags) {
      return flags.leaked
        ? [
            "You promised yourself you wouldn't look. At ten to midnight, you look.",
            "It doesn't take long to find. A scan of your own passport, from the day you joined the warehouse fourteen years ago: younger, thinner, squinting at the camera. Beside it, HR's form, with your home address, your bank details and, under emergency contact, your partner's name.",
            "Your partner finds you at the kitchen table, and looks at the screen for a long time.",
            "Then they reach past you, turn the screen off, and take your hand. 'Bed,' they say. You don't argue.",
          ]
        : [
            "At ten to midnight, the landline rings. Nobody rings the landline.",
            "Your partner answers. It's a journalist, polite and well informed, asking for the head of IT at ACME Logistics. The number isn't listed anywhere. Somebody gave it to them.",
            "Your partner says you're asleep, though you're sitting three feet away, and puts the phone down.",
            "Then they follow the cable to the wall, pull it out, and coil it neatly on the side. 'Bed,' they say. You don't argue.",
          ];
    },
    stats: { playerHealth: -5 },
    // The care home rings at seven the next morning.
    days: 1,
    next: "act3_carehome",
  },

  i_news: {
    act: "Act 3: Paper and Pens",
    time: "18:00",
    title: "On the News",
    text: function (flags) {
      return [
        flags.competitor
          ? "The regional news leads with it at six: care homes and pharmacies hit by a cyber attack on a local distributor, and a rival firm stepping in to help. The rival's managing director is interviewed in front of a row of their lorries."
          : flags.drove
            ? "The regional news leads with it at six. Someone filmed you unloading insulin at the care home door at midnight, and the clip has been shared forty thousand times. The caption calls you 'the IT boss who did the delivery run'. You don't recognise yourself."
            : "The regional news leads with it at six: care homes running out of insulin in the middle of a flu wave, after a cyber attack on a local distributor. They interview a care home manager. You know the voice before you see the face.",
        "The Chief Executive gives an interview in the yard, in a borrowed coat, in front of lorries that aren't moving. They say what the lawyers agreed. It sounds like what the lawyers agreed.",
        flags.customers_date
          ? "The reporter asks what happened to the week ACME Logistics promised its customers. The Chief Executive doesn't have an answer."
          : flags.customers_vague
            ? "The reporter asks why ACME Logistics told its customers it was a technical issue."
            : "The reporter asks how long customers will have to wait. The Chief Executive says they don't know yet, and that they told customers so on the first Monday. It's the only answer that sounds true.",
        flags.leaked
          ? "On the attackers' site, there's a new post: a screenshot of the news report, and the words 'They could have avoided all of this.'"
          : null,
      ].filter(Boolean);
    },
    stats: function (flags) {
      var influence = flags.plan ? -10 : flags.drove ? 5 : 0;
      // A promise or a euphemism, played back on the news.
      influence += flags.customers_date ? -10 : flags.customers_vague ? -5 : 5;
      return { internalInfluence: influence };
    },
    next: "act3_desk",
  },

  // The first night run since the attack: the days offline end here.
  i_vans: {
    act: "Act 3: Paper and Pens",
    time: "04:00",
    title: "Headlights in the Darkness",
    silence: "end",
    pauses: { 1: 1.0, 2: 1.0 },
    text: function (flags, stats) {
      var full = stats.service >= SERVICE_FULL;
      return [
        "At four in the morning, with Christmas days away, you're standing in the yard at the northern depot, with your hands in your pockets and your breath in the air.",
        full
          ? "One by one, the engines start. Headlights swing across the yard and turn out through the gate: every lorry, every route, loaded " +
            (rebuildSpeed(flags) === 2 || flags.first_warehouse
              ? "from a warehouse system that's running again."
              : "from paper lists, checked twice.") +
            " The first full night run since the screens went."
          : "One by one, the engines start, and headlights turn out through the gate. Not all of them. You count the lorries that stay behind in the dark, and there are more than you'd hoped. But it's a night run, the first since the screens went.",
        "Behind the depot, most of headquarters is still dark: no email, no purchasing, and finance on spreadsheets. By the estimate you gave the board, the last of it won't be back until " +
          ["May, at best", "the end of March", "the end of February"][rebuildSpeed(flags)] + ".",
        "Every lorry leaving tonight carries goods that nobody can invoice for yet. The deliveries are back. The money isn't. The Finance Director has the days of cash left on a whiteboard in their office, and rubs one out every morning.",
        "Some of the volunteers from peak week have stayed to watch. Nobody says much. Somebody starts clapping, stops, embarrassed, and then everybody claps.",
        flags.competitor
          ? "Somewhere on the coast road, the competitor's last delivery to your care homes is on its way. From tomorrow, they're yours again, if they still want you."
          : flags.drove
            ? "The care home manager sends you a photo: three residents and a nurse, holding up a hand-drawn card. It says THANK YOU in letters the size of a lorry."
            : "On one of those lorries is the medicines run you promised the care home, a day later than they needed it. You don't know yet what that day cost. You'll find out.",
        "Then you go home. It's nearly Christmas.",
      ];
    },
    stats: { service: 10, teamHealth: 5, playerHealth: 10 },
    days: 1,
    next: "act4_bank",
  },

  i_newyear: {
    act: "Act 4: Rebuild",
    date: "2026-02-02",
    time: "08:30",
    title: "The Box Room",
    text: function (flags) {
      return [
        "From the road, ACME Logistics looks almost normal. The lorries leave on time. Inside, the finance team are working through " +
          ["seven", "five", "three"][rebuildSpeed(flags)] +
          " weeks of orders taken on paper: " + ["ninety", "sixty", "forty"][rebuildSpeed(flags)] +
          " thousand delivery notes in boxes, filling a meeting room nobody else can use" +
          (flags.it_protected ? ", with thirty fewer pairs of hands since the agency staff went." : "."),
        "Behind those are the eight and a half months the tapes didn't have, being rebuilt from customers' statements, suppliers' invoices and old emails. Finance think it will take the rest of the year.",
        [
          "The warehouse system is back, running on March's data topped up by hand. Almost everything else at headquarters is still dark: finance on spreadsheets, purchasing on paper, HR in a box file. The last system is due back in May, at best.",
          "The warehouse system and orders are back, and finance came back last week. The rest of headquarters, from purchasing to HR, is still waiting its turn. The last system won't be back before the end of March.",
          "The warehouse system, orders, finance and payroll are all back on the new network. Headquarters' smaller systems are still coming across one at a time, and the last should be back by the end of the month.",
        ][rebuildSpeed(flags)] + " " +
          (flags.restore_tested
            ? "The restore notes from the autumn, with the four days and the two missing stock records, are pinned to the server room wall, covered in three colours of pen."
            : "The full restore tests you put off until January are still on January's list. Nobody needs telling that they've been done now, the hard way."),
        "The cash ran out on " + weekday(CASH.out(flags)) + " the " + ordinal(Number(blackoutPlus(CASH.out(flags)).slice(8))) +
          ", the day the Finance Director's whiteboard said it would, and the company has lived on the overdraft since. " +
          (flags.restore_tested && flags.monitoring
            ? "The insurer's early payment keeps it smaller than it would have been."
            : "The insurer has paid the experts' bills since the first morning. It hasn't paid a penny towards anything else.") +
          " Customers are paying again, slowly, for deliveries made two months ago, and querying every invoice they can't match.",
        "At the first board meeting of the year, the Chief Executive thanks your team by name for getting the lorries moving, and the room applauds. It's the first time you've heard a board clap.",
        flags.restore_tested && flags.monitoring
          ? "The insurer's forensic accountants have started on the full claim. They have the usual questions, and very few of them."
          : "The insurer's letter arrives the same week. Before they pay anything, they're 'reviewing whether the conditions of the policy were met'.",
      ];
    },
    stats: { service: 25, internalInfluence: 10, teamHealth: 5, playerHealth: 10 },
    days: 14,
    // With tested restores and the nights watched, there's nothing for the
    // insurer to argue about.
    next: function (flags) {
      return flags.restore_tested && flags.monitoring ? "i_phishing" : "act4_insurer";
    },
  },

  // The investigators can't be sure, and say so: no neat bow.
  i_phishing: {
    act: "Act 4: Rebuild",
    date: "2026-02-16",
    time: "09:00",
    title: "Where It Started",
    text: function (flags) {
      return [
        "The investigators' final report arrives in February: ninety pages, and a two-page summary for the board.",
        "They still can't say for certain where the depot manager's employee number came from. Their best guess is an email from six weeks before peak, made to look as if it came from payroll: 'Peak-week overtime: confirm your details to get paid double.' It went to most of the warehouse and depot staff. Nobody knows how many people filled it in. The page it linked to has gone.",
        "The security tool flagged the email the morning it arrived. The alert went into the queue behind four hundred others, and nobody had got to it when the screens went black. It's probably where it started. Probably is as far as anyone will go.",
        flags.monitoring || flags.blocking
          ? "It arrived a week before you changed anything about the nights."
          : null,
        flags.cover_paused
          ? "The report's first recommendation is round-the-clock monitoring. It's in the plan, on hold until the insurer pays. Last Tuesday, at two in the morning, the security tool flagged a depot manager's account signing in from abroad. Nobody saw it until nine. It was the depot manager, on holiday in Spain. This time."
          : null,
        "The summary's last line on it is the one you read most: 'There is no evidence that any individual acted unreasonably.'",
      ].filter(Boolean);
    },
    stats: { service: 15, playerHealth: -5 },
    days: 21,
    next: "act4_name",
  },

  // Back where the career badge started.
  i_final: {
    act: "Act 4: Rebuild",
    date: "2026-04-24",
    time: "04:00",
    title: "Fourteen Years and Four Months",
    text: function (flags) {
      return [
        [
          "The last of headquarters' systems is due back next month. Your engineers are still rebuilding them, one at a time, four and a half months after the screens went.",
          "The last of headquarters' systems came back on the thirty-first of March, as you promised the board.",
          "The last of headquarters' systems came back on the twenty-seventh of February, as you promised the board.",
        ][rebuildSpeed(flags)],
        flags.insurer_fight
          ? "The insurer's settlement cleared last week, and the bank has stopped asking for Monday reports. The forty-three jobs aren't coming back."
          : "The final claim is still with the forensic accountants. It will be next year before anyone knows what the attack really cost.",
        // The promise from Act 0: the monitoring money, back by March.
        flags.monitoring
          ? (flags.isolated
            ? "At the end of March, the Finance Director asked where the money for the monitoring service had come from, as you'd promised in the autumn. You sent the service's call log from 15:41 on the day the screens went, with one line: 'This is where.' They renewed it for three years."
            : "At the end of March, the Finance Director asked where the money for the monitoring service had come from, as you'd promised in the autumn. You sent the service's call log from 15:41 on the day the screens went, and the advice you didn't take in time. The money came out of next year's training budget.")
          : null,
        "Your night shift on the line is meant to be once a year, in peak week. In April, you go back to the northern depot for a second one. Nobody asked you to.",
        "At four in the morning, you load cages for the four o'clock run, beside people who weren't old enough to work when you started. The scanners work. The screens work. On the wall, a new sign tells everyone who to ring if something looks wrong, at any hour.",
        flags.named_hr && (flags.sam_suspended || flags.sam_moved)
          ? "There's someone new on the night helpdesk. They don't know who Sam was."
          : flags.named_hr
            ? "Sam is on the night helpdesk. You think about ringing to say hello, and don't."
            : "At half past four, Sam rings from the night helpdesk to check you've remembered your gloves.",
        "At half past five, the first lorry pulls out of the gate, on time. Then the next.",
      ].filter(Boolean);
    },
    stats: function (flags) {
      return { service: 15, internalInfluence: flags.monitoring ? (flags.isolated ? 5 : -5) : 0 };
    },
    next: function (flags) { return rebuildSpeed(flags) === 0 ? "i_lastsystem" : "end"; },
  },
};

// The day the last system comes back. Its date is the one the board was
// promised; on the slowest path, it's after April's night shift.
INTERLUDES.i_lastsystem = {
  act: "Act 4: Rebuild",
  date: function (flags) { return ["2026-05-21", "2026-03-31", "2026-02-27"][rebuildSpeed(flags)]; },
  time: "17:40",
  title: "The Last One",
  text: function (flags) {
    var speed = rebuildSpeed(flags);
    return [
      "At twenty to six, the last of headquarters' systems comes back online. It's the one that matches drivers' fuel cards to their routes, and nobody outside finance has ever heard of it. Your lead infrastructure engineer types the last command, and the room waits while it starts.",
      "Then the wall of screens at the front lights up, all six of them, showing the dashboards nobody has seen since December. Somebody cheers. Somebody else starts to, and has to sit down.",
      [
        "It's been a hundred and sixty-seven days since the attackers encrypted the backup store: more than five months. You promised the board May, at best. It's the third week of May.",
        "It's been a hundred and sixteen days since the attackers encrypted the backup store: nearly four months, and the end of March, as you promised the board.",
        "It's been twelve weeks to the day since the attackers encrypted the backup store: eighty-four days, and the end of February, as you promised the board.",
      ][speed],
      "Someone has brought two bottles of champagne, warm from the boot of their car. The corks go into the ceiling tiles, and it's drunk out of coffee mugs.",
      flags.named_hr && (flags.sam_suspended || flags.sam_moved)
        ? null
        : flags.named_hr
          ? "Sam watches from the night helpdesk, and doesn't come over."
          : flags.sam_suspended
            ? null
            : "Sam comes in early for the night shift to see it, and somebody hands them a mug.",
      flags.cut_rebuild
        ? "Your engineers brought the last of it back on their own, on evenings and weekends, after the extra hands went in January."
        : null,
      "Then everybody goes back to work. The eight and a half months of information that the tapes didn't include are still in boxes, waiting to be scanned.",
    ].filter(Boolean);
  },
  stats: { service: 10, teamHealth: 5 },
  art: "last_system",
  next: function (flags) {
    return ["end", "act4_review", "act4_took"][rebuildSpeed(flags)];
  },
};

// "22nd", for a day of the month.
function ordinal(n) {
  var s = n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th";
  return n + s;
}

// Where the insurance money stands in March, on each path.
function insurerNews(flags) {
  var ransom = flags.paid || flags.paid_leak
    ? " The ransom came out of the same policy, so there's less of it left for everything else."
    : "";
  if (flags.insurer_fight) {
    return "The insurer still hasn't paid for any of the lost business, and won't until the argument is settled. To keep the company going until then, the board cuts a fifth of the jobs at headquarters. Forty-three people are told on Monday, one at a time, in the meeting room where the delivery notes used to be. The Chief Operating Officer is one of them: the board wanted a senior name, and the flagship programme was theirs. They shake your hand on the way out." + ransom;
  }
  if (flags.insurer_board) {
    return "At the start of March, the insurer released its first payment for lost business: eighty per cent of what's been agreed so far. The bank's Monday reports go on, but the tone of them has changed." + ransom;
  }
  if (flags.insurer_open) {
    return "The insurer has finished reading. Its first payment for lost business, seventy per cent of what's been agreed so far, is due in the middle of the month. The Finance Director has it circled on the wall planner." + ransom;
  }
  return ransom ? ransom.slice(1) : null;
}

for (var id in INTERLUDES) {
  INTERLUDES[id].type = "interlude";
  GAME_NODES[id] = INTERLUDES[id];
}
