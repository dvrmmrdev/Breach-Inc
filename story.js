// The story: scenes keyed by id. Each choice says where it leads, what it
// costs in money and days, how it moves the three stats, and what happened
// (shown in the log once chosen). `set` records a flag later scenes can read,
// and `text` may be a function of those flags.
//
// Everything here is anonymised: the company, people, projects, products,
// places and dates are fictional or generic.

var STATS = {
  internalInfluence: { label: "Influence", start: 50 },
  teamHealth: { label: "Team health", start: 100 },
  playerHealth: { label: "Your health", start: 100 },
};

var START_NODE = "act0_start";

var GAME_NODES = {
  act0_start: {
    act: "Act 0: Prequel",
    title: "Promotion & Inherited Architecture",
    text: "You are promoted to the Global Cyber Senior Leadership Team at ACME Inc., a market-leading consumer data and analytics company. Behind the congratulatory emails lies an enterprise shaped by years of rapid acquisitions, legacy application stacks, and relentless pressure to ship revenue-generating products ahead of routine control maintenance. In your first week, you must set your technical priorities.",
    choices: [
      {
        text: "Prioritise asset discovery, CMDB reconciliation, and clearing ACME Inc.'s legacy patching debt.",
        nextNode: "act0_allhands",
        cost: 250000,
        days: 10,
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        outcome: "Business units grumble about change freezes, but your inventory finally matches reality more often than not.",
      },
      {
        text: "Prioritise commercial alignment and developer velocity; avoid operational friction with business units.",
        nextNode: "act0_allhands",
        cost: 50000,
        days: 5,
        stats: { internalInfluence: 10, teamHealth: 5, playerHealth: 5 },
        outcome: "Product leaders welcome you warmly. The patching backlog stays where it was.",
      },
    ],
  },

  act0_allhands: {
    act: "Act 0: Prequel",
    title: "The Global Summit",
    text: "You host your international security team at ACME Inc.'s global headquarters. The summit ends on a high: new senior hires have joined, and morale is strong. As you say goodbye to engineers heading to the airport after the wrap-up dinner, the CISO pulls you into a secure briefing room: 'There has been a breach at ACME Inc. One of the largest in corporate history.' Your flight home is cancelled immediately.",
    choices: [
      {
        text: "Accept the confidentiality orders; say nothing to your departing team.",
        nextNode: "act1_cert_alert",
        cost: 0,
        days: 1,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -10 },
        outcome: "Your team fly home cheerful. You stay behind with a secret you can't share.",
      },
      {
        text: "Push for broader security leadership involvement to avoid single points of failure.",
        nextNode: "act1_cert_alert",
        cost: 50000,
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: -5 },
        outcome: "Legal reluctantly read in two more of your leaders. The load is shared, but you've spent goodwill.",
      },
    ],
  },

  act1_cert_alert: {
    act: "Act 1: The Advisory & Reconstruction",
    title: "Reconstructing the Window",
    text: "You review the incident dossier. A national CERT bulletin flagged a critical remote code execution flaw in a widely used open-source web framework months ago. Automated network scans missed a legacy customer-facing portal, leaving the attackers a foothold for over two months. The internal response team, Project Lantern, has under four weeks to stand up big-data clusters, ingest terabytes of logs, and replay the attackers' queries.",
    choices: [
      {
        text: "Mandate around-the-clock forensic reconstruction shifts to establish the full exposure.",
        nextNode: "act1_containment",
        cost: 200000,
        days: 10,
        stats: { internalInfluence: 5, teamHealth: -20, playerHealth: -15 },
        outcome: "Lantern works in shifts through every night. The picture sharpens quickly, and so do tempers.",
      },
      {
        text: "Limit the forensic scope to the primary databases to protect staff stamina ahead of the public fallout.",
        nextNode: "act1_containment",
        cost: 100000,
        days: 8,
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        set: "narrow_scope",
        outcome: "The team stays on its feet, but the board asks why some systems haven't been looked at.",
      },
    ],
  },

  act1_containment: {
    act: "Act 1: The Advisory & Reconstruction",
    title: "Overnight Changes",
    text: "The containment plan lands on your desk. Thousands of network and service account passwords must be changed, the network reshaped, and upgraded security controls deployed, all without alerting staff outside the read-in group that anything is wrong.",
    choices: [
      {
        text: "Run one coordinated overnight cutover and accept the risk of outages.",
        nextNode: "act1_scope",
        cost: 150000,
        days: 2,
        stats: { internalInfluence: -5, teamHealth: -10, playerHealth: -5 },
        outcome: "By morning the network looks very different. Two business systems fail to start, and nobody can be told why the change was urgent.",
      },
      {
        text: "Stage the changes over a week, disguised as routine maintenance.",
        nextNode: "act1_scope",
        cost: 100000,
        days: 7,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        outcome: "The cover holds and nothing breaks, but you lie awake wondering what the attackers could still reach in the meantime.",
      },
    ],
  },

  act1_scope: {
    act: "Act 1: The Advisory & Reconstruction",
    title: "How Many People?",
    text: function (flags) {
      return (
        "Lantern's replay of the attackers' queries points to records for a huge share of the adult population of your home market. " +
        (flags.narrow_scope
          ? "Because you narrowed the scope, the secondary systems haven't been examined, so the number may grow. "
          : "") +
        "Legal want certainty before any number is made public."
      );
    },
    choices: [
      {
        text: "Announce a cautious upper estimate, accepting it may later be revised down.",
        nextNode: "act2_foothold",
        cost: 50000,
        days: 2,
        stats: { internalInfluence: -5, teamHealth: 0, playerHealth: -5 },
        outcome: "Legal are unhappy with a number that could be too high, but you won't have to announce a bigger one later.",
      },
      {
        text: "Wait until the number is exact.",
        nextNode: "act2_foothold",
        cost: 100000,
        days: 5,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        set: "revised_up",
        outcome: "The number satisfies Legal. Months later, further analysis pushes it up, and every revision makes headlines.",
      },
    ],
  },

  act2_foothold: {
    act: "Act 2: The Compartmented Build",
    title: "Project Harbour & the Blind Build",
    text: "To build the consumer lookup portal and bring in more than a thousand external contact centre agents, ACME Inc. sets up a separate unit, Project Harbour. To prevent leaks, its staff are told they are supporting an incident at an unnamed client, without knowing the victim is ACME Inc. itself. The secrecy creates tension, rumours spread, and the engineers have no clear trading restrictions.",
    choices: [
      {
        text: "Keep the cover story; compartmentation protects the announcement.",
        nextNode: "act2_scale",
        cost: 0,
        days: 3,
        stats: { internalInfluence: 5, teamHealth: -10, playerHealth: -5 },
        outcome: "The secret holds. Harbour's engineers keep guessing among themselves.",
      },
      {
        text: "Read the team leads in under NDA and push for a blanket trading blackout.",
        nextNode: "act2_scale",
        cost: 25000,
        days: 3,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: -5 },
        set: "blackout",
        outcome: "Legal give in on the blackout after a hard argument. The leads are relieved to know the truth.",
      },
    ],
  },

  act2_scale: {
    act: "Act 2: The Compartmented Build",
    title: "Built for Everyone",
    text: "On announcement day, every adult in the country may try to check whether they were affected. Harbour's engineers want to build on ACME Inc.'s own platform and domain. A vendor offers a hosted site on a separate, newly registered domain that could be live in days.",
    choices: [
      {
        text: "Use the vendor's hosted site on a separate domain.",
        nextNode: "act2_callcentres",
        cost: 400000,
        days: 5,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: 0 },
        set: "separate_domain",
        outcome: "Load tests pass easily. A few people raise concerns that the new domain looks nothing like ACME Inc.",
      },
      {
        text: "Build it on ACME Inc.'s own domain and infrastructure.",
        nextNode: "act2_callcentres",
        cost: 250000,
        days: 12,
        stats: { internalInfluence: -5, teamHealth: -15, playerHealth: -5 },
        outcome: "Customers will recognise the address, but scaling legacy infrastructure in under a fortnight nearly breaks the team.",
      },
    ],
  },

  act2_callcentres: {
    act: "Act 2: The Compartmented Build",
    title: "A Thousand New Voices",
    text: "Contact centre partners can supply more than a thousand agents across several new sites. They need scripts, training, and a way to verify callers. You can't ask callers for the data that was stolen, so identity checks must rely on other data ACME Inc. holds.",
    choices: [
      {
        text: "Use a tight script and route every unusual question to your team.",
        nextNode: "act2_trading",
        cost: 300000,
        days: 4,
        stats: { internalInfluence: 5, teamHealth: -10, playerHealth: -5 },
        outcome: "The agents are ready on time. Your team's inbox is about to become every caller's escalation route.",
      },
      {
        text: "Train agents in depth, accepting a later go-live.",
        nextNode: "act2_trading",
        cost: 500000,
        days: 6,
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        outcome: "The business pushes hard for an earlier launch, but the agents can answer most questions themselves.",
      },
    ],
  },

  act2_trading: {
    act: "Act 2: The Compartmented Build",
    title: "The Share Sale",
    text: function (flags) {
      return (
        "Compliance flag that a senior manager outside the read-in group, but close to Project Harbour, sold a large block of shares last week. " +
        (flags.blackout
          ? "Your trading blackout covered Harbour's leads, but not this manager."
          : "No trading restrictions were in place for anyone near Harbour.") +
        " Rumours suggest some staff have guessed the truth."
      );
    },
    choices: [
      {
        text: "Escalate formally to Legal and the board immediately.",
        nextNode: "act3_transparency",
        cost: 25000,
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 0, playerHealth: -5 },
        outcome: "It becomes a matter for the regulators. Your concern is on record.",
      },
      {
        text: "Leave it to Compliance and focus on the launch.",
        nextNode: "act3_transparency",
        cost: 0,
        days: 0,
        stats: { internalInfluence: 5, teamHealth: 0, playerHealth: -10 },
        outcome: "Months later the trades become a criminal case, and investigators ask what you knew and when.",
      },
    ],
  },

  act3_transparency: {
    act: "Act 3: Announcement",
    title: "Who Hears First?",
    text: "The announcement is days away. Your security team, and the wider company, still don't know. You must decide how much they are told, and when.",
    choices: [
      {
        text: "Brief all staff an hour before the press release, with FAQs and support lines ready.",
        nextNode: "act3_announce",
        cost: 50000,
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 10, playerHealth: -5 },
        outcome: "There's shock but no leak. Your team hear it from you, not the news.",
      },
      {
        text: "Staff learn with the public, to minimise the risk of a leak.",
        nextNode: "act3_announce",
        cost: 0,
        days: 1,
        stats: { internalInfluence: 5, teamHealth: -10, playerHealth: -5 },
        outcome: "Your engineers find out from news alerts on their phones. Some of them never quite forgive it.",
      },
    ],
  },

  act3_announce: {
    act: "Act 3: Announcement",
    title: "Announcement Day",
    text: "The press release goes out. Within minutes, traffic to the lookup portal dwarfs the forecasts, and the story leads every news bulletin. Commentators who have never run a security team explain what you should have done.",
    choices: [
      {
        text: "Press Legal to let you brief trusted industry peers privately on the technical story.",
        nextNode: "act3_lookalike",
        cost: 0,
        days: 2,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: -5 },
        outcome: "Peers start correcting the worst speculation. Legal will remember that you pushed.",
      },
      {
        text: "Leave all communication to the corporate communications team.",
        nextNode: "act3_lookalike",
        cost: 0,
        days: 2,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        outcome: "The message stays consistent, and so does the speculation. Your team read every hostile thread.",
      },
    ],
  },

  act3_lookalike: {
    act: "Act 3: Announcement",
    title: "The Wrong Website",
    text: function (flags) {
      return (
        "A researcher reports that ACME Inc.'s official social media accounts have sent consumers to a lookalike of the response site, registered by someone else to show how easy it was. " +
        (flags.separate_domain
          ? "The unfamiliar separate domain made the imitation easy to believe."
          : "Even with the site on ACME Inc.'s own domain, a mistyped link in one post was enough.")
      );
    },
    choices: [
      {
        text: "Remove the posts, apologise publicly, and register the most likely lookalike domains.",
        nextNode: "act3_storm",
        cost: 50000,
        days: 1,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        outcome: "It's an embarrassing day, but it's over in one news cycle.",
      },
      {
        text: "Correct the posts quietly and say nothing.",
        nextNode: "act3_storm",
        cost: 0,
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 0, playerHealth: -5 },
        outcome: "Journalists had already taken screenshots. The cover-up becomes the story.",
      },
    ],
  },

  act3_storm: {
    act: "Act 3: Announcement",
    title: "The Storm",
    text: "A major hurricane makes landfall near two of your new contact centres just as call volumes peak. Hundreds of agents go offline, and the wait to reach an agent stretches to hours.",
    choices: [
      {
        text: "Move overflow calls to your security team and internal volunteers.",
        nextNode: "act4_fallout",
        cost: 0,
        days: 5,
        stats: { internalInfluence: 10, teamHealth: -15, playerHealth: -5 },
        outcome: "Wait times come down. Your threat analysts spend a week reading out call scripts.",
      },
      {
        text: "Pay a premium for emergency capacity elsewhere and publish honest wait times.",
        nextNode: "act4_fallout",
        cost: 600000,
        days: 3,
        stats: { internalInfluence: -5, teamHealth: 0, playerHealth: -5 },
        outcome: "Finance wince, and the published wait times make headlines, but your team keep working on security.",
      },
    ],
  },

  act4_fallout: {
    act: "Act 4: Aftermath",
    title: "Retirements",
    text: function (flags) {
      return (
        "Weeks later, the public, the industry and ACME Inc.'s clients are furious. " +
        (flags.revised_up ? "Each upward revision of the numbers has restarted the story. " : "") +
        "The CIO and the CISO 'retire'. You are asked to hold the security function together until an interim leader is found."
      );
    },
    choices: [
      {
        text: "Step up as acting security leader.",
        nextNode: "act4_testimony",
        cost: 0,
        days: 5,
        stats: { internalInfluence: 10, teamHealth: 5, playerHealth: -15 },
        outcome: "The team rally around a familiar face. Your diary has no gaps left in it.",
      },
      {
        text: "Support an external interim leader and focus on your own area.",
        nextNode: "act4_testimony",
        cost: 100000,
        days: 5,
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        outcome: "The interim leader is capable but new. Several of your peers wonder why you didn't step up.",
      },
    ],
  },

  act4_testimony: {
    act: "Act 4: Aftermath",
    title: "Every Department on Fire",
    text: "The former CEO is called to testify before lawmakers. Sales, Marketing, Legal, HR, IT and Compliance are each fighting their own fire, and all of them want the security team's time.",
    choices: [
      {
        text: "Set up a single security response cell that serves every department.",
        nextNode: "act4_dutyofcare",
        cost: 200000,
        days: 10,
        stats: { internalInfluence: 10, teamHealth: -5, playerHealth: -5 },
        outcome: "Answers become consistent across the business, and your best people are tied up giving them.",
      },
      {
        text: "Ration support and put the security remediation programme first.",
        nextNode: "act4_dutyofcare",
        cost: 50000,
        days: 10,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: -5 },
        outcome: "Controls improve quickly. Sales tell the board that security is 'not engaging'.",
      },
    ],
  },

  act4_dutyofcare: {
    act: "Act 4: Aftermath",
    title: "Duty of Care",
    text: "Months of crisis have taken their toll. People on your team are exhausted, some have stopped sleeping, and recruiters call them daily. They call you too.",
    choices: [
      {
        text: "Fund recovery: time off, counselling and retention bonuses, and take leave yourself.",
        nextNode: "epilogue",
        cost: 300000,
        days: 10,
        stats: { internalInfluence: -5, teamHealth: 20, playerHealth: 20 },
        outcome: "The remediation plan slips a month. Most of your team are still there a year later.",
      },
      {
        text: "Push through to finish the remediation programme first.",
        nextNode: "epilogue",
        cost: 0,
        days: 10,
        stats: { internalInfluence: 10, teamHealth: -10, playerHealth: -10 },
        outcome: "The programme closes on schedule. The resignation letters arrive soon after.",
      },
    ],
  },
};

