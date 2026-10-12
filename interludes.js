// Interludes: the moments between decisions. Each one is a few paragraphs
// and a single Continue button. `time` is shown as a clock beside the day
// count. `text` is an array of paragraphs, or a function of (flags, stats)
// returning one. `stats` and `days` are optional, and are applied when the
// player continues. `silence: "start"` / `"end"` marks the stretch when you
// can't tell anyone what's happening.
//
// Like the rest of the story, these are anonymised: no real names, places or
// dates.

var INTERLUDES = {
  i_hotel: {
    act: "Act 0: Prequel",
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
          : "Somewhere over the ocean, your team are flying home, still laughing about the closing dinner. Not one of them knows.",
        "You lie on top of the covers with the lights off and watch the smoke alarm's green light until it gets light outside.",
      ];
    },
    stats: { playerHealth: -5 },
    next: "act1_cert_alert",
  },

  i_warroom: {
    act: "Act 1: The Advisory & Reconstruction",
    time: "03:10",
    title: "The Room",
    text: [
      "Project Lantern works from a conference room with no windows. A second badge reader went onto the door on the first day. Phones stay in a locker in the corridor.",
      "Every evening, the whiteboards are photographed and then wiped. Every morning, the same diagrams are drawn again, a little bigger.",
      "The air conditioning hums. The pizza boxes multiply. Someone has taped a sheet of paper over the glass panel in the door.",
      "You lose track of whether it's day or night. The query replays run on, line after line, each one a set of real people's records.",
    ],
    next: "act1_containment",
  },

  i_family: {
    act: "Act 1: The Advisory & Reconstruction",
    time: "19:30",
    title: "Video Call",
    text: [
      "It's dinner time at home. The laptop is propped against the fruit bowl, and you can see the kitchen you haven't stood in for over a week.",
      "'When are you coming back?' 'Soon.' 'You said that on Tuesday.' 'I know.'",
      "The dog hears your voice and looks behind the screen for you.",
      "You want to tell them. A sentence would do it: it's bad, it's big, it isn't my fault, I'll explain everything. But it's market-sensitive information, and you've signed papers saying so. Telling them could make them insiders too.",
      "So you ask about their day and listen. After you hang up, you sit in the dark hotel room for a long time.",
    ],
    stats: { playerHealth: -5 },
    days: 1,
    next: "act1_scope",
  },

  i_number: {
    act: "Act 1: The Advisory & Reconstruction",
    time: "08:05",
    title: "Everyone on the Train",
    text: [
      "Your morning commute is now a hotel shuttle and a short walk. The number from last night's briefing comes with you.",
      "The woman with the pushchair. The man reading the sports pages. The teenager with a cracked phone screen. The driver. Statistically, most of them are in the data.",
      "So are you. So is your family, and probably every friend whose birthday you can remember.",
      "You can't warn any of them. You can't even tell them to watch their bank statements. You hold the door for the woman with the pushchair, and she thanks you.",
    ],
    next: "act2_foothold",
  },

  i_coffee: {
    act: "Act 2: The Compartmented Build",
    time: "10:40",
    title: "By the Coffee Machine",
    text: function (flags) {
      return [
        "Two engineers you hired yourself are by the coffee machine. 'Apparently it's a huge client,' one says. 'Bank, I reckon. Why else all the secrecy?'",
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
    act: "Act 2: The Compartmented Build",
    time: "03:12",
    title: "Three in the Morning",
    text: function (flags, stats) {
      return [
        "You wake at 03:12, as you have every night this week. The laptop is on the other pillow.",
        "Your feed is full of another company's breach. Commentators queue up to explain how they would never be so careless: they'd have patched it, segmented the network and spotted it in hours. In a few weeks, they'll be writing about you.",
        stats.teamHealth < 50
          ? "There's an email from one of your engineers, sent at 02:40. It's just a status update, but it's 02:40, and they're the third this week."
          : "Your team are holding up better than you'd feared. You still check the timestamps on their emails.",
        "There's no one to talk to at three in the morning, and nothing you could say if there were. You draft a message to an old friend in the industry, and then delete it.",
      ];
    },
    stats: { playerHealth: -5 },
    next: "act2_trading",
  },

  i_countdown: {
    act: "Act 2: The Compartmented Build",
    time: "21:15",
    title: "A Date in the Diary",
    text: [
      "The announcement has a date. In the shared calendar, it's an innocuous meeting title that nobody would look at twice.",
      "The press release is on draft fourteen. The Q&A runs to forty pages. You rehearse answers to questions you hope nobody asks, and some that you know they will.",
      "Legal ask everyone in the read-in group not to change their social media profiles, not to update their CVs, and not to cancel anything conspicuous. Act normal.",
      "You haven't felt normal for weeks. You're starting to forget what it was like.",
    ],
    next: "act3_transparency",
  },

  i_morning: {
    act: "Act 3: Announcement",
    time: "15:52",
    title: "Eight Minutes",
    silence: "end",
    text: function (flags) {
      return [
        "Eight minutes to go. Everyone in the room is watching the same clock.",
        flags.staff_briefed
          ? "Your team were told an hour ago. You saw the moment it landed on each face: shock first, then a quiet 'so that's what it was'."
          : "Your team still don't know. In eight minutes, they'll find out from a news alert like everyone else.",
        "You text home: 'Watch the news at four. That's what it's been.'",
        "The release goes out. For a second, nothing happens. Then every phone in the room starts buzzing at once.",
        "The secret is out. You expected to feel lighter. Instead, it feels like the walls just moved.",
      ];
    },
    next: "act3_announce",
  },

  i_aftershock: {
    act: "Act 3: Announcement",
    time: "22:30",
    title: "Is This You?",
    text: [
      "You have 63 unread messages. 'Is this you?' 'Isn't this where you work?' 'Are you OK?' 'Should I freeze my credit?' 'How could you let this happen?'",
      "Your family are kind on the phone. You can hear how hurt they are that they found out at the same time as everyone else.",
      "You can talk about it now, but only in the approved words. Anything beyond the press release is still off limits: to friends, to neighbours, even to former colleagues who'd understand better than anyone.",
      "The silence hasn't ended. It's just changed shape.",
    ],
    next: "act3_lookalike",
  },

  i_home: {
    act: "Act 3: Announcement",
    time: "18:05",
    title: "Home",
    text: [
      "You fly home weeks after you were meant to. The summit lanyard is still at the top of your suitcase.",
      "The dog reaches the door first. Your family stand behind it, unsure whether to be angry or relieved, and settle on both.",
      "That night, for the first time in weeks, you tell someone everything you're allowed to. It isn't everything. It's still more than you've said out loud since the briefing room.",
      "You sleep for eleven hours.",
    ],
    stats: { playerHealth: 15 },
    days: 2,
    next: "act4_fallout",
  },

  i_hearing: {
    act: "Act 4: Aftermath",
    time: "14:00",
    title: "Live Coverage",
    text: [
      "The hearing is on every screen in the office. Nobody pretends to be working.",
      "The former CEO apologises again. A lawmaker reads out a list of failures, and you recognise work your team did, reduced to a single damning sentence.",
      "Months of nights in the room with no windows, the overnight cutovers and the forty-page Q&A get no mention at all. Nobody outside the read-in group will ever know what it took.",
      "You switch off the screen, and somebody quietly switches it back on.",
    ],
    next: "act4_dutyofcare",
  },
};

for (var id in INTERLUDES) {
  INTERLUDES[id].type = "interlude";
  GAME_NODES[id] = INTERLUDES[id];
}
