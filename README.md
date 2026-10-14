# Breach Inc.

A text adventure for security, tech and business leaders: a work of fiction, inspired by the creator's experience of a major cyber breach. You join the security leadership of ACME Inc., a payments processor, just before a major breach is discovered, and steer the response through five acts:

- Things Are Looking Up
- Living in Silence
- Under Pressure
- Going Public
- Aftermath

Between the decisions, short interludes with a single **Continue** button show what it was like to live through it. They include hotel rooms, a war room with no windows, calls home where you can't say anything, and lying to your own team. A **Days in silence** counter runs from the night you're told until the announcement, and the edges of the screen close in as your health falls.

The security team doesn't control the timeline. In Act 1, Legal and Compliance set the announcement date by working back from notification rules and client contracts. A **Legal's date** countdown then runs, and the date doesn't move for the security team. Some events can bring it forward: escalating the share sale brings it up to three days closer. Every choice takes days. Any days of work that don't fit before the date are squeezed into nights, costing 2 Team health and 2 Your health for each day over (`OVERRUN_COST` in `game.js`).

Every decision takes days and moves three stats: **Influence**, **Team health** and **Your health**. If any of them reaches zero, the game ends early. Otherwise the epilogue judges how you came through and closes with lessons learned.

Everything is anonymised. Companies, people, projects and details are fictional or generic, and new content must stay that way.

## Licence

Breach Inc. is licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/), with an additional permission for organisations to use it in their own internal security awareness programmes. Credit it with a link to [breach-inc.com](https://breach-inc.com) and use it as it is. To include it in a paid course, get in touch first. See [LICENSE](LICENSE) and the [licence page](https://breach-inc.com/licence.html).

## Updating the live site

breach-inc.com is updated by uploading files by hand. On every upload, increase the `?v=` number on the file links in `index.html`, so browsers fetch the new files instead of using cached copies, and upload `index.html` too.

## Playing

Open `index.html` in a browser. There is no build step. Progress is saved in the browser, and **Restart** starts again.

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
- `stats`: changes to the three stats.
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

## Balance

With the current numbers, a player choosing at random:
- ends early about 11% of the time, usually from burnout;
- reaches the best ending about 21% of the time;
- most often ends with a Pyrrhic Victory (about 40%).

No single decision should give one option an overwhelming advantage, except the ones that teach the lessons: shielding the war room, making people rest, escalating the share sale, and funding recovery.

Re-check after changing any stats.

## To do

- Write more branching, so that some choices lead to different scenes rather than only changing the text.
- Get feedback from security leaders on whether the trade-offs feel realistic.
