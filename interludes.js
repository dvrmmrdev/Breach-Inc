// Interludes: the moments between decisions. Each one is a few paragraphs
// and a single Continue button. `time` is shown as a clock beside the day
// of the incident (Day 1 is the briefing night), or beside `when` if set. `text` is an array of paragraphs, or a function of (flags, stats,
// days left before Legal's date) returning one. `stats` (also optionally a function) and `days` are optional, and are applied when the
// player continues. `silence: "start"` / `"end"` marks the stretch when you
// can't tell anyone what's happening. `deadlineCheck` is where Legal's date
// arrives: any days over it are squeezed into nights, at a cost to health.
// `set` names a flag to raise when the player continues.
//
// Effects, for the moments that should be felt as well as read:
//   `turn`        the colours drain to red as the last paragraph appears.
//   `pace`        seconds between paragraphs appearing (default 0.6).
//   `pauses`      extra seconds to wait before particular paragraphs, as
//                 { paragraph: seconds }.
//   `countdown`   the clock ticks on to `to`, arriving as paragraph `at`
//                 appears (paragraphs count from 0).
//   `buzz`        the card shudders like a vibrating phone at that paragraph.
//   `noise`       `messages` pile in, and the unread count climbs to
//                 `unread`, before the text appears.
//   `homecoming`  the red drains back to blue, the edges of the screen lift,
//                 and Continue fades out like falling asleep.
//   `flashback`   the card flickers grey under strip lights, in full red, at
//                 that paragraph.
//
// Like the rest of the story, these are anonymised: no real names, places or
// dates.

