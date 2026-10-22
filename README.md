# Breach Inc.

A text adventure for security, tech and business leaders: a work of fiction, inspired by the creator's experience of a major cyber breach. You join the security leadership of ACME Inc., a payments processor, just before a major breach is discovered, and steer the response through five acts:

- Things Are Looking Up
- Living in Silence
- Under Pressure
- Going Public
- Aftermath

Between the decisions, short interludes with a single **Continue** button show what it was like to live through it. They include hotel rooms, a war room with no windows, calls home where you can't say anything, and lying to your own team. A **Days in silence** counter runs from the night you're told until the announcement, and the edges of the screen close in as your health falls.

The security team doesn't control the timeline. In Act 1, Legal and Compliance set the announcement date by working back from notification rules and client contracts. A **Legal's date** countdown then runs, and the date doesn't move for the security team. Some events can bring it forward: escalating the share sale brings it up to three days closer. Every choice takes days. Any days of work that don't fit before the date are squeezed into nights, costing 5 Team health, 5 Your health and 5 Influence for each day over (`OVERRUN_COST` in `game.js`).

Every decision takes days and moves four stats: **Influence**, **Team health**, **Your health** and **Public trust**. Public trust is how far customers, clients and regulators trust ACME Inc.'s response. It runs from -50 to 50 (`min` and `max` in `STATS`) and starts at 0, because most people have never heard of ACME Inc. Good preparation mostly limits the damage rather than earning trust, so even a near-perfect response ends at only +10. The public can't judge what they don't know about yet, so changes to it are held until the announcement. They land when the player continues from "Eight Minutes", together with the shock of the news itself (`announcement` in `STATS`). Until then the HUD shows it as "Not public". If any stat reaches its minimum (zero, or -50 for Public trust), the game ends early. Otherwise the epilogue judges how you came through and closes with lessons learned.

Everything is anonymised. Companies, people, projects and details are fictional or generic, and new content must stay that way.

## Licence

Breach Inc. is licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/), with an additional permission for organisations to use it in their own internal security awareness programmes. Credit it with a link to [breach-inc.com](https://breach-inc.com) and use it as it is. To include it in a paid course, get in touch first. See [LICENSE](LICENSE) and the [licence page](https://breach-inc.com/licence.html).

## Updating the live site

breach-inc.com is updated by uploading files by hand. On every upload, increase the `?v=` number on the file links in `long-silence/index.html`, so browsers fetch the new files instead of using cached copies, and upload that page too.

## Playing

`index.html` is the home page, where players choose a challenge. The Long Silence is `long-silence/index.html`: its `<base href="../">` loads the game's files from the top level, which the site's other pages share, so the game files stay where they are. Open it in a browser to play. There is no build step. Progress is saved in the browser, and **Restart** starts again.

## Files

- `story.js`: the scenes, choices, stats, endings and lessons. Edit this file to change the story.
- `interludes.js`: the Continue-only moments between scenes.
- `game.js`: the engine. It shows scenes, applies choices, and keeps the log and the saved game.
- `styles.css`: the look.

## Writing scenes

Each scene in `GAME_NODES` has an `act`, a `title`, `text` and `choices`.

Each choice can have:
- `nextNode`: the scene it leads to. Any id that isn't a scene leads to the epilogue.
- `deadlineShift`: moves Legal's date by this many days.
- `days`
- `stats`: changes to the four stats.
- `outcome`: shown in the log.
- `set`: a flag that later scenes can test.

A scene's `text` can be a function of those flags and the stats.

Scenes appear all at once, so the player can weigh the whole situation. A scene with `stage: N` unfolds a paragraph at a time instead, starting N seconds in (with `pace` and `pauses` as for interludes), and its choices appear after the last line. Only The Briefing Room does this; keep it rare.

Interludes in `interludes.js` have:
- `time`: shown beside the day of the incident, where Day 1 is the night you're briefed. Before then, it shows "Summit week".
- `when`: optional text shown instead of the day, such as "Months later".
- `text`: an array of paragraphs.
- `next`: the scene that follows.
- optionally `stats` and `days`.
- `silence: "start"` or `"end"`: marks when you can and can't talk about it.
- `deadlineCheck`: marks where Legal's date arrives.

A scene with `deadline: N` starts the countdown N days from that point.

To add one, point a scene's `nextNode` at it.

Choices show only how many days they take. The effect on people is revealed in the log afterwards.

## Lessons

After the ending, **What this breach taught you** opens the lessons screen. Each lesson in `LESSONS` (in `story.js`) looks back at the player's own choices through its `review` function, which gets the option picked in each scene (`choices`, by scene id), the `flags`, and whether the game was `finished`. It returns a verdict (`paid`, `manage` or `tradeoff`) and what happened, or null if the player never got that far. Each lesson also has `ask`: questions to take back to your own team, which are gathered into one printable list. If you change or reorder a scene's choices, update the lessons that read them.

## Budget

Choices that need extra spending have `needs: { internalInfluence: BUDGET_INFLUENCE }` (35, in `story.js`). Below that, the button is disabled and says how much Influence it needs. Each of those scenes also has a free option that turns out worse. The scene is recorded in `flags.lockedOut`, so the lessons can say the budget was out of reach. There are three of them: in-depth agent training, emergency call centre capacity and funded recovery. In the boardroom scenes ("Who Do We Tell?" and "The CEO's Words"), you advise rather than decide: the recommendation that goes against Legal `needs` `BOARD_INFLUENCE` (40) "to carry the room" (`needsFor`), and below it you can only support Legal's position.

## Balance

With the current numbers, a player choosing at random:
- ends early about 31% of the time: Lost the Public 17.7%, Signed Off 9.2%, The Team Walks 2.8%, Sidelined 1.7%;
- reaches the best ending, Through the Storm, about 8% of the time (it needs Public trust of at least `TRUST_KEPT`, -30);
- keeps the team and themselves going but loses the public (Strong Team, Bad Headlines) about 11% of the time;
- most often ends with a Pyrrhic Victory (about 32%);
- ends with Public trust between -40 and -20 most of the time, and never above +20;
- runs past Legal's date about 27% of the time;
- finds the budget out of reach for agent training 9% of the time, emergency capacity 28% and funded recovery 30%;
- can't carry the room at the boardroom 32% of the time ("Who Do We Tell?") and 28% ("The CEO's Words").

No single decision should give one option an overwhelming advantage, except the ones that teach the lessons: shielding the war room, making people rest, escalating the share sale, and funding recovery.

Re-check after changing any stats.

## To do

- Write more branching, so that some choices lead to different scenes rather than only changing the text.
- Get feedback from security leaders on whether the trade-offs feel realistic.
