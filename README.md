# Breach Inc.

A text adventure for security leaders, inspired by a real large-scale data breach. You join ACME Inc.'s security leadership just before the breach is discovered and steer the response through four acts:

- reconstructing the attack
- a secret build of the consumer response
- the announcement
- the aftermath

Every decision costs money and days, and moves three stats: **Influence**, **Team health** and **Your health**. If any of them reaches zero, the game ends early. Otherwise the epilogue judges how you came through and closes with lessons from the real event.

Everything is anonymised. Companies, people, projects and details are fictional or generic, and new content must stay that way.

## Playing

Open `index.html` in a browser. There is no build step. Progress is saved in the browser, and **Restart** starts again.

## Files

- `story.js`: the scenes, choices, stats, endings and lessons. Edit this file to change the story.
- `game.js`: the engine. It shows scenes, applies choices, and keeps the log and the saved game.
- `styles.css`: the look.

## Writing scenes

Each scene in `GAME_NODES` has an `act`, a `title`, `text` and `choices`.

Each choice can have:
- `nextNode`: the scene it leads to. Any id that isn't a scene leads to the epilogue.
- `cost`: in dollars.
- `days`
- `stats`: changes to the three stats.
- `outcome`: shown in the log.
- `set`: a flag that later scenes can test.

A scene's `text` can be a function of those flags.

Choices show only their money and time costs. The effect on people is revealed in the log afterwards.

## Balance

With the current numbers, a player choosing at random:
- ends early about a quarter of the time, usually from burnout;
- reaches the best ending about 1 time in 10.

Re-check after changing any stats.

## To do

- Write more branching, so that some choices lead to different scenes rather than only changing the text.
- Get feedback from security leaders on whether the trade-offs feel realistic.
