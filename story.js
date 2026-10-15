// The story: scenes keyed by id. Each choice says where it leads, how many
// days it takes, how it moves the three stats, and what happened
// (shown in the log once chosen). `set` records a flag later scenes can read,
// and `text` may be a function of those flags and the stats. Interludes
// (interludes.js) sit between the scenes. A scene's `deadline` starts Legal's
// countdown to the announcement, and a choice's `deadlineShift` moves it.
//
// Everything here is anonymised: the company, people, projects, products,
// places and dates are fictional or generic.

var STATS = {
  internalInfluence: { label: "Influence", start: 50 },
  teamHealth: { label: "Team health", start: 20 }, // the All Hands lifts it
  playerHealth: { label: "Your health", start: 100 },
};

var START_NODE = "act0_start";

var GAME_NODES = {
  act0_start: {
    act: "Act 0: Things Are Looking Up",
    title: "Promotion & Inherited Architecture",
    text: [
      "You are promoted to the Cyber Senior Leadership Team at ACME Inc., a market-leading payments processor that handles card payments for banks and retailers across the country. Most of the people whose data you hold have never heard of you.",
      "Alongside processing, ACME Inc. sells a breach response service: when a client bank or retailer suffers a card compromise, ACME stands up the notification site, call centres and card reissue on their behalf. It's one of the fastest-growing lines in the business.",
      "This is a huge career step: national responsibility for the business-facing part of the cyber team, across all business units. You're now a key part of how the company perceives and responds to cyber risk, and your decisions will decide whether the cyber team is seen as a source of paranoid friction and delay, or as a core part of helping the business to succeed.",
      "Behind the congratulatory emails lies an enterprise shaped by years of rapid acquisitions, legacy application stacks, and relentless pressure to ship revenue-generating products ahead of routine control maintenance. Cyber strategy, like business strategy, has had to cater to three-month planning cycles between earnings reports to the stock markets.",
      "You feel like you can make a real difference here, for your team and for your employer.",
      "You know the organisation inside out, and are aware that there are improvements which need to be delivered quickly. In your first week, you want to clearly state your technical priorities.",
      "You can only lead with one of these two. Which do you choose?",
    ],
    choices: [
      {
        text: "Burn down technical cyber risk: find out exactly which systems ACME Inc. owns and who's responsible for each, and clear the backlog of overdue security updates.",
        nextNode: "i_inherit",
        days: 10,
        stats: { internalInfluence: 0, teamHealth: -5, playerHealth: -5 },
        set: "patching_first",
        outcome: "Business units grumble about change freezes, but your list of systems finally matches reality more often than not.",
      },
      {
        text: "Fix the relationship with the business, and support growth: prioritise helping product teams release faster, and avoid slowing the business down.",
        nextNode: "i_inherit",
        days: 5,
        stats: { internalInfluence: 10, teamHealth: 5, playerHealth: 5 },
        outcome: "Product leaders welcome you warmly. The backlog of overdue security updates stays where it was.",
      },
    ],
  },

  act0_breach: {
    act: "Act 0: Things Are Looking Up",
    title: "The Briefing Room",
    // Straight after the high of the summit: the cut should jar, and then
    // the briefing unfolds a line at a time, once the shudder has passed.
    jolt: true,
    stage: 0.5,
    pace: 0.8,
    // From here on, the theme turns from blue to red.
    readIn: true,
    text: [
      "'There has been a breach. It could be one of the largest in corporate history.'",
      "Attackers have been inside ACME Inc.'s network for months, and the card and transaction data they took could belong to millions of people. Your team's flights will leave as planned, and they're to be told nothing.",
      "The Legal representative slides a confidentiality agreement across the table.",
      "'Confidentiality on this is paramount,' the CISO says. 'Anyone who leaks it will be leaving the company immediately.'",
      "You sign. Cyber is a small world, and you know how it works: whoever leaks a breach like this won't just lose their job. They'll struggle to find senior roles in the industry again.",
      "Twenty minutes ago, you thought you belonged here. The cyber team was a community, or on good days, a family. Now you know what happens to family members who talk.",
    ],
    choices: [
      {
        text: "Accept the confidentiality orders; say nothing to your team, already on their way to the airport.",
        nextNode: "i_hotel",
        days: 0,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -10 },
        outcome: "Your team fly home cheerful. You stay behind with a secret you can't share.",
      },
      {
        text: "Push for more of your leaders to be told, so it doesn't all rest on you.",
        nextNode: "i_hotel",
        days: 0,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: -5 },
        set: "shared_load",
        outcome: "Legal reluctantly read in two more of your leaders, giving them the full secret. The load is shared, but you've spent goodwill.",
      },
    ],
  },

  act1_cert_alert: {
    act: "Act 1: Living in Silence",
    title: "Reconstructing the Window",
    text: function (flags) {
      return [
        "You review the incident dossier. Months ago, the national cyber security agency warned that a flaw in widely used web software let attackers take control of any system running it. ACME Inc.'s scans for the flaw missed one old merchant portal, and the attackers got in through it and stayed for over two months.",
        flags.patching_first
          ? "You recognise the portal's name. It was on your list of systems, due for its security update next quarter."
          : "You recognise the portal's name. It was in the backlog of overdue security updates you decided to leave alone.",
        "The internal response team, Project Lantern, must gather and search months of system records, and replay the attackers' queries.",
        "The deadline isn't yours to set. Legal and Compliance, working back from regulators' notification rules and the breach clauses in client contracts, have already fixed the announcement date: 26 days from today.",
      ];
    },
    // Legal's announcement date, in days from now. Days spent before the
    // announcement count against it; it doesn't move for the security team.
    deadline: 26,
    choices: [
      {
        text: "Mandate around-the-clock forensic reconstruction shifts to establish the full exposure.",
        nextNode: "i_warroom",
        days: 5,
        stats: { internalInfluence: 5, teamHealth: -15, playerHealth: -10 },
        outcome: "Lantern works in shifts through every night. The picture sharpens quickly, and so do tempers.",
      },
      {
        text: "Limit the forensic scope to the primary databases to protect staff stamina ahead of the public fallout.",
        nextNode: "i_warroom",
        days: 4,
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        set: "narrow_scope",
        outcome: "The team stays on its feet, but the board asks why some systems haven't been looked at.",
      },
    ],
  },

  act1_visitors: {
    act: "Act 1: Living in Silence",
    title: "Just a Quick Update",
    text: [
      "By the end of the first week, the war room has visitors. Every hour or so the badge reader on the door beeps, and every head in the room turns to see who it is this time. Another senior leader, dropping in for 'just a quick update'.",
      "Each one pulls an analyst off the query replays to explain the same picture again, and each one leaves with a slightly different version of it. By evening, three of them are quoting three different numbers to the board.",
      "This afternoon, your boss's boss peeled back the paper over the glass panel, looked in, and let themselves in without knocking. They stood behind an analyst's chair: 'Just run it again for me. From the top.' It was the fourth time that analyst had run it today.",
      "Whatever happens after this, that person will have a say in what becomes of you.",
    ],
    choices: [
      {
        text: "Shield the war room: one point of contact for leaders, and one fixed update a day.",
        nextNode: "act1_containment",
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 10, playerHealth: 5 },
        set: "shielded",
        outcome: "Some leaders are put out at being kept at the door. The analysts get their days back, and the board hears one version of the truth.",
      },
      {
        text: "Answer every leader yourself, whenever they ask.",
        nextNode: "act1_containment",
        days: 0,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        outcome: "The leaders feel informed. You spend your days repeating yourself, and the team still get pulled in when you're not there.",
      },
    ],
  },

  act1_containment: {
    act: "Act 1: Living in Silence",
    title: "Overnight Changes",
    text: function (flags) {
      return [
        "Just after midnight, your network lead puts the containment plan on your desk and sits down without being asked. Thousands of passwords, including the ones systems use to talk to each other, must be changed, the network reshaped, and upgraded security controls deployed, all without alerting staff outside the read-in group that anything is wrong.",
        flags.shielded
          ? "Because the war room is shielded, the people who would run the changes have had their days back. They're tired, but they're rested enough to try it in one night."
          : "The people who would run the changes have spent the week explaining the picture to visiting leaders. They're exhausted before they start, and one night of changes leaves no room for mistakes.",
        "'One night, and something will break. A week, and that's a week the attackers might still have a way in. Either way, the service desk takes the calls, and nobody can tell them why.'",
      ];
    },
    choices: [
      {
        text: "Make all the changes in one night, and accept the risk that something breaks.",
        nextNode: "i_family",
        days: 1,
        stats: { internalInfluence: -5, teamHealth: -10, playerHealth: -5 },
        outcome: "By morning the network looks very different. Two business systems fail to start, and nobody can be told why the change was urgent.",
      },
      {
        text: "Stage the changes over a week, disguised as routine maintenance.",
        nextNode: "i_family",
        days: 5,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        outcome: "The cover holds and nothing breaks, but you lie awake wondering what the attackers could still reach in the meantime.",
      },
    ],
  },

  act1_scope: {
    act: "Act 1: Living in Silence",
    title: "How Many People?",
    text: function (flags) {
      return (
        "Lantern's replay of the attackers' queries points to records for a huge share of the adult population of your home market. Someone writes the number on the war room whiteboard, and nobody reads it out loud. Legal's first question is whether it's every adult in the country. It isn't, quite. " +
        (flags.narrow_scope
          ? "Because you narrowed the scope, the secondary systems haven't been examined, so the number may grow. "
          : "") +
        "Legal want certainty before any number is made public. Announce too high, and you've frightened millions of people for nothing. Announce too low, and every revision becomes a new headline."
      );
    },
    choices: [
      {
        text: "Commit to a cautious upper estimate for the announcement, accepting it may later be revised down.",
        nextNode: "i_number",
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 0, playerHealth: -5 },
        outcome: "Legal are unhappy with a number that could be too high, but you won't have to announce a bigger one later.",
      },
      {
        text: "Keep analysing until the number is exact, using days you may not have.",
        nextNode: "i_number",
        days: 4,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        set: "revised_up",
        outcome: "The number satisfies Legal. Months later, further analysis pushes it up, and every revision makes headlines.",
      },
    ],
  },

  act2_foothold: {
    act: "Act 2: Under Pressure",
    title: "Project Harbour & the Blind Build",
    text: [
      "To build a response site where the public can check whether they're affected, and to bring in more than a thousand external contact centre agents, ACME Inc. turns to its own breach response service. The work is run as Project Harbour.",
      "To prevent leaks, Harbour's staff are told it's the biggest engagement the service has ever taken on, for an unnamed client. Nobody questions it: this is what the service does. Nobody tells them the victim is ACME Inc. itself.",
      "The secrecy creates tension, rumours spread, and the engineers have no clear trading restrictions.",
    ],
    choices: [
      {
        text: "Keep the cover story; compartmentation protects the announcement.",
        nextNode: "i_coffee",
        days: 2,
        stats: { internalInfluence: 5, teamHealth: -10, playerHealth: -5 },
        outcome: "The secret holds. Harbour's engineers keep guessing among themselves.",
      },
      {
        text: "Read the team leads in under NDA and push for a blanket trading blackout.",
        nextNode: "i_coffee",
        days: 2,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: -5 },
        set: "blackout",
        outcome: "Legal give in on the blackout after a hard argument. The leads are relieved to know the truth.",
      },
    ],
  },

  act2_scale: {
    act: "Act 2: Under Pressure",
    title: "Built for Everyone",
    text: [
      "On announcement day, every adult in the country may try to check whether they were affected.",
      "Harbour's engineers are building the site the way the service always does for a client: a white-label site on a newly registered domain, hosted on the service's own platform. It will scale, and it keeps the cover story intact.",
      "But you know who the 'client' really is. A site on ACME Inc.'s own domain would be far easier for the public to trust. The read-in group would have to build it themselves, though, and every Harbour engineer would work out the truth the moment they saw the address.",
    ],
    choices: [
      {
        text: "Keep the standard white-label site on a new domain.",
        nextNode: "act2_callcentres",
        days: 4,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: 0 },
        set: "separate_domain",
        outcome: "The cover holds, and load tests pass easily. A few people point out that the new domain looks nothing like anything ACME Inc. has used before.",
      },
      {
        text: "Insist on ACME Inc.'s own domain, built by the read-in group behind Harbour's back.",
        nextNode: "act2_callcentres",
        days: 5,
        stats: { internalInfluence: 0, teamHealth: -5, playerHealth: 0 },
        outcome: "Customers will recognise the address. Scaling legacy infrastructure in under a fortnight, in secret, takes the read-in group every evening they have.",
      },
    ],
  },

  act2_callcentres: {
    act: "Act 2: Under Pressure",
    title: "A Thousand New Voices",
    text: function (flags) {
      return [
        "Contact centre partners can supply more than a thousand agents across several new sites. You approve the numbers on a spreadsheet: so many agents per site, per shift, per language.",
        "You'll never meet any of them. Most have never heard of ACME Inc. On announcement day, they'll become its voice to millions of frightened, angry people, and they'll take the abuse for a failure that had nothing to do with them.",
        "They need scripts, training, and a way to verify callers, and they need them before Legal's date. You can't ask callers for the data that was stolen, so identity checks must rely on other data ACME Inc. holds.",
      ].concat(flags.separate_domain
        ? ["The scripts have a problem. Agents must reassure callers that a site on an unfamiliar domain, run by a company they've never heard of, is genuine and safe to type their details into. Every phishing awareness campaign has taught people never to trust exactly that."]
        : []);
    },
    choices: [
      {
        text: "Use a tight script and route every unusual question to your team.",
        nextNode: "i_3am",
        days: 3,
        stats: { internalInfluence: 5, teamHealth: -10, playerHealth: -5 },
        outcome: "The agents are ready on time. Your team's inbox is about to become every caller's escalation route.",
      },
      {
        text: "Train agents in depth, accepting the long hours and overtime it takes to hit Legal's date.",
        nextNode: "i_3am",
        days: 5,
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        outcome: "The agents can answer most questions themselves, but the trainers and your team work late every night to get them there.",
      },
    ],
  },

  act2_shifts: {
    act: "Act 2: Under Pressure",
    title: "Nobody Owns Rest",
    text: function (flags, stats, left) {
      return [
        "Nobody is making sure shifts end. Analysts are on their third double shift this week, and nobody is telling them to go home. There's a sleeping bag under a desk in the war room now, and nobody remarks on it. One analyst has a wrapped present in a shop bag beside their monitor. Their daughter's party was on Saturday.",
        "Last night, a tired engineer pushed a change to the live environment instead of the test one. A colleague spotted it in the change log by chance, and it was rolled back before anything broke. Nobody can say how close it came.",
        "Nobody is telling the leaders either. They're the last to leave and the first in, and their teams copy them. You're no better: you can't remember your last day off, or your last meal that didn't come in a box.",
        "Legal's date is " + (left === 1 ? "tomorrow" : left + " days away") + ". Every hour anyone spends asleep feels like an hour taken from it.",
      ];
    },
    choices: [
      {
        text: "Go home at a sensible hour tonight, where people can see you leave, and tell your leads you expect them to do the same.",
        nextNode: "act2_trading",
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: 10 },
        set: "role_model",
        outcome: "Walking out while the floor is still busy feels like desertion, and someone senior notices you weren't there when they called. But two of your leads leave on time the next day, and their teams start to follow.",
      },
      {
        text: "Send home anyone who has been in for more than two days straight, whatever they're in the middle of.",
        nextNode: "act2_trading",
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 10, playerHealth: 5 },
        set: "forced_rest",
        outcome: "There's grumbling, and a couple of handovers go badly, but the people who most needed sleep finally get some. Fewer mistakes land on your desk overnight.",
      },
      {
        text: "Let everyone keep going while the adrenaline holds.",
        nextNode: "act2_trading",
        days: 0,
        stats: { internalInfluence: 5, teamHealth: -10, playerHealth: -5 },
        outcome: "The pace holds, for now. Small mistakes start creeping into the overnight work, and nobody has the energy to catch them.",
      },
    ],
  },

  act2_trading: {
    act: "Act 2: Under Pressure",
    title: "The Share Sale",
    text: function (flags) {
      return [
        flags.role_model
          ? "The call comes at nine in the evening, while you're at home eating a meal at a table for the first time in weeks. You take it in the garden, where nobody can hear."
          : "The compliance officer finds you in the war room at nine in the evening and asks for somewhere private. There isn't anywhere, so you talk in the stairwell.",
        "People on Project Harbour have been talking. Nothing explicit, just hints over lunch and in corridors, but enough for people outside the project to start putting the pieces together. One of them, a mid-level manager in HR, made an educated guess about what was coming and sold a large block of shares last week.",
        flags.blackout
          ? "Your trading blackout covered everyone on Harbour, but not the people they'd been talking to."
          : "Without a trading blackout, nothing stopped anyone on Harbour from trading either.",
        "If one person traded on a guess, others may have too. Once the breach is announced, regulators will go through every share sale in the past month, and they'll want to know who knew what, and when.",
      ];
    },
    choices: [
      {
        text: "Escalate formally to Legal and the board immediately.",
        nextNode: "i_countdown",
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 0, playerHealth: -5 },
        deadlineShift: -3,
        set: "date_forward",
        outcome: "It becomes a matter for the regulators. To limit the insider risk, Legal bring the announcement forward. Your concern is on record.",
      },
      {
        text: "Leave it to Compliance and focus on the launch.",
        nextNode: "i_countdown",
        days: 0,
        stats: { internalInfluence: 5, teamHealth: 0, playerHealth: -10 },
        outcome: "Months later the trades become a criminal case, and investigators ask what you knew and when.",
      },
    ],
  },

  act3_transparency: {
    act: "Act 3: Going Public",
    title: "Who Hears First?",
    text: function (flags, stats, left) {
      return [
        "Most of your security team, and the wider company, still don't know.",
        "They can tell something is wrong. The war room door is always shut, and the rumours from the coffee machine have been getting closer to the truth. Elsewhere, the account managers will be on the phone to clients within minutes of the release, and right now they don't know there's anything to explain.",
        "Tell people early, and one post from one employee means the announcement is no longer yours to make. Tell them nothing, and they'll find out from the news, like everyone else. You must decide how much they are told, and when.",
      ];
    },
    choices: [
      {
        text: "Brief all staff an hour before the press release, with FAQs and support lines ready.",
        nextNode: "i_morning",
        days: 0,
        stats: { internalInfluence: -5, teamHealth: 10, playerHealth: -5 },
        set: "staff_briefed",
        outcome: "There's shock but no leak. Your team hear it from you, not the news.",
      },
      {
        text: "Staff learn with the public, to minimise the risk of a leak.",
        nextNode: "i_morning",
        days: 0,
        stats: { internalInfluence: 5, teamHealth: -10, playerHealth: -5 },
        outcome: "Your engineers find out from news alerts on their phones. Some of them never quite forgive it.",
      },
    ],
  },

  act3_announce: {
    act: "Act 3: Going Public",
    title: "The Morning After",
    text: [
      "Traffic to the response site dwarfs every forecast, and the story leads every news bulletin. Commentators who have never run a security team explain what you should have done.",
      "On LinkedIn, vendors who were flattering you for a meeting last week are now publicly shaming you and your team. What you thought of as a cyber community is in a feeding frenzy, and your team is the meat.",
      "Journalists start messaging you and your team through your personal social media accounts. Former colleagues begin sharing their own theories about what went wrong.",
    ],
    choices: [
      {
        text: "Press Legal to let you brief trusted industry peers privately on the technical story.",
        nextNode: "act3_lookalike",
        days: 2,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: -5 },
        outcome: "Peers start correcting the worst speculation. Legal will remember that you pushed.",
      },
      {
        text: "Leave all communication to the corporate communications team.",
        nextNode: "act3_lookalike",
        days: 2,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        outcome: "The message stays consistent, and so does the speculation. Your team read every hostile thread.",
      },
    ],
  },

  act3_lookalike: {
    act: "Act 3: Going Public",
    title: "The Wrong Website",
    text: function (flags) {
      return [
        "You're still in the morning briefing when the screenshots start circulating.",
        "A researcher reports that ACME Inc.'s official social media accounts have sent consumers to a lookalike of the response site, registered by someone else to show how easy it was. " +
          (flags.separate_domain
            ? "The unfamiliar separate domain made the imitation easy to believe."
            : "Even with the site on ACME Inc.'s own domain, a mistyped link in one post was enough."),
        "By lunchtime, the post has been shared thousands of times, and people are asking which of ACME Inc.'s sites, if any, is real.",
      ];
    },
    choices: [
      {
        text: "Remove the posts, apologise publicly, and register the most likely lookalike domains.",
        nextNode: "i_exposed",
        days: 1,
        stats: { internalInfluence: 5, teamHealth: -5, playerHealth: -5 },
        outcome: "It's an embarrassing day, but it's over in one news cycle.",
      },
      {
        text: "Correct the posts quietly and say nothing.",
        nextNode: "i_exposed",
        days: 1,
        stats: { internalInfluence: -5, teamHealth: 0, playerHealth: -5 },
        outcome: "Journalists had already taken screenshots. The cover-up becomes the story.",
      },
    ],
  },

  act3_storm: {
    act: "Act 3: Going Public",
    title: "The Storm",
    text: [
      "If you needed evidence that the world was against you, you don't have to check social media any more: the weather forecast proves it. A major hurricane makes landfall near two of your new contact centres just as call volumes peak.",
      "On the war room screens, the hurricane's track sits beside the call-wait graph, and both are climbing. A contact centre manager calls in from a building running on generator power. Hundreds of agents are offline, and some of those still working are taking calls about stolen card data while their own homes are under evacuation orders.",
      "The wait to reach an agent stretches to hours. Callers post screenshots of their hold times, and one journalist starts a live count.",
      "Your own team could take the overflow. After the last few weeks, they have almost nothing left to give.",
    ],
    choices: [
      {
        text: "Move overflow calls to your security team and internal volunteers.",
        nextNode: "i_home",
        days: 5,
        stats: { internalInfluence: 10, teamHealth: -15, playerHealth: -5 },
        outcome: "Wait times come down. Your threat analysts spend a week reading out call scripts.",
      },
      {
        text: "Pay a premium for emergency capacity elsewhere and publish honest wait times.",
        nextNode: "i_home",
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
      return [
        "The story hasn't gone away, as the communications team thought it would. " +
          (flags.revised_up ? "Each upward revision of the numbers has restarted it. " : "") +
          "Within weeks, ACME Inc. announces that several senior leaders, the CISO among them, are leaving, which prompts more media criticism, not less. Soon afterwards, the CEO steps down too. You are asked to hold the security function together until an interim leader is found.",
        "Leaders you've worked alongside for years are gone within days. There are no leaving drinks. By Monday, their names have gone from the doors."
      ];
    },
    choices: [
      {
        text: "Step up as acting security leader.",
        nextNode: "act4_testimony",
        days: 5,
        stats: { internalInfluence: 10, teamHealth: 5, playerHealth: -15 },
        outcome: "The team rally around a familiar face. Your diary has no gaps left in it.",
      },
      {
        text: "Support an external interim leader and focus on your own area.",
        nextNode: "act4_testimony",
        days: 5,
        stats: { internalInfluence: -5, teamHealth: -5, playerHealth: -5 },
        outcome: "The interim leader is capable but new. Several of your peers wonder why you didn't step up.",
      },
    ],
  },

  act4_testimony: {
    act: "Act 4: Aftermath",
    title: "Every Department on Fire",
    text: [
      "Business and technology leaders are called to testify before government committees. Weeks go into preparing them, and while they're in rehearsals and hearings, nobody is left who can make the big decisions. The response stalls at crucial moments, waiting for people in another city who are answering questions about the past.",
      "Meanwhile, every department is fighting its own fire. Sales watch the breach response service, the fastest-growing line in the business, lose its clients one cancellation at a time: nobody wants breach response from the company that's in the news for a breach. Marketing pull every campaign. Reception staff have learned to spot journalists in the lobby. HR are supporting staff who've been abused by strangers for wearing the company lanyard on the train.",
      "All of them want the security team's time.",
    ],
    choices: [
      {
        text: "Set up a single security response cell that serves every department.",
        nextNode: "i_hearing",
        days: 10,
        stats: { internalInfluence: 10, teamHealth: -5, playerHealth: -5 },
        outcome: "Answers become consistent across the business, and your best people are tied up giving them.",
      },
      {
        text: "Ration support and put the security remediation programme first.",
        nextNode: "i_hearing",
        days: 10,
        stats: { internalInfluence: -5, teamHealth: 5, playerHealth: -5 },
        outcome: "Controls improve quickly. Sales tell the board that security is 'not engaging'.",
      },
    ],
  },

  act4_dutyofcare: {
    act: "Act 4: Aftermath",
    title: "Duty of Care",
    text: function (flags) {
      return [
        "Nearly two months of crisis have taken their toll. Your best analyst falls asleep mid-sentence in a review and doesn't notice. Two of your leads have stopped coming to the stand-up, and their teams cover for them. Recruiters call your people daily, and some have started taking the calls in the car park.",
        "They call you too. Last week, you let one finish the pitch.",
        flags.role_model
          ? "The habit you started in the war room, leaders going home where people could see them, didn't survive the announcement. Nobody has left on time since, you included."
          : flags.forced_rest
            ? "You sent people home once, before the announcement. Since then, nobody has had the authority, or the nerve, to do it again."
            : "Nobody has gone home at a sensible hour since the night you were briefed, you included.",
        "The remediation programme is three months from done, and the board want it closed.",
      ];
    },
    choices: [
      {
        text: "Fund recovery: time off, counselling and retention bonuses, and take leave yourself.",
        nextNode: "i_normal",
        days: 10,
        stats: { internalInfluence: -5, teamHealth: 15, playerHealth: 15 },
        outcome: "The remediation plan slips a month. Most of your team are still there a year later.",
      },
      {
        text: "Push through to finish the remediation programme first.",
        nextNode: "i_normal",
        days: 10,
        stats: { internalInfluence: 10, teamHealth: -5, playerHealth: -5 },
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
    text: [
      "You don't remember deciding to see a doctor. Someone who cares about you made the appointment, and made sure you went.",
      "The doctor listens for ten minutes, then signs you off with burnout, starting today. You try to explain that it's the worst possible time. They've heard that before.",
      "Your phone keeps buzzing for two more days. Then someone else takes over, and it stops. The crisis carries on without you.",
      "Duty of care applies to you as well as your team.",
    ],
  },
  teamHealth: {
    title: "The Team Walks",
    text: [
      "The first resignation letter is polite and apologetic. The second arrives the same afternoon. By the end of the week there are five, and recruiters were ready for every one of them.",
      "Your best engineers take with them everything nobody had time to write down. The work they were carrying stalls, and the people left behind take on even more.",
      "Nobody blames you to your face. They don't have to.",
      "A response is only as strong as the people still standing to deliver it.",
    ],
  },
  internalInfluence: {
    title: "Sidelined",
    text: [
      "The meeting invitations stop first. Then decisions you'd have argued against start appearing as announcements, made in rooms you weren't in.",
      "Your title stays the same, and your diary is still full, but people have stopped asking what you think. Your team notice before you admit it to yourself.",
      "Influence isn't vanity in a crisis. Without it, you can't protect your team or shape the response, however right you are.",
    ],
  },
};

var ENDINGS = [
  {
    title: "Through the Storm",
    test: function (s) { return s.teamHealth >= 50 && s.playerHealth >= 30 && s.internalInfluence >= 40; },
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

// The lessons at the end, in the order the game reaches them. Each one looks
// back at the player's own game: `review` gets { choices, flags, finished },
// where `choices` maps each scene's id to the index of the option picked,
// and `finished` is false if the game ended early. It returns the verdict
// ("paid", "manage" or "tradeoff") and what happened, or null if the player
// never reached that point. `ask` is what to take back to your own team.
var LESSONS_INTRO = "Every choice you made had an impact, and there were no perfect choices. During a breach, you have to make the best choice available for your team and your company, and keep track of the impacts you'll need to manage.";

var LESSONS = [
  {
    title: "Foundations, automation and rehearsal",
    scenes: "Promotion & Inherited Architecture \u00b7 Overnight Changes",
    review: function (r) {
      var first = r.choices.act0_start, containment = r.choices.act1_containment;
      if (first == null) return null;
      var text = first === 0
        ? "In your first week, you put finding every system and clearing overdue security updates first. The breached portal was on your list, but not yet updated. Because of your list of systems, the war room knew which systems existed and where their logs were, and that saved days."
        : "In your first week, you put helping the business move faster first. The breached portal was in the backlog you left alone, and the war room lost days finding out which systems existed.";
      if (containment === 0) text += " Later, you made all the containment changes in one night, and two business systems failed to start.";
      if (containment === 1) text += " Later, you staged the containment changes over a week, and lay awake wondering what the attackers could still reach.";
      return { verdict: first === 0 ? "paid" : "manage", text: text };
    },
    lesson: "Knowing which systems you own, keeping them up to date, and keeping their records are what you'll depend on when it matters. They never feel as urgent as this quarter's release, until they are. Practise for the worst case too: every containment step you rehearse, automate or remove the need for now is one less impossible call in the middle of the night.",
    ask: [
      "If we were breached tonight, how long would it take to list every internet-facing system we own, and who owns each one?",
      "What actions would we need to take to contain a breach, and how many of them could we remove or automate now, such as regular credential rotation?",
      "When did we last rehearse a breach we couldn't tell most of our own staff about?",
    ],
  },
  {
    title: "Who's read in, and who they can talk to",
    scenes: "The Briefing Room",
    review: function (r) {
      var c = r.choices.act0_breach;
      if (c == null) return null;
      return c === 1
        ? { verdict: "paid", text: "You pushed to read in two more of your leaders. It cost goodwill, but you weren't carrying it alone." }
        : { verdict: "manage", text: "You accepted being the only one of your leaders read in, and carried it alone, unable to tell anyone, not even your family." };
    },
    lesson: "Too small a read-in group burns people out. Too large a group risks leaks and insider trading. Agree the balance in advance, and make sure everyone read in has someone cleared to talk to, including about how they're coping.",
    ask: [
      "Who decides who's read in during a major incident, and is it written down?",
      "Who can the people who are read in talk to, including about how they're coping?",
    ],
  },
  {
    title: "Scope, and the number",
    scenes: "Reconstructing the Window \u00b7 How Many People?",
    review: function (r) {
      if (r.choices.act1_scope == null) return null;
      var narrow = r.flags.narrow_scope, revised = r.flags.revised_up;
      // The narrow scope's cost lands at the hearing, if the player got that far.
      var heard = r.choices.act4_testimony != null;
      if (narrow) {
        return {
          verdict: "manage",
          text: "You limited the investigation to the primary databases to protect your team's stamina" +
            (revised ? ", then waited for an exact number. " : ". ") +
            (heard
              ? "The systems nobody examined later turned up more records, and the number went up live on air."
              : "The systems nobody examined left room for the number to grow."),
        };
      }
      return revised
        ? { verdict: "manage", text: "You waited for an exact number. Months later, further analysis pushed it up, and every revision restarted the story." }
        : { verdict: "paid", text: "You examined everything and announced a cautious upper estimate. Legal worried it was too high, but you never had to announce a bigger one." };
    },
    lesson: "A number that keeps growing does more damage than a cautious one. Investigate fully, and announce a number you won't have to raise.",
    ask: [
      "Who signs off the number of people affected, and what will we do if it changes?",
    ],
  },
  {
    title: "Leadership: one channel, and clear decision-makers",
    scenes: "Just a Quick Update \u00b7 Every Department on Fire",
    review: function (r) {
      var visitors = r.choices.act1_visitors, later = r.choices.act4_testimony;
      if (visitors == null) return null;
      var text = visitors === 0
        ? "You shielded the war room with one point of contact and one update a day. Some leaders were put out, but the analysts got their days back."
        : "You answered every leader whenever they asked, and analysts kept being pulled away from the work.";
      if (later != null) {
        text += " Later, while leaders prepared for hearings, the response stalled waiting for decisions. " +
          (later === 0
            ? "You set up a single response cell, and your best people were tied up giving answers."
            : "You put remediation first, and Sales told the board security wasn't engaging.");
      }
      return { verdict: visitors === 0 ? "paid" : "manage", text: text };
    },
    lesson: "Senior attention is a load on the people doing the work. Give leaders one channel and a fixed rhythm of updates, so the board hears one version of the truth. And know who can make quick, informed decisions, and who deputises when they're tied up for weeks.",
    ask: [
      "In our incident plan, how do executives get updates without walking into the response room?",
      "If our CEO and CIO were unavailable for a month, who could approve spending, and sign off what we tell clients?",
    ],
  },
  {
    title: "Insider risk",
    scenes: "Project Harbour & the Blind Build \u00b7 The Share Sale",
    review: function (r) {
      var blackout = r.choices.act2_foothold, sale = r.choices.act2_trading;
      if (blackout == null) return null;
      var text = blackout === 1
        ? "You read Harbour's leads in and pushed for a trading blackout."
        : "You kept the cover story, with no trading restrictions.";
      if (sale == null) return { verdict: blackout === 1 ? "paid" : "manage", text: text };
      text += " When an HR manager outside the project traded on a guess anyway, " +
        (sale === 0
          ? "you escalated it formally, and Legal brought the date forward."
          : "you left it to Compliance, and months later investigators asked what you knew.");
      return { verdict: sale === 0 ? "paid" : "manage", text: text };
    },
    lesson: "Secrets leak through people talking, not just through documents. Put trading restrictions in place early, cast them wider than the project, and escalate concerns formally, on the record.",
    ask: [
      "What triggers a trading blackout, who puts it in place, and how far does it reach? Is it all documented in our incident response playbook?",
    ],
  },
  {
    title: "A public response people can trust",
    scenes: "Built for Everyone \u00b7 The Wrong Website",
    review: function (r) {
      var site = r.choices.act2_scale, lookalike = r.choices.act3_lookalike != null;
      if (site == null) return null;
      return site === 0
        ? {
          verdict: "manage",
          text: "You kept the white-label site on a new domain. It protected the cover story, but it looked exactly like phishing" +
            (lookalike ? ", and ACME Inc.'s own social media posts ended up sending people to a lookalike." : "."),
        }
        : {
          verdict: "paid",
          text: "You insisted on ACME Inc.'s own domain, built in secret by the read-in group. People recognised the address" +
            (lookalike ? ", although a single mistyped link still sent some of them to a lookalike." : "."),
        };
    },
    lesson: "Send people somewhere they already trust. Prepare your public response, from the website to the call scripts, and register likely lookalike domains, before you need them.",
    ask: [
      "Where would we send millions of worried people, and would they believe it was really us?",
      "Could we stand up the public-facing communications and services we'd need after a breach? How long would it take, and how would we do it within the confidentiality of an incident response?",
    ],
  },
  {
    title: "Help on contract before you need it",
    scenes: "A Thousand New Voices \u00b7 The Storm",
    review: function (r) {
      var agents = r.choices.act2_callcentres, storm = r.choices.act3_storm;
      if (agents == null) return null;
      var text = agents === 0
        ? "You gave the contact centre agents a tight script and routed every unusual question to your team."
        : "You trained the contact centre agents in depth, and the trainers and your team worked late every night to get them there.";
      if (storm == null) return { verdict: "tradeoff", text: text };
      return storm === 0
        ? { verdict: "manage", text: text + " When the storm hit, you moved overflow calls to your security team, and your analysts spent a week reading out call scripts." }
        : { verdict: "tradeoff", text: text + " When the storm hit, you paid a premium for emergency capacity and published honest wait times. It cost money and headlines, but your team kept working on security." };
    },
    lesson: "Have contracts and processes in place to bring in outside help quickly: contact centres, forensic analysts, legal and communications. Capacity bought in the middle of a crisis costs more and arrives later.",
    ask: [
      "If we needed a thousand extra people answering calls next week, whose number would we ring?",
      "If we needed dozens of extra cyber analysts to comb through logs, how would we give them access? Would we need to build and deliver laptops, or provide an internet-facing virtual desktop? Is all of that documented and practised?",
    ],
  },
  {
    title: "Someone has to make rest happen",
    scenes: "Nobody Owns Rest",
    review: function (r) {
      var c = r.choices.act2_shifts, after = r.choices.act4_dutyofcare != null;
      if (c == null) return null;
      var text = [
        "You went home where people could see you, and your leads followed." + (after ? " The habit didn't survive the announcement." : ""),
        "You sent home anyone who'd been in for two days straight, and fewer mistakes landed on your desk overnight." + (after ? " After the announcement, nobody had the authority to do it again." : ""),
        "You let everyone keep going while the adrenaline held, and mistakes crept into the overnight work.",
      ][c];
      var over = r.flags.overrun;
      if (over) {
        text += " The work also ran " + (over === 1 ? "a day" : over + " days") + " past Legal's date, squeezed into nights" +
          (r.flags.forward_overrun ? ", after Legal brought the date forward." : ".");
      }
      return { verdict: c === 2 ? "manage" : "paid", text: text };
    },
    lesson: "In a crisis, rest doesn't happen by itself. Someone with authority has to make it normal, and keep doing so once the adrenaline wears off. That only works if the load can be shared, so spread the knowledge before you need it.",
    ask: [
      "If our next incident ran for six weeks, who would make sure people went home, and would they be listened to?",
      "Would the burden fall on a few people whose skills and knowledge make them essential, and a single point of failure? Or is our work documented and shared well enough for a larger group to carry it?",
    ],
  },
  {
    title: "Tell your own people first",
    scenes: "Who Hears First?",
    review: function (r) {
      var c = r.choices.act3_transparency;
      if (c == null) return null;
      return c === 0
        ? { verdict: "paid", text: "You briefed all staff an hour before the release. There was shock, but your team heard it from you." }
        : { verdict: "manage", text: "Your staff learned with the public, from news alerts on their phones. Some never quite forgave it." };
    },
    lesson: "Your own staff are your first audience, not your last. Plan when and how they'll be told, what they can say when friends ask, and how you'll support them when journalists come looking.",
    ask: [
      "Who would we tell about a breach, when would we tell them, and what would we say?",
      "Would our staff hear about it from us, or from the news?",
      "How would we deal with journalists contacting potentially disgruntled employees through social media?",
    ],
  },
  {
    title: "The crisis doesn't end at the announcement",
    scenes: "Duty of Care \u00b7 Back to Normal?",
    review: function (r) {
      var c = r.choices.act4_dutyofcare;
      if (c == null) return null;
      var text = c === 0
        ? "You funded recovery and took leave yourself. Remediation slipped a month, and most of your team were still there a year later."
        : "You pushed through to finish remediation first. It closed on schedule, and then the resignations arrived.";
      if (r.finished) text += " Months later, you couldn't bring yourself to sign off a routine risk.";
      return { verdict: c === 0 ? "paid" : "manage", text: text };
    },
    lesson: "Plan for recovery as seriously as for the response, including how you'll make risk decisions again after living through the worst.",
    ask: [
      "After a major breach, how would we rebuild the team, and how would we accept risk again without saying no to everything?",
      "How many of our best people would stay with us rather than leave? What would our culture and workforce look like afterwards?",
    ],
  },
];