// Endings: a stat falling to zero ends the game early; otherwise the first
// ending whose test passes describes how you came through.
var EARLY_ENDINGS = {
  playerHealth: {
    title: "Signed Off",
    text: "Your doctor signs you off with burnout. The crisis carries on without you. Duty of care applies to you as well as your team.",
  },
  teamHealth: {
    title: "The Team Walks",
    text: "Your best engineers resign within weeks of each other, and recruiters had been ready for it. Without them, the response stalls.",
  },
  internalInfluence: {
    title: "Sidelined",
    text: "Decisions are now made in meetings you aren't invited to. Your title stays, but you no longer shape the response.",
  },
};

var ENDINGS = [
  {
    title: "Through the Storm",
    test: function (s) { return s.teamHealth >= 50 && s.playerHealth >= 40 && s.internalInfluence >= 40; },
    text: "The crisis leaves scars, but your team stays together, you're still standing, and the business listens when security speaks. Few people manage that.",
  },
  {
    title: "Standing, Just",
    test: function (s) { return s.teamHealth >= 25 && s.playerHealth >= 25; },
    text: "You made it through. You'll keep your team and your health, though both are worn thin, and rebuilding will take longer than the breach did.",
  },
  {
    title: "Pyrrhic Victory",
    test: function () { return true; },
    text: "The response is complete and the controls are better than ever, but the people who delivered it, including you, have little left to give.",
  },
];

var LESSONS = [
  "Focus on the basics, but plan and practise for the worst case.",
  "Decide in advance how transparent you will be, internally and externally.",
  "The security industry is immature about breaches: expect commentary from people without the facts.",
  "Breach notification rules in law and contracts may help less than you'd hope.",
  "Your employer's duty of care, and your own duty to your team and yourself, matter as much as the technical response.",
];
