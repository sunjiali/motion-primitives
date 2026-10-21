# motion-primitives

[![Website](https://img.shields.io/badge/website-live-brightgreen)](https://sunjiali.github.io/motion-primitives/)
[![Deploy site](https://github.com/sunjiali/motion-primitives/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/sunjiali/motion-primitives/actions/workflows/deploy-pages.yml)
[![CI](https://github.com/sunjiali/motion-primitives/actions/workflows/ci.yml/badge.svg)](https://github.com/sunjiali/motion-primitives/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@sunjiali/motion-primitives)](https://www.npmjs.com/package/@sunjiali/motion-primitives)

🌐 **Website, live demos & playground:** https://sunjiali.github.io/motion-primitives/

**Motion primitives for AI-generated videos.** An LLM is bad at hand-writing
animation math — easing curves, spring constants, arc interpolation — but good
at *composing named building blocks*. This library wraps the motions that
explainer/teaching videos need again and again into tiny, frame-pure
primitives, so an AI (or a human) writes intent, not math:

```js
const p = M.fly(frame, { at: 60, dur: 90, from, to, arc: 170 });
stage.innerHTML =
  M.trail(frame, { at: 60, dur: 90, from, to })
    .map(t => M.dot({ x: t.x, y: t.y, r: 40, color: '#3FB6FF', scale: t.scale, opacity: t.opacity })).join('') +
  M.dot({ x: p.x, y: p.y, r: 44, color: '#3FB6FF', candy: true, glow: true });
```

Every primitive is a **pure function of the frame number** — same frame, same
picture — which is what makes parallel screenshot rendering correct.

Rendering is done by a small built-in pipeline (headless Chrome screenshots +
ffmpeg, in the spirit of Remotion's architecture, implemented from scratch in
`src/render.js`). No React, no build step.

## Install

As an npm package (library + renderer CLI + TypeScript types):

```bash
npm install @sunjiali/motion-primitives
```

```js
const M = require('@sunjiali/motion-primitives');
// Every primitive is a pure function of the frame:
const html = M.dot({ x: 320, y: 240, r: 44, color: '#3FB6FF',
                     scale: M.pop(frame, { at: 10 }), candy: true });
// Synthesized sound effects (no audio files, all code):
const wav = M.sfx.renderScore({ fps: 30, durationFrames: 90,
  events: [{ f: 10, s: 'pop' }, { f: 40, s: 'ting' }] });
```

Or use it in the browser with plain script tags — no build step:
`src/lib/animation.js` then `src/lib/primitives.js` gives you
`window.Motion` (alias `window.M`).

## Quick start (from the repo)

```bash
npm install
# Render the primitives showcase (20 s, 1280×720)
node src/render.js --comp showcase --out out/showcase.mp4 --concurrency 4
# Render the teaching demo (make-ten method, 15 s, 720×1280 portrait)
node src/render.js --comp math-make-ten --out out/math-make-ten.mp4 --concurrency 4
# Export a single frame (poster / debugging)
node src/render.js --comp showcase --still 250 --out out/frame.png
```

Requirements: Node.js ≥ 18, Chrome/Chromium, ffmpeg.

## The primitives

| Primitive | What it does |
|---|---|
| `M.pop(frame, {at, stiffness, damping})` | Springy scale-in with physical overshoot |
| `M.fadeUp(frame, {at, dur, dist})` | Fade + rise entrance (style string) |
| `M.pulse(frame, {amp, speed})` | Breathing scale for "look here" targets |
| `M.countUp(frame, {at, dur, from, to})` | Integer count-up (scores, totals) |
| `M.stagger(i, {base, each})` | Start-frame helper for staggered groups |
| `M.fly(frame, {at, dur, from, to, arc})` | Eased arc flight between two points |
| `M.trail(frame, {...fly, ghosts})` | Ghost positions trailing a flight |
| `M.smear(frame, {...fly, span, samples})` | Motion blur — exposure ghosts that stretch with velocity |
| `M.paperEl({x, y, w, h, color, shape})` | Cut-paper shape with a hard thickness shadow |
| `M.pivot(frame, {from, to, steps})` | Paper-puppet joint rotation (CSS transform value) |
| `M.stepped(frame, {steps})` · `M.onTwos(frame)` | Stop-motion timing: quantized progress, shot-on-twos frames |
| `M.whip(frame, {at, dur, dir, width})` | Whip-pan transition: strip offset + mid-pan blur peak |
| `M.pathFly(frame, {pts, at, dur})` | Constant-speed flight along a path, with heading |
| `M.flipIn(frame, {at, axis, from})` | 3D flip entrance with overshoot settle (style string) |
| `M.counterRoll(frame, {from, to, size})` | Odometer digit roll with a staggered settle |
| `M.squash(framesSinceLanding)` | Squash-and-settle after a landing |
| `M.dot({x, y, r, color, candy, glow})` | A circle (optional glossy candy look) |
| `M.ripple(frame, {x, y, at, color})` | Expanding ring after an event |
| `M.burst(frame, {x, y, at, colors})` | Confetti/particle burst |
| `M.badge(frame, {text, color, at})` | Pill badge that pops in ("Make 10!") |
| `M.targetSlot(frame, {x, y, r, color})` | Breathing dashed target ring |
| `M.scene(frame, ranges)` / `M.transition(lf, len)` | Scene bookkeeping + edge fades |

Full signatures and defaults live in `src/lib/primitives.js` (heavily commented).

## Writing a composition

A composition is a plain JS file in `src/compositions/`:

```js
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 300 },
  render(frame, stage) {
    const M = window.Motion;
    stage.innerHTML = M.dot({ x: 640, y: 360, r: 80, color: '#FF8A4C',
      scale: M.pop(frame, { at: 10 }), candy: true });
  },
};
```

`window.Remotion` (interpolate / spring / Easing) is also available if you
ever need to drop below the primitives layer.

## Examples in this repo

- **`showcase`** — six scenes, one primitive (or pair) each, labeled with the
  exact call that produced it.
- **`math-make-ten`** — a real teaching clip (the "make-ten" addition method,
  9 + 4, for first-graders) built with *only* primitives: ten-frame dots pop
  in staggered, one dot flies into the empty slot with a trail, lands with
  squash + ripple + badge, and the answer counts up.
- **`fx-showcase`** — the advanced reel (dark, premium): gradient-mesh
  background, a virtual camera, self-drawing charts, directed physics
  (beat/drop/shake/punch/flash) and a grain + vignette finish. The full
  effects ledger lives in [EFFECTS.md](EFFECTS.md).

## 中文简介

给 AI 生成视频用的**动效原语库**。大模型不擅长手写动画数学（缓动曲线、弹簧
参数、弧线插值），但擅长把命名的积木拼起来。这个库把讲解/教学视频里反复
用到的动作封装成帧纯函数小原语——AI 写意图，不写数学。内置从零实现的
无头 Chrome 逐帧截图 + ffmpeg 渲染管线，无 React、无构建步骤。
`src/compositions/math-make-ten.js` 是一个只用原语拼出来的真实教学片段
（一年级凑十法 9+4）。

## License

MIT