var INTERLUDES = {
  i_inherit: {
    act: "Act 0: Things Are Looking Up",
    time: "18:20",
    when: "Your first month", // before the summit; see game.js for the default
    title: "The Team You Inherit",
    text: [
      "The security team you inherit is one team only on the org chart. Years of budget cycles and performance management processes have left it as a collection of fragmented teams, spread across offices and time zones. They compete with each other on almost every front: for budget, for headcount, for credit, and for the top performance ratings.",
      "Your skip-level meetings tell the same story everywhere. People feel unheard and under-resourced, and they're blamed for every incident. The best of them are taking calls from recruiters.",
      "You decide to bring everyone together in one place: a national All Hands at headquarters, where the whole team can unite behind a new strategy and a shared mission.",
      "You spend your evenings writing the mission statement and your days fighting for the travel budget.",
    ],
    days: 5, // planning the week, then the week itself
    next: "i_summit",
  },

  i_summit: {
    act: "Act 0: Things Are Looking Up",
    time: "21:40",
    title: "The Summit",
    text: [
      "The week at ACME Inc.'s headquarters is a success. Teams that spent years competing argue, then listen, then start finishing each other's sentences.",
      "By the last day, everyone is united behind a set of goals for the next 12 to 18 months that are achievable and genuinely valuable. Cross-cutting teams are named to deliver each one, drawn from every region.",
      "After the wrap-up dinner, the coaches bring everyone back to headquarters to collect their bags, and you stand at the front entrance waving people off to the airport. They leave with a spring in their step. The next year is going to be a great one.",
      "The imposter syndrome you've always struggled with has quietened to a whisper. If you can bring these people and teams together and energise them in the space of a week, maybe you do belong in a leadership role.",
    ],
    stats: { teamHealth: 80 },
    next: "i_gesture",
  },

  // The turn from the happy era to the breach: the colours drain to red as
  // the CISO starts to speak.
  i_gesture: {
    act: "Act 0: Things Are Looking Up",
    time: "22:05",
    title: "A Quick Word",
    turn: true,
    // A beat before the last line, which turns red as it lands.
    pauses: { 5: 1.5 },
    text: [
      "The last taxi pulls away. You turn back into the office, still smiling, and see the Chief Information Security Officer, the CISO, across the empty lobby, gesturing for you to come over. You didn't know they were still in the building.",
      "You head over with a grin, ready to fill them in on your plans and share the good news: the team is finally one team.",
      "Before you can start, they usher you into a small meeting room and close the door behind you.",
      "Someone from the Legal department is already sitting at the table. They don't look happy.",
      "The CISO begins to speak, and the happy, optimistic world you were living in a moment ago starts to fall apart.",
      "'I'm afraid you're not going to be able to fly home to your family this evening.'",
    ],
    next: "act0_breach",
  },

  i_hotel: {
    act: "Act 1: Living in Silence",
    time: "23:48",
    title: "Room 1412",
    silence: "start",
    text: function (flags) {
      return [
        "The hotel gives you the same room you checked out of this morning. Your suitcase is still packed for the flight home, with the summit lanyard on top.",
        "You call home. 'Something's come up at work. I need to stay a few more days.' A pause on the line. 'What kind of something?' You open your mouth, and then you remember the briefing room. 'Just work. I'm sorry. I can't really say.'",
        "You can hear that they don't believe it's nothing. You don't believe it either.",
        flags.shared_load
          ? "Two of your leaders know now, so you aren't the only one, but they're in hotel rooms of their own, and you've been told not to discuss it over the phone."
          : "Somewhere at thirty thousand feet, your team are flying home, still laughing about the closing dinner. Not one of them knows.",
        "You lie on top of the covers with the lights off and watch the smoke alarm's green light until it gets light outside.",
      ];
    },
    stats: { playerHealth: -5 },
    days: 1, // the briefing room and this night are the same day
    next: "act1_cert_alert",
  },

  i_warroom: {
    act: "Act 1: Living in Silence",
    time: "03:10",
    title: "The War Room",
    text: function (flags) {
      return [
        "Project Lantern works from a conference room with no windows, known to everyone in it as the war room. A second badge reader went onto the door on the first day. Phones stay in a locker in the corridor.",
        "Every evening, the whiteboards are photographed and then wiped. Every morning, the same diagrams are drawn again, a little bigger.",
        "You see the same faces in the same clothes three days running. Shifts stretch past sixteen hours, and some people stop going home between them at all.",
        "The room smells of stale pizza. On the first night, it was a treat. By the third day, nobody can face another slice, and the boxes keep arriving anyway.",
        "Under the strip lights, everyone's skin turns the same pasty grey. Someone has taped a sheet of paper over the glass panel in the door.",
        "You lose track of whether it's day or night. The query replays run on, line after line, each one a set of real people's records.",
      flags.patching_first
        ? "One thing goes right. Your up-to-date list of systems means Lantern knows which systems exist, who owns them and where their logs live. It saves days of guesswork."
        : "Nobody is sure which systems exist, who owns them or where their logs live. Every answer starts with a hunt.",
      ];
    },
    // The foundations you laid in your first week pay off here.
    stats: function (flags) {
      return flags.patching_first ? { internalInfluence: 5, teamHealth: 10, playerHealth: 5 } : {};
    },
    next: "act1_visitors",
  },

  i_family: {
    act: "Act 1: Living in Silence",
    time: "19:30",
    title: "Video Call",
    // The two silences the conversation names, and a beat after you can't answer.
    pauses: { 2: 1.5, 5: 2, 6: 1 },
    text: [
      "It's dinner time at home. The phone is propped against the fruit bowl, and through its camera you can see the kitchen you haven't stood in for over a week. The dog hears your voice and looks behind the phone for you.",
      "'When are you coming back?' 'Soon.' 'You said that on Tuesday.' 'I know.'",
      "A pause. 'Is there someone else?'",
      "You stumble over your words. No, of course not, it's work, just work, and you'll explain everything as soon as you're able to.",
      "Another pause. 'When will that be?'",
      "You can't answer.",
      "You want to tell them. A sentence would do it: it's bad, it's big, it isn't my fault, I'll explain everything. But it's market-sensitive information, and you've signed papers saying so. Telling them could make them insiders too.",
      "So you ask about their day and listen. After you hang up, you sit in the dark hotel room for a long time.",
    ],
    stats: { playerHealth: -5 },
    days: 1,
    next: "act1_scope",
  },

  i_number: {
    act: "Act 1: Living in Silence",
    time: "08:05",
    title: "Everyone on the Train",
    text: [
      "Your morning commute is now a crowded train from the hotel to headquarters. The number from last night's briefing comes with you.",
      "The woman with the pushchair. The man reading the sports pages. The teenager with a cracked phone screen. The guard checking tickets. Statistically, most of them are in the data.",
      "So are you. So is your family, and probably every friend whose birthday you can remember.",
      "You can't warn any of them. You can't even tell them to watch their bank statements. At your stop, you help the woman lift her pushchair onto the platform, and she thanks you.",
    ],
    next: "act2_foothold",
  },

  i_coffee: {
    act: "Act 2: Under Pressure",
    time: "10:40",
    title: "By the Coffee Machine",
    // Deciding whether to lie.
    pauses: { 2: 1.2 },
    text: function (flags) {
      return [
        "Two engineers you've worked with for years are by the coffee machine. 'Apparently it's a huge client,' one says. 'Bank, I reckon. Why else all the secrecy?'",
        "They look at you, half joking, half hoping. 'You know, don't you?'",
        flags.blackout
          ? "Some of their leads have been read in, so the rumours have grown more precise and more dangerous. You give them the line you've been given."
          : "You give them the line you've been given. It comes out more smoothly than you'd like.",
        "They nod and go back to their desks, building a site for a victim they don't know is themselves. You've never lied to your team like this before. You'll do it again tomorrow.",
      ];
    },
    next: "act2_scale",
  },

  i_3am: {
    act: "Act 2: Under Pressure",
    time: "03:12",
    title: "Three in the Morning",
    text: function (flags, stats, left) {
      return [
        "You wake at 03:12, as you have every night this week. The laptop is on the other pillow, still turned on. The company's colourful screensaver is the only light in the room.",
        "Your feed is full of another company's breach. Commentators queue up to explain how they would never be so careless: they'd have patched it, segmented the network and spotted it in hours. " +
          (left === 1 ? "By tomorrow night" : left ? "In " + left + " days" : "Soon") + ", they'll be writing about you.",
        stats.teamHealth < 50
          ? "There's an email from one of your engineers, sent at 02:40. It's just a status update, but it's 02:40, and they're the third this week."
          : "Your team are holding up better than you'd feared. You still check the timestamps on their emails.",
        "There's no one to talk to at three in the morning, and nothing you could say if there were. You draft a message to an old friend in the industry, and then delete it.",
      ];
    },
    stats: { playerHealth: -5 },
    next: "act2_shifts",
  },

  i_countdown: {
    act: "Act 2: Under Pressure",
    time: "21:15",
    title: "A Date in the Diary",
    text: function (flags, stats, left) {
      return [
        (flags.date_forward
          ? "Legal's date is closer than it was. After the share sale, they brought it forward: with an HR manager's trades under investigation, every extra day of secrecy is another day for someone else to trade on what they know. "
          : "") +
          (left === 1 ? "The announcement is tomorrow." : "The announcement is " + left + " days away.") +
          " In the shared calendar, it's an innocuous meeting title that nobody would look at twice.",
        "The press release is on draft fourteen. The Q&A runs to forty pages. You rehearse answers to questions you hope nobody asks, and some that you know they will.",
        "Legal ask everyone in the read-in group not to change their social media profiles, not to update their CVs, and not to cancel anything conspicuous. Act normal.",
        "You haven't felt normal for weeks. You're starting to forget what it was like.",
      ];
    },
    next: "act3_transparency",
  },

  i_morning: {
    act: "Act 3: Going Public",
    time: "15:52",
    title: "Eight Minutes",
    silence: "end",
    // Slower than usual, so the clock can run down: it reaches 16:00 as the
    // release goes out, and the phones go off two paragraphs later.
    pace: 1.5,
    countdown: { to: "16:00", at: 3 },
    buzz: 5,
    // Legal's date has arrived, whether or not the work is done.
    deadlineCheck: true,
    text: function (flags) {
      return [
        "Eight minutes to go. Everyone in the room is watching the same clock.",
        flags.overrun
          ? "Legal's date didn't move. The work didn't fit, so " +
            (flags.overrun === 1
              ? "the last day of it was squeezed in overnight."
              : "the last " + flags.overrun + " days of it were squeezed into nights.") +
            " Half the room hasn't slept properly in a week."
          : "The work fit inside Legal's date, just. For the last few days, the team could sleep before it all began.",
        "You text home: 'Watch the news at four. That's what it's been.'",
        flags.staff_briefed
          ? "Your team were told an hour ago. When the all-staff email landed, the open-plan floor went completely silent, and it hasn't recovered."
          : "The release goes out, and the all-staff email lands in every inbox at the same moment. The open-plan floor goes completely silent.",
        "The only sound comes from the corner, where a colleague who has given most of their working life to this company is crying quietly at their desk, watching it fall apart on their screen.",
        "Then every phone in the room starts buzzing at once.",
        "The secret is out. You expected to feel lighter. Instead, you feel responsible for the weight that has just landed on everyone's shoulders, and on your team's most of all.",
      ];
    },
    next: "i_clients",
  },

  i_clients: {
    act: "Act 3: Going Public",
    time: "16:09",
    title: "On the Call",
    text: [
      "Nine minutes after the release, you're pulled into a conference room. One of the country's biggest banks, an ACME Inc. client, is on the line, and they want answers now.",
      "The bank expected the CISO to be on the call, but they're not here. Perhaps they're with the board, now that the announcement is out. Perhaps they're on the phone to their family, explaining why they haven't been home in so long. Perhaps this moment is just too much, on top of the pressure of the last few weeks. Feeling the way you do, you'd understand.",
      "Downstairs, your team are taking in the news. You should be with them. Hundreds of miles away, your family are seeing the story on the news. You should be with them. You're not. Instead, you're on mute, listening to a client's general counsel read out contract clauses.",
      "A client Q&A was on the plan before the announcement, but under pressure, it slipped. So you invent answers on the fly, based on what you're pretty sure are known facts, and paste each one into a shared document while the next call connects.",
      "The last call ends after nine. You slope back to your hotel room. It's the same small room it's been for weeks, and tonight it feels smaller than ever.",
    ],
    stats: { playerHealth: -5 },
    next: "i_aftershock",
  },

  i_aftershock: {
    act: "Act 3: Going Public",
    time: "22:30",
    title: "Is This You?",
    // After weeks of silence, the noise arrives all at once.
    noise: {
      unread: 63,
      messages: [
        "Is this you?",
        "Isn't this where you work?",
        "Just seen the news. Are you OK?",
        "Should I cancel my cards?",
        "Call me when you can x",
        "Did you know about this?",
        "Hi, I'm writing a piece on the breach and wondered if you'd talk to me",
        "How could you let this happen?",
        "Is my data in it?",
        "Thinking of you",
        "Mate. Is this your lot?",
        "Are you going to lose your job?",
      ],
    },
    text: [
      "You have 63 unread messages on your phone. 'Is this you?' 'Isn't this where you work?' 'Are you OK?' 'Should I cancel my cards?' 'How could you let this happen?'",
      "Your family are kind on the phone. You can hear how hurt they are that they found out from the news, like everyone else.",
      "You can talk about it now, but only in the approved words. Anything beyond the press release is still off limits: to friends, to neighbours, even to former colleagues who'd understand better than anyone.",
      "The silence has ended. Now the noise is overwhelming.",
    ],
    next: "act3_announce",
  },

  i_exposed: {
    act: "Act 3: Going Public",
    time: "12:30",
    title: "Open Season",
    text: function (flags) {
      return [
        "Every day now is back-to-back client calls from 8am to 7pm. Your team pass the angriest and rudest clients up to you, as they should. By evening your voice is hoarse, and there are four hundred unopened emails from people who also needed you.",
        "Every hour on those calls is an hour you're not with your own team. They're living through the same headlines and the same questions from their families, and they need you to help them through it. You pass them in the corridor between calls and promise to catch up properly. You don't get the chance.",
        flags.staff_briefed
          ? "ACME Inc.'s account managers had an hour's notice and a two-page FAQ. It wasn't enough. Their clients had been watching the news all evening, and rang with details of the attack that the account managers were hearing for the first time. Some of them now forward every client email to you, unread."
          : "ACME Inc.'s account managers found out with everyone else. Within minutes, their clients were on the phone, quoting details from the news that the account managers were hearing for the first time. Some of them now forward every client email to you, unread.",
        "The security industry has turned on you. Commentators who've never met your team pick through their professional profiles. A gap between jobs becomes a scandal. Veteran leaders, whose degrees predate cybersecurity as a subject, are mocked for having no formal security education.",
        flags.separate_domain
          ? "Researchers line up to show that your response site looks exactly like a phishing site: a newly registered domain nobody has heard of, asking for personal details. Some company web filters block it outright. The one place you've told people to go is the one place they don't trust."
          : null,
        "Corporate security sends every senior leader formal advice: if a stranger asks where you work, name a different employer, and report anything suspicious in or around the building. Private security for the executives is quietly increased.",
        "One of your team is served with a lawsuit naming them personally.",
        "Another is told to change the domain registration for their personal website, because it gives their home address to anyone who looks.",
        "They did their jobs. Now their names are part of the story.",
      ].filter(Boolean);
    },
    // A white-label response site on an unfamiliar domain costs trust as well.
    stats: function (flags) {
      return flags.separate_domain ? { teamHealth: -5, internalInfluence: -10 } : { teamHealth: -5 };
    },
    next: "act3_storm",
  },

  i_home: {
    act: "Act 3: Going Public",
    time: "18:05",
    title: "Home",
    // A moment before sleep, and the fade.
    pauses: { 5: 1.5 },
    // A reprieve, not a recovery: Act 4 opens red again, a little muted.
    homecoming: true,
    set: "home",
    text: [
      "Weeks after you were meant to, you finally head home. The summit lanyard is still at the top of your suitcase.",
      "You've been told not to name your employer to anyone while the story is running. At the hotel desk, as you finally check out after weeks, the receptionist sees the company name on the booking and asks if you're 'with that lot who lost everyone's data'. You say you just book the travel. At the airport check-in desk, the agent asks who you work for and why you've been away so long. You give the answer you were told to give. It isn't the truth, and your heart pounds until the stamp comes down.",
      "The dog reaches the door first. Your family stand behind it, unsure whether to be angry or relieved, and settle on both.",
      "That night, for the first time in weeks, you tell someone everything you're allowed to. It isn't everything. It's still more than you've said out loud since the briefing room.",
      "Halfway through, you stop talking and cry on your partner's shoulder. They hold on, and don't ask you to finish.",
      "You sleep for eleven hours.",
    ],
    stats: { playerHealth: 20 },
    days: 2,
    next: "act4_fallout",
  },

  i_normal: {
    act: "Act 4: Aftermath",
    time: "10:00",
    title: "Back to Normal?",
    when: "Months later", // shown instead of the day count
    // Everyone waits for your answer. Then "...the war room comes back", and
    // it takes a moment to come back from it.
    pauses: { 3: 1.5, 4: 2.5 },
    flashback: 3,
    text: function (flags) {
      return [
        "Months later, the diary starts to look ordinary again. Today is your first routine risk meeting since the breach.",
        "A product manager presents a request: accept the risk of an unpatched system for one more quarter. It sits behind other controls, the fix needs a code freeze, and the release it would delay is worth millions. A year ago, you'd have signed it off with a couple of conditions.",
        "Everyone turns to you.",
        "You open your mouth, and the war room comes back: the strip lights, the query replays, and the merchant portal " +
          (flags.patching_first ? "that was due for its security update next quarter." : "that sat in the backlog nobody touched."),
        "You can't say yes. You're not sure you'll ever be able to say yes again. But a security team that says no to everything is the source of paranoid friction and delay you promised you'd never be.",
        "'Let me come back to you,' you say. It's the first time you've ever said that in this meeting.",
      ];
    },
    days: 60,
    next: "epilogue",
  },

  i_hearing: {
    act: "Act 4: Aftermath",
    time: "14:00",
    title: "Live Coverage",
    text: function (flags) {
      return [
        "The hearing is on every screen in the office. Nobody pretends to be working.",
        "The former CEO apologises again. A lawmaker reads out a list of failures, and you recognise work your team did, reduced to a single damning sentence.",
        flags.narrow_scope
          ? "Then a new line: the secondary systems your team never examined have turned up more records. The number goes up again, live on air."
          : null,
        flags.revised_up && !flags.narrow_scope
          ? "The lawmaker reads out the latest revision of the number, and asks why it keeps changing."
          : null,
        flags.date_forward
          ? "Then the share sale. Investigators want to know what senior staff knew, and when. Your escalation is on the record, with the date and time, and the board know it."
          : "Then the share sale. Investigators want to know what senior staff knew, and when, and your name is on their list. You raised nothing at the time.",
        flags.shielded
          ? "The lawmaker's timeline matches the updates the war room gave the board, line for line. Nobody can claim they weren't told."
          : null,
        "Weeks of nights in the war room, the password resets and the forty-page Q&A get no mention at all. Nobody outside the read-in group will ever know what it took.",
        "You switch off the screen, and somebody quietly switches it back on.",
      ].filter(Boolean);
    },
    // Choices that looked cheap at the time cost you here, and some that
    // cost you at the time pay off.
    stats: function (flags) {
      var influence = 0, you = 0;
      if (flags.narrow_scope) { influence -= 5; you -= 5; }
      if (flags.revised_up) influence -= 5;
      if (flags.date_forward) influence += 5;
      else { influence -= 5; you -= 5; }
      if (flags.shielded) influence += 5;
      return { internalInfluence: influence, playerHealth: you };
    },
    next: "act4_dutyofcare",
  },
};

for (var id in INTERLUDES) {
  INTERLUDES[id].type = "interlude";
  GAME_NODES[id] = INTERLUDES[id];
}
