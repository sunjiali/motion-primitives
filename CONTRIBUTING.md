# Contributing

Thanks for your interest in motion-primitives. The project has one core
rule everything else follows from:

**Every primitive is a pure function of the frame number.** Same frame in,
same picture out — no clocks, no Math.random (use `M.hash(seed)`), no state
between calls. If a change breaks that rule, it breaks parallel rendering.

## Setup

```bash
npm install          # Node.js >= 18; rendering also needs Chrome + ffmpeg
npm test             # unit tests (node:test, no extra dependencies)
```

## Development loop

1. Add or change a primitive in `src/lib/primitives.js` (the file is the
   manual — keep its comments accurate), mirror it into `site/lib/` and add
   it to the site demos + `index.d.ts`.
2. Record it in `EFFECTS.md` (move it from Backlog to Implemented) and in
   `CHANGELOG.md` under the next version.
3. Verify before you push:
   - `npm test` — determinism and API-surface tests must pass.
   - `node src/render.js --comp showcase --still 60 --out /tmp/f.png` —
     eyeball one frame.
   - New visual effects: render a short composition and check a few stills
     (entrance / mid-action / settled), not just the final frame.

## Pull requests

- One primitive or one fix per PR where possible.
- Describe the verification you ran (tests, stills, renders) in the PR body.
- CI must be green: syntax checks, unit tests, and a smoke render.

## Style

- Plain JavaScript, no build step, no framework. Two-space indent.
- Options objects with defaults at the top of each primitive.
- Durations in frames at 30 fps unless a primitive says otherwise.
