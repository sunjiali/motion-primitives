# Contributing

Thanks for your interest in motion-primitives. The project has one core
rule everything else follows from:

**Every primitive is a pure function of the frame number.** Same frame in,
same picture out — no clocks, no Math.random (use `M.hash(seed)`), no state
between calls. If a change breaks that rule, it breaks parallel rendering.

## Setup

```bash
npm install          # Node.js >= 18; rendering also needs Chrome + ffmpeg
npm run build        # compile the TypeScript sources to the committed JS
npm test             # unit tests (node:test, no extra dependencies)
```

Sources are TypeScript (`index.ts`, `src/**/*.ts`); the compiled
JavaScript is committed next to them and is what ships. Never edit the
`.js` outputs by hand — change the `.ts`, run `npm run build`, and
commit both.

## Development loop

1. Add or change a primitive in `src/lib/primitives.ts` (the file is the
   manual — keep its comments accurate), run `npm run build`, mirror the
   compiled `src/lib/primitives.js` into `site/lib/` and add the
   primitive to the site demos + `index.d.ts`.
2. Record it in `EFFECTS.md` (move it from Backlog to Implemented) and in
   `CHANGELOG.md` under the next version.
3. Verify before you push:
   - `npm run check` — strict typecheck, syntax, and the unit/parity
     tests must pass; CI additionally fails if the committed JS is not
     what `npm run build` produces from the sources.
   - `node src/render.js --comp showcase --still 60 --out /tmp/f.png` —
     eyeball one frame.
   - New visual effects: render a short composition and check a few stills
     (entrance / mid-action / settled), not just the final frame.
   - Anything that touches packaging (`package.json` `files`, entry
     points, the CLI): `CHROME_PATH=<chrome> npm run package:smoke` —
     the tarball must install and render in a clean project.
4. Releases follow RELEASING.md; the quality bar and its known
   exceptions are written down in QUALITY.md. Workflow changes keep
   two house rules: actions pinned to full-length commit SHAs
   (Dependabot keeps them current) and the smallest `permissions:`
   that can work.

## Pull requests

- One primitive or one fix per PR where possible.
- Describe the verification you ran (tests, stills, renders) in the PR body.
- CI must be green: syntax checks, unit tests, and a smoke render.

## Style

- TypeScript in strict mode, no framework, no bundler — `tsc` only.
  Two-space indent in the sources (the compiler owns output formatting).
- Options objects with defaults at the top of each primitive; every
  options bag has a named interface next to its primitive.
- Durations in frames at 30 fps unless a primitive says otherwise.
