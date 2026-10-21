# motion — the installable skill

Make motion-graphics videos from code, inside your AI agent.
This folder is a self-contained **agent skill**: install it, and your
agent (Claude Code, Codex, or any agent that reads `SKILL.md`) can
write a composition, render stills, synthesize sound, and deliver a
verified MP4 — powered by the bundled
[motion-primitives](https://github.com/sunjiali/motion-primitives)
runtime (51 frame-pure animation primitives + a headless-Chrome
renderer + a code-synthesized SFX engine). No npm package, no video
assets, no After Effects.

## Install

1. Get this folder:
   - Download `motion-skill-v*.zip` from the
     [latest release](https://github.com/sunjiali/motion-primitives/releases)
     and unzip it, **or**
   - Clone the repo and take its `skill/` folder.
2. Copy the folder into your agent's skills directory, e.g.
   - Claude Code: `~/.claude/skills/motion/`
   - Codex: `~/.codex/skills/motion/`
   - Anywhere else works too — point your agent at `SKILL.md`.
3. One-time setup inside the folder:

   ```bash
   npm install
   node scripts/doctor.mjs
   ```

4. Ask your agent for a video. Or try the bundled example yourself:

   ```bash
   node scripts/render.mjs --comp hello-motion --out hello.mp4 --concurrency 4
   ```

## Requirements

- **Node.js ≥ 18**
- **Chrome or Chromium** — auto-detected on macOS / Linux / Windows;
  if yours lives somewhere unusual, set `CHROME_PATH`.
- **ffmpeg** on your PATH.

The only npm dependency is `puppeteer-core` (it drives your Chrome;
it does not download a browser).

## What's inside

| Path | What |
| --- | --- |
| `SKILL.md` | The agent's playbook: workflow, hard rules, quickstart |
| `scripts/doctor.mjs` | Environment preflight with friendly verdicts |
| `scripts/render.mjs` | Renderer launcher (finds Chrome for you) |
| `scripts/sfx.mjs` | SFX score synthesizer launcher |
| `runtime/` | The synced motion-primitives runtime (library, renderer, player, SFX) |
| `runtime/src/compositions/` | `hello-motion` example + its sound score — copy and edit |
| `examples/` | The same examples, as the copyable source of truth |
| `references/API.md` | Every primitive, grouped, with signatures |
| `references/STYLE.md` | The flat teaching-video style guide |

## License

MIT (same as motion-primitives).
