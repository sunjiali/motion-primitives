'use strict';
/* Core contract of the library: everything is a pure function of the frame.
 * Same frame in -> identical output out, in Node and in the browser. */
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../index.js');

const API = ['pop', 'ease', 'fadeUp', 'pulse', 'breathe', 'countUp', 'stagger',
  'fly', 'trail', 'smear', 'squash', 'dot', 'ripple', 'burst', 'badge', 'targetSlot',
  'scene', 'transition', 'wiggle', 'typewriter', 'hash', 'beat', 'drop',
  'travel', 'shake', 'punch', 'flash', 'camera', 'parallax', 'meshBg', 'drawOn', 'poly',
  'bars', 'scramble', 'splitFlap', 'kenBurns', 'fx', 'paperEl', 'pivot', 'stepped', 'onTwos', 'whip', 'pathFly', 'flipIn', 'counterRoll', 'drawText', 'particleField', 'morphShape', 'glitch', 'beatGrid', 'beatFrames', 'morphPoly', 'splitText', 'wipeReveal', 'confetti', 'cursor', 'isoBox', 'isoCylinder', 'isoWedge', 'isoPipe', 'isoGear', 'isoCone', 'isoBolt', 'isoTerrain', 'isoSort', 'orbit', 'swing', 'marquee', 'marchingAnts', 'highlightBox', 'waveLine', 'spotlight', 'maskReveal', 'matchCut', 'inertia', 'pixelDissolve', 'charGrid', 'assembleText', 'textOnPath', 'patternField', 'slitScan', 'liquidMetal', 'liquidMetalDraw', 'anticipate', 'followThrough', 'velocitySkew', 'noiseGlow', 'relay', 'portalWipe', 'rings', 'mosaic'];

test('package entry exposes the full public API', () => {
  for (const name of API) assert.equal(typeof M[name], 'function', `missing: ${name}`);
  assert.equal(typeof M.Remotion.spring, 'function');
  assert.equal(typeof M.sfx.renderScore, 'function');
});

test('determinism: identical frame -> identical output', () => {
  const calls = [
    () => M.pop(37, { at: 10 }),
    () => M.fly(80, { at: 60, dur: 90, from: { x: 0, y: 0 }, to: { x: 100, y: 50 }, arc: 40 }),
    () => M.meshBg(123, {}),
    () => M.scramble(50, { at: 10, dur: 60, text: 'HELLO' }),
    () => M.splitFlap(33, { text: 'BOARDING' }),
    () => M.bars(90, { at: 0, data: [3, 7, 5] }),
    () => M.fx(99, {}),
  ];
  for (const call of calls) assert.deepEqual(call(), call());
});

test('pop starts at 0, overshoots, and settles at 1', () => {
  assert.equal(M.pop(0, { at: 10 }), 0);
  assert.equal(M.pop(10, { at: 10 }), 0);
  let peak = 0;
  for (let f = 10; f <= 70; f++) peak = Math.max(peak, M.pop(f, { at: 10 }));
  assert.ok(peak > 1, `expected spring overshoot, peak=${peak}`);
  assert.ok(Math.abs(M.pop(200, { at: 10 }) - 1) < 0.01);
});

test('fly reaches its destination and reports done', () => {
  const from = { x: 10, y: 20 };
  const to = { x: 400, y: 300 };
  const start = M.fly(0, { at: 0, dur: 60, from, to, arc: 0 });
  assert.equal(start.x, from.x); assert.equal(start.y, from.y);
  const end = M.fly(60, { at: 0, dur: 60, from, to, arc: 0 });
  assert.equal(end.x, to.x); assert.equal(end.y, to.y); assert.equal(end.done, true);
});

test('countUp is monotonic and clamps at the target', () => {
  let prev = -1;
  for (let f = 0; f <= 120; f += 3) {
    const v = M.countUp(f, { at: 0, dur: 90, to: 13 });
    assert.ok(v >= prev && v <= 13, `frame ${f}: ${v}`);
    prev = v;
  }
  assert.equal(M.countUp(500, { at: 0, dur: 90, to: 13 }), 13);
});

test('smear: motion blur exists only while moving, and scales with speed', () => {
  const fast = { at: 0, dur: 30, from: { x: 0, y: 100 }, to: { x: 600, y: 100 }, arc: 0 };
  assert.equal(M.smear(-1, fast).length, 0);   // not started
  assert.equal(M.smear(31, fast).length, 0);   // landed
  const ghosts = M.smear(15, fast);
  assert.equal(ghosts.length, 6);              // default samples
  // Opacity rises toward the head (array runs tail -> head).
  for (let i = 1; i < ghosts.length; i++) assert.ok(ghosts[i].opacity > ghosts[i - 1].opacity);
  // A slow version of the same move blurs far less (exposure follows velocity).
  const slow = M.smear(45, { at: 0, dur: 300, from: fast.from, to: fast.to, arc: 0 });
  const headGhost = (a) => (a.length ? a[a.length - 1].opacity : 0);
  assert.ok(headGhost(slow) < headGhost(ghosts) / 3,
    `slow ${headGhost(slow)} should be << fast ${headGhost(ghosts)}`);
  assert.deepEqual(M.smear(15, fast), ghosts); // deterministic
});

test('paper-cut pack: paperEl, pivot, stepped, onTwos', () => {
  const el = M.paperEl({ x: 100, y: 80, w: 120, h: 60, color: '#E4572E', thick: 6, rot: -3 });
  assert.ok(el.includes('box-shadow:6px 6px 0'), 'thickness shadow');
  assert.ok(el.includes('rotate(-3deg)'), 'resting tilt');
  assert.ok(M.paperEl({ x: 0, y: 0, color: '#fff', shape: 'blob' }).includes('58% 42%'), 'blob edge');
  // pivot swings between its angles and lands exactly on `to`.
  assert.equal(M.pivot(0, { at: 0, dur: 30, from: -12, to: 20 }), 'rotate(-12.00deg)');
  assert.equal(M.pivot(30, { at: 0, dur: 30, from: -12, to: 20 }), 'rotate(20.00deg)');
  // stepped progress only ever takes steps+1 discrete values, then completes.
  const vals = new Set();
  for (let f = 0; f <= 30; f++) vals.add(M.stepped(f, { at: 0, dur: 30, steps: 5 }));
  assert.ok(vals.size <= 6, `too many levels: ${vals.size}`);
  assert.equal(M.stepped(30, { at: 0, dur: 30, steps: 5 }), 1);
  // onTwos snaps frames down to even numbers.
  assert.equal(M.onTwos(7), 6);
  assert.equal(M.onTwos(8), 8);
  assert.equal(M.onTwos(8, { every: 3 }), 6);
});

test('whip: strip travels one width, blur peaks mid-pan', () => {
  const o = { at: 10, dur: 14, width: 560 };
  assert.equal(M.whip(10, o).x, 0);
  assert.equal(M.whip(24, o).x, -560);
  assert.equal(M.whip(24, o).active, false);
  const mid = M.whip(17, o);
  assert.ok(mid.active && mid.blur > 13, `mid blur ${mid.blur}`);
  assert.ok(M.whip(12, o).blur < mid.blur, 'blur rises toward the middle');
  assert.equal(M.whip(24, { ...o, dir: -1 }).x, 560);
});

test('pathFly: constant speed along the path, with heading', () => {
  const L = { at: 0, dur: 60, fn: 'linear', pts: [[0, 0], [100, 0], [100, 100]] };
  const corner = M.pathFly(30, L); // halfway along 200px of path
  assert.equal(corner.x, 100); assert.equal(corner.y, 0);
  const down = M.pathFly(45, L);
  assert.equal(down.x, 100); assert.equal(down.y, 50);
  assert.ok(Math.abs(down.angle - 90) < 1e-9, `angle ${down.angle}`);
  assert.equal(M.pathFly(60, L).done, true);
  // Equal progress steps cover equal distances on a straight diagonal.
  const D = { at: 0, dur: 100, fn: 'linear', pts: [[0, 0], [300, 400]] };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const d1 = dist(M.pathFly(25, D), M.pathFly(50, D));
  const d2 = dist(M.pathFly(50, D), M.pathFly(75, D));
  assert.ok(Math.abs(d1 - d2) < 1e-6 && Math.abs(d1 - 125) < 1e-6, `${d1} vs ${d2}`);
});

test('flipIn: edge-on at start, settles at 0 with an overshoot', () => {
  const start = M.flipIn(0, { at: 0, dur: 22 });
  assert.ok(start.includes('rotateY(88.00deg)'), start);
  assert.ok(start.includes('opacity:0'), start);
  const end = M.flipIn(22, { at: 0, dur: 22 });
  assert.ok(end.includes('rotateY(0.00deg)'), end);
  assert.ok(end.includes('opacity:1'), end);
  // backOut overshoots: some mid-late frame dips below zero degrees.
  let overshot = false;
  for (let f = 12; f < 22; f++) if (/rotateY\(-/.test(M.flipIn(f, { at: 0, dur: 22 }))) overshot = true;
  assert.ok(overshot, 'expected a negative-degree overshoot frame');
  assert.ok(M.flipIn(0, { axis: 'X', from: -80 }).includes('rotateX(-80.00deg)'));
});

test('counterRoll: starts on `from`, settles exactly on `to`, cascades', () => {
  const o = { at: 0, dur: 40, stagger: 4, size: 50, from: 7, to: 2026 };
  const stepsOf = (html) => [...html.matchAll(/translateY\((-?[\d.]+)px\)/g)].map((m) => -parseFloat(m[1]) / 50 + 0); // +0: no -0
  assert.deepEqual(stepsOf(M.counterRoll(0, o)), [0, 0, 0, 0]);
  const end = stepsOf(M.counterRoll(200, o));
  // Visible digit per column = (start digit + steps) % 10 must equal 2,0,2,6.
  const sd = [0, 0, 0, 7], want = [2, 0, 2, 6];
  end.forEach((s, i) => {
    assert.ok(Math.abs(s - Math.round(s)) < 1e-9, `column ${i} not aligned: ${s}`);
    assert.equal((sd[i] + Math.round(s)) % 10, want[i], `column ${i} shows wrong digit`);
  });
  // Mid-roll, the ones column (rightmost) is ahead of the thousands column.
  const mid = stepsOf(M.counterRoll(20, o));
  assert.ok(mid[3] > mid[0], `cascade broken: ${mid}`);
});

test('drawText: stroke draws at pen speed, fill settles last, text is escaped', () => {
  const o = { text: 'Hi', at: 10, dur: 40, x: 100, y: 80 };
  assert.equal(M.drawText(5, o), '');
  const mid = M.drawText(30, o); // p = 0.5 (linear pen speed)
  assert.ok(mid.includes('stroke-dashoffset="50.00"'), mid);
  assert.ok(mid.includes('fill-opacity="0.000"'), mid); // fill waits for the last stretch
  const late = M.drawText(46, o); // p = 0.9 -> fill (0.9-0.65)/0.35
  assert.ok(late.includes('fill-opacity="0.714"'), late);
  const end = M.drawText(50, o);
  assert.ok(end.includes('stroke-dashoffset="0.00"'), end);
  assert.ok(end.includes('fill-opacity="1.000"'), end);
  assert.ok(M.drawText(30, { text: 'a<b>&', at: 0, dur: 10 }).includes('a&lt;b&gt;&amp;'));
  assert.equal(M.drawText(30, o), mid); // determinism
});

test('particleField: deterministic, bounded, alive across frames and modes', () => {
  const o = { n: 12, w: 400, h: 200, mode: 'snow' };
  const a = M.particleField(30, o);
  assert.equal(M.particleField(30, o), a); // determinism
  assert.equal((a.match(/border-radius:50%/g) || []).length, 12); // one div per particle
  for (const m of a.matchAll(/left:(-?[\d.]+)px;top:(-?[\d.]+)px/g)) {
    const x = parseFloat(m[1]), y = parseFloat(m[2]);
    assert.ok(x > -40 && x < 440 && y > -20 && y < 220, `out of bounds: ${x},${y}`);
  }
  assert.notEqual(M.particleField(90, o), a); // drifts over time
  assert.notEqual(M.particleField(30, { ...o, mode: 'rise' }), a); // modes differ
  assert.ok(M.particleField(0, { n: 1, twinkle: 0, opacity: 0.5 }).includes('opacity:0.500'));
});

test('morphShape: endpoints are true shapes, midpoint interpolates, names validated', () => {
  const o = { from: 'circle', to: 'star', at: 10, dur: 40, x: 100, y: 100, size: 50 };
  const radii = (html) => [...html.match(/points="([^"]+)"/)[1].trim().split(/\s+/).map((s) => {
    const [px, py] = s.split(',').map(Number);
    return Math.hypot(px - 100, py - 100);
  })];
  const start = radii(M.morphShape(10, o));
  assert.equal(start.length, 72);
  assert.ok(start.every((r) => Math.abs(r - 50) < 1), `p=0 is not a circle: ${Math.min(...start)}..${Math.max(...start)}`);
  const end = radii(M.morphShape(50, o));
  assert.ok(Math.abs(Math.max(...end) - 50) < 1, 'star tips reach size');
  assert.ok(Math.min(...end) < 30, `star valleys are deep: ${Math.min(...end)}`);
  const mid = radii(M.morphShape(30, o)); // cubicInOut(0.5) = 0.5
  assert.ok(Math.min(...mid) > 30 && Math.min(...mid) < 45, `mid valleys interpolate: ${Math.min(...mid)}`);
  assert.equal(M.morphShape(10, { ...o, from: 'nope' }), M.morphShape(10, o)); // unknown name -> circle
  assert.equal(M.morphShape(30, o), M.morphShape(30, o)); // determinism
});

test('glitch: passthrough outside the window, sliced RGB ghosts inside', () => {
  const o = { at: 10, dur: 20, html: '<b>X</b>', slices: 5 };
  assert.equal(M.glitch(9, o), '<b>X</b>');
  assert.equal(M.glitch(30, o), '<b>X</b>');
  const mid = M.glitch(20, o); // p = 0.5, envelope peak
  assert.equal((mid.match(/<b>X<\/b>/g) || []).length, 7); // 5 slices + 2 channel ghosts
  assert.ok(mid.includes('clip-path:inset('));
  const shifts = (h) => [...h.matchAll(/translateX\((-?[\d.]+)px\)/g)].map((m) => Math.abs(parseFloat(m[1])));
  assert.ok(Math.max(...shifts(mid)) > 1, 'mid-window slices are displaced');
  assert.ok(Math.max(...shifts(M.glitch(10, o))) < 0.05, 'first frame is clean (envelope 0)');
  assert.equal(M.glitch(20, o), mid); // determinism
});

test('beat tools: grid math, phase, pulse decay, bars, frame generation', () => {
  const o = { bpm: 120, fps: 30 }; // 15 frames per beat
  const b0 = M.beatGrid(0, o);
  assert.deepEqual([b0.index, b0.phase, b0.pulse, b0.bar, b0.inBar], [0, 0, 1, 0, 0]);
  assert.equal(M.beatGrid(15, o).index, 1);
  const mid = M.beatGrid(22, o);
  assert.equal(mid.index, 1);
  assert.ok(Math.abs(mid.phase - 7 / 15) < 1e-9);
  assert.ok(Math.abs(mid.pulse - (8 / 15) * (8 / 15)) < 1e-9);
  const b6 = M.beatGrid(90, o); // beat 6 = bar 1, second beat of the bar
  assert.deepEqual([b6.bar, b6.inBar], [1, 2]);
  const pre = M.beatGrid(-1, { ...o, at: 0 }); // one frame before the downbeat
  assert.deepEqual([pre.index, pre.inBar], [-1, 3]);
  assert.deepEqual(M.beatFrames({ bpm: 120, fps: 30, at: 10, count: 4 }), [10, 25, 40, 55]);
  assert.deepEqual(M.beatFrames({ bpm: 128, fps: 30, count: 4 }), [0, 14, 28, 42]); // 14.0625 fpb, rounded
});

test('morphPoly: exact endpoints, uneven counts subdivided, caller vertices survive', () => {
  const sq = [[0, 0], [100, 0], [100, 100], [0, 100]];
  const di = [[50, -20], [120, 50], [50, 120], [-20, 50]];
  const o = { from: sq, to: di, at: 0, dur: 20 };
  const pts = (h) => h.match(/points="([^"]+)"/)[1].trim().split(/\s+/);
  assert.deepEqual(pts(M.morphPoly(0, o)), ['0.0,0.0', '100.0,0.0', '100.0,100.0', '0.0,100.0']);
  assert.deepEqual(pts(M.morphPoly(20, o)), ['50.0,-20.0', '120.0,50.0', '50.0,120.0', '-20.0,50.0']);
  const tri = [[0, 0], [90, 0], [45, 80]];
  const o2 = { from: tri, to: sq, at: 0, dur: 20 };
  const start = pts(M.morphPoly(0, o2));
  assert.equal(start.length, 4); // 3 -> 4 via longest-edge split
  for (const v of ['0.0,0.0', '90.0,0.0', '45.0,80.0']) assert.ok(start.includes(v), `vertex ${v} survives`);
  assert.deepEqual(pts(M.morphPoly(20, o2)), ['0.0,0.0', '100.0,0.0', '100.0,100.0', '0.0,100.0']);
  assert.equal(M.morphPoly(10, o), M.morphPoly(10, o)); // determinism
});

test('camera/parallax: camera output pinned, depth scales the same move', () => {
  const keys = [{ f: 0, x: 640, y: 360, z: 1 }, { f: 60, x: 840, y: 300, z: 1.6 }];
  const stage = { w: 1280, h: 720 };
  // Pins recorded before the camPose refactor — camera() must not drift.
  assert.equal(M.camera(0, keys, stage), 'translate(640px,360px) scale(1.0000) translate(-640.0px,-360.0px)');
  assert.equal(M.camera(30, keys, stage), 'translate(640px,360px) scale(1.2649) translate(-740.0px,-330.0px)');
  assert.equal(M.camera(60, keys, stage), 'translate(640px,360px) scale(1.6000) translate(-840.0px,-300.0px)');
  // Depth 1 is the camera itself; depth 0 never moves; depth 0.5 halves
  // the pan and takes the square root of the zoom.
  assert.equal(M.parallax(30, keys, 1, stage), M.camera(30, keys, stage));
  assert.equal(M.parallax(30, keys, 0, stage), 'translate(640px,360px) scale(1.0000) translate(-640.0px,-360.0px)');
  assert.equal(M.parallax(30, keys, 0.5, stage), 'translate(640px,360px) scale(1.1247) translate(-690.0px,-345.0px)');
});

test('splitText: per-character stagger — leaders land first, all settle clean', () => {
  const o = { text: 'Hey', at: 10, dur: 10, stagger: 5, size: 40 };
  const ops = (h) => [...h.matchAll(/opacity:([\d.]+)/g)].map((m) => parseFloat(m[1]));
  assert.deepEqual(ops(M.splitText(0, o)), [0, 0, 0]);
  const mid = ops(M.splitText(22, o));
  assert.equal(mid[0], 1);
  assert.ok(mid[0] > mid[1] && mid[1] > mid[2], `stagger order broken: ${mid}`);
  const end = M.splitText(60, o);
  assert.deepEqual(ops(end), [1, 1, 1]);
  assert.ok(end.includes('translateY(0.0px)')); // settled with no residual offset
  assert.equal((end.match(/<span/g) || []).length, 3);
  assert.ok(M.splitText(60, { text: 'a<b', at: 0 }).includes('&lt;'));
  assert.equal(M.splitText(22, o), M.splitText(22, o)); // determinism
});

test('wipeReveal: clip edge sweeps in the chosen direction, ends fully open', () => {
  const o = { html: '<div>X</div>', at: 10, dur: 20 };
  assert.ok(M.wipeReveal(0, o).includes('inset(0 100.0% 0 0)')); // right: still fully hidden
  assert.ok(M.wipeReveal(40, o).includes('inset(0 0.0% 0 0)')); // fully open
  assert.ok(M.wipeReveal(20, o).includes('inset(0 50.0% 0 0)')); // cubicInOut midpoint
  assert.ok(M.wipeReveal(0, { ...o, dir: 'down' }).includes('inset(0 0 100.0% 0)'));
  assert.ok(M.wipeReveal(0, { ...o, dir: 'left' }).includes('inset(0 0 0 100.0%)'));
  assert.ok(M.wipeReveal(0, { ...o, dir: 'up' }).includes('inset(100.0% 0 0 0)'));
  assert.ok(M.wipeReveal(40, o).includes('<div>X</div>')); // content passes through untouched
  assert.equal(M.wipeReveal(20, o), M.wipeReveal(20, o)); // determinism
});

test('confetti: seeded paper burst — rises, gravity wins, fades out, deterministic', () => {
  const o = { at: 10, n: 24, x: 640, y: 500, seed: 4, life: 70 };
  assert.equal(M.confetti(5, o), ''); // before the pop
  assert.equal(M.confetti(90, o), ''); // after life ends (at 10 + 70)
  const early = M.confetti(16, o);
  assert.equal((early.match(/border-radius:2px/g) || []).length, 24); // every bit present
  const meanTop = (h) => {
    const ts = [...h.matchAll(/top:(-?[\d.]+)px/g)].map((m) => parseFloat(m[1]));
    return ts.reduce((a, b) => a + b, 0) / ts.length;
  };
  assert.ok(meanTop(M.confetti(79, o)) > meanTop(early) + 60, 'on average the burst must fall');
  assert.ok(M.confetti(78, o).includes('opacity:0.11')); // fade: (70 - 68) / 18 ≈ 0.11
  assert.equal(M.confetti(40, o), M.confetti(40, o)); // determinism
});

test('cursor: keyframed travel, click dip and ring, visibility window', () => {
  const o = { path: [{ f: 0, x: 100, y: 100 }, { f: 20, x: 300, y: 100 }], clicks: [30] };
  assert.ok(M.cursor(0, o).includes('left:100.0px')); // at the first key
  assert.ok(M.cursor(20, o).includes('left:300.0px')); // at the second key
  assert.ok(M.cursor(10, o).includes('left:200.0px')); // cubicInOut midpoint is halfway
  assert.ok(M.cursor(50, o).includes('left:300.0px')); // holds after the last key
  assert.ok(M.cursor(32, o).includes('scale(0.800)')); // deepest press two frames into the click
  assert.ok(M.cursor(36, o).includes('border-radius:50%')); // ring alive at click+6
  assert.ok(!M.cursor(50, o).includes('border-radius:50%')); // ring gone by click+20
  assert.equal(M.cursor(-5, { path: [{ f: 10, x: 0, y: 0 }] }), ''); // hidden before its first key
  assert.equal(M.cursor(12, o), M.cursor(12, o)); // determinism
});

test('iso kit: box shading order, cylinder ellipse, painter sort', () => {
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  };
  const box = M.isoBox({ x: 0, y: 0, w: 2, d: 2, h: 1, unit: 50, color: '#808080' });
  const fills = [...box.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((m) => m[1]);
  assert.equal(fills.length, 3); // left, right, top painted in that order
  assert.ok(lum(fills[2]) > lum(fills[0]) && lum(fills[0]) > lum(fills[1]), `tone order broken: ${fills}`);
  assert.ok(box.includes('width="173.2"')); // (w + d) * unit * cos30
  const wedge = M.isoWedge({ x: 0, y: 0, len: 2, d: 2, h: 1, unit: 50, color: '#808080' });
  const wfills = [...wedge.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((m) => m[1]);
  assert.equal(wfills.length, 2); // side triangle, then slope
  assert.ok(lum(wfills[1]) > lum(wfills[0]), 'slope must be lighter than the side');
  assert.ok(wedge.includes('width="173.2"')); // (len + d) * unit * cos30, same span rule as the box
  const pipe = M.isoPipe({ path: [[0, 0, 0], [0, 0, 2], [2, 0, 2]], r: 0.2, unit: 50 });
  assert.equal((pipe.match(/<path/g) || []).length, 2); // body + highlight
  assert.equal((pipe.match(/<circle/g) || []).length, 1); // one interior joint
  assert.ok(pipe.includes('stroke-width="22.0"')); // 2.2 * r * unit
  assert.equal(M.isoPipe({ path: [[0, 0, 0]] }), ''); // degenerate path draws nothing
  const gear = M.isoGear({ x: 0, y: 0, r: 1, h: 0.3, teeth: 8, unit: 50 });
  assert.equal((gear.match(/<g transform=/g) || []).length, 8); // one group per tooth
  assert.ok(gear.includes('<ellipse')); // body + hub from the cylinder and face layers
  assert.notEqual(M.isoGear({ teeth: 8, rot: 0.4, unit: 50 }), M.isoGear({ teeth: 8, rot: 0, unit: 50 })); // rot turns it
  const cone = M.isoCone({ x: 0, y: 0, r: 1, h: 2, unit: 50, color: '#808080' });
  assert.equal((cone.match(/<path/g) || []).length, 2); // two shaded halves
  const cfills = [...cone.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((m) => m[1]);
  assert.ok(lum(cfills[0]) > lum(cfills[1]), 'left half lighter than right');
  const bolt = M.isoBolt({ x: 0, y: 0, r: 0.4, unit: 50 });
  assert.equal((bolt.match(/<polygon/g) || []).length, 7); // 6 head sides + the hex top
  assert.ok(bolt.includes('<ellipse')); // the shaft is a cylinder
  const terrain = M.isoTerrain(0, { cols: 4, rows: 3, unit: 20 });
  assert.equal((terrain.match(/<polygon/g) || []).length, 36); // 12 columns x 3 faces
  assert.notEqual(M.isoTerrain(90, { cols: 4, rows: 3, unit: 20, auto: true }), terrain); // the hill travels
  const cyl = M.isoCylinder({ x: 0, y: 0, r: 1, h: 2, unit: 50 });
  assert.ok(cyl.includes('<ellipse'));
  assert.ok(cyl.includes('rx="61.2"')); // r * unit * sqrt(3/2)
  const sorted = M.isoSort([
    { x: 2, y: 2, html: 'C' }, { x: 0, y: 0, html: 'A' }, { x: 1, y: 0, z: 1, html: 'B2' }, { x: 0, y: 1, html: 'B1' },
  ]);
  assert.equal(sorted, 'AB1B2C'); // by x+y ascending; the sum-1 tie resolves by z (B1 at z 0 before B2 at z 1)
  assert.equal(M.isoBox({ x: 1, y: 1, color: '#808080' }), M.isoBox({ x: 1, y: 1, color: '#808080' })); // determinism
});

test('orbit: circle geometry, squash, depth scale', () => {
  const p0 = M.orbit(0, { cx: 100, cy: 50, r: 40 });
  assert.equal(p0.x, 140); assert.equal(p0.y, 50); assert.equal(p0.scale, 1);
  const front = M.orbit(0, { cx: 100, cy: 50, r: 40, phase: Math.PI / 2, squash: 0.5, depth: true });
  assert.ok(Math.abs(front.x - 100) < 1e-6);
  assert.equal(front.y, 70); // cy + r * squash at the front of the ellipse
  assert.equal(front.scale, 1); // front = full size with depth on
  const back = M.orbit(0, { cx: 100, cy: 50, r: 40, phase: -Math.PI / 2, depth: true });
  assert.equal(back.scale, 0.72); // back of the orbit = smallest
  const moved = M.orbit(10, { cx: 0, cy: 0, r: 10, speed: 0.1 });
  assert.ok(Math.abs(moved.angle - 1) < 1e-9); // angle advances by speed * frame
});

test('swing: pendulum angle, quarter-period peak, decay envelope', () => {
  assert.equal(M.swing(0, { maxDeg: 20, period: 40 }), 'rotate(0.00deg)');
  assert.equal(M.swing(10, { maxDeg: 20, period: 40 }), 'rotate(20.00deg)'); // quarter period = peak
  assert.equal(M.swing(10, { maxDeg: 20, period: 40, decay: 0.05 }), 'rotate(12.13deg)'); // peak * e^-0.5
  assert.equal(M.swing(5, { at: 9, maxDeg: 20, period: 40 }), 'rotate(0.00deg)'); // before `at`, still at phase 0
});

test('marquee: copy count, modulo wrap, direction', () => {
  const m0 = M.marquee(0, { content: 'X', unit: 100, width: 250 });
  assert.equal((m0.match(/overflow:hidden/g) || []).length, 5); // 4 unit wrappers + the clip strip
  assert.ok(m0.includes('translateX(0.0px)') || m0.includes('translateX(-0.0px)'));
  const m1 = M.marquee(10, { content: 'X', unit: 100, width: 250, speed: 3 });
  assert.ok(m1.includes('translateX(-30.0px)'));
  const m2 = M.marquee(40, { content: 'X', unit: 100, width: 250, speed: 3 });
  assert.ok(m2.includes('translateX(-20.0px)')); // 120 mod 100 — the seamless wrap
  const m3 = M.marquee(10, { content: 'X', unit: 100, width: 250, speed: 3, dir: 'right' });
  assert.ok(m3.includes('translateX(-70.0px)')); // right: offset - unit
});

test('marchingAnts: dash pattern and crawl offset wrap', () => {
  const a0 = M.marchingAnts(0, { w: 100, h: 60 });
  assert.ok(a0.includes('stroke-dasharray="7 7"'));
  assert.ok(a0.includes('stroke-dashoffset="0.0"'));
  const a1 = M.marchingAnts(10, { w: 100, h: 60 });
  assert.ok(a1.includes('stroke-dashoffset="-12.0"')); // 10 frames * 1.2 speed
  const a2 = M.marchingAnts(20, { w: 100, h: 60 });
  assert.ok(a2.includes('stroke-dashoffset="-10.0"')); // 24 mod 14 — wrapped over the dash period
});

test('highlightBox: draw-on progress from full offset to zero', () => {
  const off = (s) => parseFloat(s.match(/stroke-dashoffset="([\d.]+)"/)[1]);
  const before = M.highlightBox(0, { x: 10, y: 10, w: 100, h: 40, at: 5, dur: 10 });
  assert.ok(before.includes(' Q ')); // wobbly sides are quadratic curves
  const start = M.highlightBox(5, { x: 10, y: 10, w: 100, h: 40, at: 5, dur: 10 });
  const mid = M.highlightBox(10, { x: 10, y: 10, w: 100, h: 40, at: 5, dur: 10 });
  const done = M.highlightBox(15, { x: 10, y: 10, w: 100, h: 40, at: 5, dur: 10 });
  assert.ok(off(before) >= off(start) && off(start) > off(mid) && off(mid) > off(done));
  assert.equal(off(done), 0); // fully drawn at at + dur
  assert.equal(M.highlightBox(9, { x: 1, y: 2, w: 30, h: 12, seed: 4 }), M.highlightBox(9, { x: 1, y: 2, w: 30, h: 12, seed: 4 })); // wobble is deterministic
});

test('waveLine: phase scrolls, amplitude bounded, taper settles the ends', () => {
  const ys = (s) => [...s.matchAll(/ L [\d.]+ (-?[\d.]+)/g)].map((m) => parseFloat(m[1]));
  const w0 = M.waveLine(0, { x: 0, y: 100, w: 96, amp: 10, wl: 48, speed: 0.3 });
  const w1 = M.waveLine(5, { x: 0, y: 100, w: 96, amp: 10, wl: 48, speed: 0.3 });
  assert.notEqual(w0, w1); // phase moved
  assert.ok(ys(w0).every((v) => Math.abs(v - 100) <= 10.01)); // never exceeds amp
  const tapered = M.waveLine(0, { x: 0, y: 100, w: 96, amp: 10, wl: 48, taper: 1 });
  const startY = parseFloat(tapered.match(/M [\d.]+ (-?[\d.]+)/)[1]);
  assert.ok(Math.abs(startY - 100) < 0.01); // the start point settles to the centre line at full taper
});

test('spotlight: static hole geometry and keyframe travel', () => {
  const s = M.spotlight(0, { x: 100, y: 50, r: 40, feather: 30 });
  assert.ok(s.includes('circle at 100.0px 50.0px'));
  assert.ok(s.includes('rgba(4,5,9,0) 40.0px'));
  assert.ok(s.includes('rgba(4,5,9,0.78) 70.0px')); // full dim at r + feather
  const mid = M.spotlight(25, { keys: [{ f: 0, x: 0, y: 0 }, { f: 50, x: 200, y: 100 }] });
  assert.ok(mid.includes('circle at 100.0px 50.0px')); // cubicInOut(0.5) = 0.5 exactly
  const held = M.spotlight(99, { keys: [{ f: 0, x: 0, y: 0 }, { f: 50, x: 200, y: 100 }] });
  assert.ok(held.includes('circle at 200.0px 100.0px')); // holds the last key
});

test('maskReveal: whole cover, growing blob, then gone', () => {
  const before = M.maskReveal(10, { at: 20, dur: 30, w: 560, h: 315 });
  assert.ok(before.includes('background:#101014') && !before.includes('<mask'));
  const mid = M.maskReveal(35, { at: 20, dur: 30, w: 560, h: 315 });
  assert.ok(mid.includes('<mask id="mr1"') && mid.includes(' Q ')); // blob path punched in the cover
  assert.equal(M.maskReveal(55, { at: 20, dur: 30, w: 560, h: 315 }), '');
  assert.notEqual(M.maskReveal(35, { at: 20, dur: 30, w: 560, h: 315, seed: 2 }), mid); // seed reshapes the blob
});

test('matchCut: 80% at the cut, pose and velocity continuous, lands at rest', () => {
  const o = { at: 10, out: 20 };
  assert.equal(M.matchCut(10, o).p, 0);
  const atCut = M.matchCut(30, o);
  assert.equal(atCut.p, 0.8);
  assert.equal(atCut.phase, 'in');
  const vBefore = M.matchCut(30, o).p - M.matchCut(29, o).p;
  const vAfter = M.matchCut(31, o).p - M.matchCut(30, o).p;
  assert.ok(Math.abs(vBefore - vAfter) < 0.01, 'velocity survives the cut: ' + vBefore + ' vs ' + vAfter);
  const done = M.matchCut(35, o); // in-phase lasts out / 4 = 5 frames
  assert.deepEqual([done.phase, done.p, done.v], ['done', 1, 0]);
});

test('inertia: closed-form glide lands exactly at x0 + v0 / k', () => {
  const o = { x0: 10, y0: 0, vx: 12, vy: -3, k: 0.06, at: 5 };
  const start = M.inertia(5, o);
  assert.equal(start.x, 10);
  assert.equal(start.vx, 12);
  assert.equal(M.inertia(2, o).x, 10); // before `at`, still at the start
  const end = M.inertia(500, o);
  assert.ok(Math.abs(end.x - (10 + 12 / 0.06)) < 1e-6); // total travel is exactly v0 / k
  assert.ok(Math.abs(end.y - (0 + -3 / 0.06)) < 1e-6);
  const mid = M.inertia(20, o);
  assert.ok(mid.x > 10 && mid.x < end.x && mid.vx < 12 && mid.vx > 0); // gliding, decaying
});

test('anticipate: winds below zero, releases through, lands exactly on 1', () => {
  const o = { at: 10, wind: 8, dur: 18, depth: 0.2 };
  assert.equal(M.anticipate(5, o), 0); // before `at`
  assert.equal(M.anticipate(10, o), 0); // the wind-up starts from rest
  assert.ok(Math.abs(M.anticipate(14, o) - -0.1) < 1e-9); // mid wind-up: −depth/2 (cosine ease)
  assert.equal(M.anticipate(18, o), -0.2); // fully wound: exactly −depth
  assert.equal(M.anticipate(18 + 18, o), 1); // release lands exactly on 1
  assert.equal(M.anticipate(500, o), 1); // and stays there
  assert.ok(M.anticipate(18 + 12, o) > 1); // the release overshoots on its way in
});

test('followThrough: trailers start later, overshoot more, all land on 1', () => {
  const o = { at: 0, dur: 16, count: 4, lag: 3, boost: 0.35 };
  const start = M.followThrough(0, o);
  assert.deepEqual(start, [0, 0, 0, 0]); // nobody has moved yet
  const early = M.followThrough(4, o);
  assert.ok(early[0] > early[1] && early[1] > early[2]); // staggered starts: the leader moves first
  const mid = M.followThrough(14, o);
  assert.ok(mid[2] > 1); // a late trailer is mid-overshoot…
  assert.ok(Math.abs(mid[0] - 1) < Math.abs(mid[2] - 1)); // …while the leader is already nearest rest
  const end = M.followThrough(500, o);
  assert.deepEqual(end, [1, 1, 1, 1]); // everyone lands exactly on 1
});

test('pixelDissolve: full grid, partial mid-way, gone after', () => {
  const o = { at: 10, dur: 40, w: 400, h: 300, cols: 4, rows: 3, color: '#26221F' };
  const cells = (s) => (s.match(/background:#26221F/g) || []).length;
  assert.equal(cells(M.pixelDissolve(5, o)), 12); // before `at`: the whole grid
  const mid = cells(M.pixelDissolve(30, o));
  assert.ok(mid > 0 && mid < 12, 'mid-dissolve keeps some cells: ' + mid);
  assert.equal(M.pixelDissolve(55, o), '');
});

test('mosaic: full A grid before, A/B mix mid-way, gone after', () => {
  const o = { at: 10, dur: 40, w: 400, h: 300, cols: 4, rows: 3, htmlA: '<b>A</b>', htmlB: '<i>B</i>' };
  const before = M.mosaic(5, o);
  assert.equal(before, '<b>A</b>'); // before `at`: full-bleed A, no grid
  const mid = M.mosaic(30, o);
  const aCount = (mid.match(/<b>A<\/b>/g) || []).length;
  const bCount = (mid.match(/<i>B<\/i>/g) || []).length;
  assert.ok(aCount > 0 && bCount > 0, `mid-transition mixes both scenes: A=${aCount} B=${bCount}`);
  assert.equal(aCount + bCount, 12); // every tile shows exactly one window
  assert.equal(M.mosaic(30, o), mid); // frame-pure
  assert.ok(mid.includes('transform:scale(1.'), 'some tile is mid-swell'); // swell above 1.000
  assert.equal(M.mosaic(60, o), ''); // after the window: nothing
});

test('charGrid: full glyph wall that reshuffles over time', () => {
  const o = { cols: 6, rows: 3, chars: 'AB' };
  const g = M.charGrid(0, o);
  assert.equal((g.match(/<span/g) || []).length, 18);
  assert.equal(M.charGrid(0, o), g); // frame-pure
  assert.notEqual(M.charGrid(60, o), g); // steps advance, wall changes
});

test('assembleText: scattered at the start, typeset at the end', () => {
  const o = { text: 'FLY IN', at: 10, dur: 20 };
  const early = M.assembleText(10, o);
  assert.ok(!early.includes('translate(0.0px,0.0px) rotate(0.0deg);opacity:1.00'));
  const landed = M.assembleText(200, o);
  assert.equal((landed.match(/translate\(0\.0px,0\.0px\)/g) || []).length, 5); // 5 non-space glyphs home
  const scattered = M.assembleText(200, { ...o, mode: 'out' });
  assert.ok(!scattered.includes('translate(0.0px,0.0px)')); // out mode disperses again
});

test('textOnPath: glyphs ride the curve, first at the path start, flow moves them', () => {
  const o = { text: 'WAVE', pts: [[0, 100], [100, 40], [200, 100]], size: 20 };
  const g = M.textOnPath(0, o);
  assert.equal((g.match(/<span/g) || []).length, 4);
  assert.ok(g.includes('translate(0.0px,100.0px)')); // first glyph exactly at the path start
  assert.equal(M.textOnPath(0, o), g);
  assert.notEqual(M.textOnPath(30, { ...o, speed: 2 }), g); // flow advances the string
  assert.equal(M.textOnPath(0, { text: 'X', pts: [[0, 0]] }), ''); // degenerate path
});

test('patternField: full tile coverage that animates with the frame', () => {
  const o = { w: 200, h: 120, tile: 50 };
  const g = M.patternField(0, o);
  assert.equal((g.match(/<g transform=/g) || []).length, 12); // ceil(200/50) x ceil(120/50) = 4 x 3
  assert.equal(M.patternField(0, o), g);
  assert.notEqual(M.patternField(20, o), g);
});

test('slitScan: passthrough outside the window, banded warp inside', () => {
  const html = '<div>SCENE</div>';
  const o = { html, h: 280, bands: 7, at: 10, dur: 40 };
  assert.equal(M.slitScan(5, o), html);
  assert.equal(M.slitScan(60, o), html);
  const mid = M.slitScan(30, o);
  assert.equal((mid.match(/clip-path:inset/g) || []).length, 7); // one clipped copy per band
  assert.notEqual(M.slitScan(34, o), mid); // the field travels
});

test('liquidMetal: canvas tag carries its params; draw is a safe no-op without a DOM', () => {
  const tag = M.liquidMetal(12, { w: 640, h: 360, palette: 'gold', seed: 3 });
  assert.ok(tag.startsWith('<canvas class="mp-liquid" width="640" height="360"'));
  assert.ok(tag.includes('data-frame="12"'));
  assert.ok(tag.includes('"palette":"gold"'));
  assert.equal(M.liquidMetal(12, { w: 640, h: 360, palette: 'gold', seed: 3 }), tag); // frame-pure tag
  assert.doesNotThrow(() => M.liquidMetalDraw(null));
});

test('hash is deterministic and stays in [0, 1)', () => {
  for (let n = 0; n < 200; n++) {
    const h = M.hash(n);
    assert.ok(h >= 0 && h < 1, `hash(${n})=${h}`);
    assert.equal(h, M.hash(n));
  }
  assert.notEqual(M.hash(1), M.hash(2));
});

test('noiseGlow: boiling glow is frame-pure, animated, and honours its knobs', () => {
  const o = { x: 320, y: 180, r: 140 };
  assert.equal(M.noiseGlow(40, o), M.noiseGlow(40, o)); // frame-pure
  assert.notEqual(M.noiseGlow(0, o), M.noiseGlow(30, o)); // the boil moves
  const dflt = M.noiseGlow(40, o);
  assert.ok(dflt.includes('mix-blend-mode:screen'), 'default blend is screen');
  assert.ok(dflt.includes('rgba(255,196,107,'), 'default colour is warm amber #FFC46B');
  assert.ok(M.noiseGlow(40, { ...o, blend: 'color-dodge' }).includes('mix-blend-mode:color-dodge'), 'blend passes through');
  assert.ok(!M.noiseGlow(40, { ...o, sparkles: 0 }).includes('<svg'), 'sparkles: 0 draws no sparkles');
  let sawSparkle = false;
  for (let f = 0; f < 240 && !sawSparkle; f++) if (M.noiseGlow(f, o).includes('<svg')) sawSparkle = true;
  assert.ok(sawSparkle, 'sparkles ignite somewhere in a 240-frame window');
  const off = M.noiseGlow(40, { ...o, intensity: 0 });
  assert.ok(!/rgba\(255,196,107,0\.[1-9]/.test(off), 'intensity 0 kills the glow');
  assert.notEqual(M.noiseGlow(40, { ...o, seed: 3 }), dflt, 'seed changes the boil');
});

test('velocitySkew: skew follows velocity, clamps, and settles', () => {
  const o = { at: 10, dur: 20, from: 0, to: 200, maxSkew: 14 };
  const r0 = M.velocitySkew(5, o);
  assert.equal(r0.pos, 0);
  assert.equal(r0.skew, 0); // before `at`: parked, no shear
  let peak = 0;
  for (let f = 10; f <= 30; f++) {
    const r = M.velocitySkew(f, o);
    peak = Math.max(peak, r.skew);
    assert.ok(Math.abs(r.skew) <= 14 + 1e-9, `skew clamped to maxSkew: ${r.skew}`);
  }
  assert.ok(peak > 2, `skew leans into the move, peak=${peak}`);
  const end = M.velocitySkew(30, o);
  assert.equal(end.pos, 200);
  assert.equal(end.skew, 0); // landed: no shear at rest
  const late = M.velocitySkew(60, o);
  assert.equal(late.pos, 200);
  assert.equal(late.skew, 0);
  assert.deepEqual(M.velocitySkew(16, o), M.velocitySkew(16, o)); // frame-pure
  const neg = M.velocitySkew(14, { at: 10, dur: 20, from: 200, to: 0 });
  assert.ok(neg.skew < 0, `skew flips with direction: ${neg.skew}`);
  // impact mode: ± oscillation that decays to rest
  const io = { mode: 'impact', at: 10, dur: 12, maxSkew: 15 };
  assert.equal(M.velocitySkew(5, io).skew, 0);
  let sawPos = false, sawNeg = false;
  for (let f = 10; f < 22; f++) {
    const s = M.velocitySkew(f, io).skew;
    if (s > 1) sawPos = true;
    if (s < -1) sawNeg = true;
  }
  assert.ok(sawPos && sawNeg, 'impact oscillates both ways');
  assert.ok(Math.abs(M.velocitySkew(21, io).skew) < Math.abs(M.velocitySkew(11, io).skew), 'impact decays');
  assert.equal(M.velocitySkew(30, io).skew, 0);
  // anchor:'start' recenter matches the tan formula
  const a = M.velocitySkew(14, { at: 10, dur: 20, from: 0, to: 200, anchor: 'start', h: 80 });
  const expect = -Math.tan(a.skew * Math.PI / 180) * 40;
  assert.ok(Math.abs(a.recenter - expect) < 1e-9, `recenter=${a.recenter} expected=${expect}`);
  const c = M.velocitySkew(14, o);
  assert.equal(c.recenter, 0); // center anchor is self-centering
  assert.ok(/^translate\([-\d.]+px, 0px\) skewX\([-\d.]+deg\)$/.test(a.css), `css: ${a.css}`);
});

test('relay: keyframed geometry holds endpoints and interpolates between them', () => {
  const keys = [
    { at: 0, x: 100, y: 50, w: 80, h: 80 },
    { at: 60, x: 300, y: 150, w: 240, h: 60, r: 12, opacity: 0.5 },
    { at: 120, x: 300, y: 150, w: 240, h: 60, r: 12, opacity: 0.5 },
  ];
  // holds the first pose before/at the first key, defaults filled in
  assert.deepEqual(M.relay(-5, { keys }), { x: 100, y: 50, w: 80, h: 80, r: 0, opacity: 1, seg: 0, p: 0, done: false });
  assert.deepEqual(M.relay(0, { keys }), { x: 100, y: 50, w: 80, h: 80, r: 0, opacity: 1, seg: 0, p: 0, done: false });
  // lands exactly on each key pose
  const at60 = M.relay(60, { keys });
  assert.equal(at60.x, 300); assert.equal(at60.y, 150);
  assert.equal(at60.w, 240); assert.equal(at60.h, 60);
  assert.equal(at60.r, 12); assert.equal(at60.opacity, 0.5);
  // after the last key: pose holds, done
  const late = M.relay(200, { keys });
  assert.equal(late.done, true);
  assert.equal(late.x, 300); assert.equal(late.opacity, 0.5);
  // linear midpoint is the exact average of both poses
  const mid = M.relay(30, { keys, fn: 'linear' });
  assert.equal(mid.x, 200); assert.equal(mid.y, 100);
  assert.equal(mid.w, 160); assert.equal(mid.h, 70);
  assert.equal(mid.r, 6); assert.equal(mid.opacity, 0.75);
  assert.equal(mid.seg, 0); assert.equal(mid.p, 0.5);
  // default easing is cubicInOut: symmetric, so its midpoint agrees,
  // but a quarter point lags the linear path (slow start)
  const q = M.relay(15, { keys });
  assert.ok(q.x < 150, `cubicInOut starts slow: x=${q.x}`);
  assert.equal(M.relay(30, { keys }).x, 200);
  // a still segment (identical poses) stays put
  assert.equal(M.relay(90, { keys }).x, 300);
  assert.equal(M.relay(90, { keys }).seg, 1);
  // unsorted keys are accepted and never mutated
  const shuffled = [keys[2], keys[0], keys[1]];
  assert.equal(M.relay(30, { keys: shuffled, fn: 'linear' }).x, 200);
  assert.equal(shuffled[0].at, 120);
  // no negative zero leaks through a zero-crossing lerp
  const cross = M.relay(30, { keys: [{ at: 0, x: -50, y: 0, w: 10, h: 10 }, { at: 60, x: 50, y: 0, w: 10, h: 10 }], fn: 'linear' });
  assert.ok(Object.is(cross.x, 0), `expected +0, got ${cross.x}`);
  // frame-pure
  assert.deepEqual(M.relay(33, { keys }), M.relay(33, { keys }));
});

test('splitFlap: ordered charset cycling that clacks into place', () => {
  const CS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // before `at`: every position blank, length preserved
  assert.equal(M.splitFlap(5, { text: 'AB 2', at: 10 }), '    ');
  // fully settled text equals the target exactly
  assert.equal(M.splitFlap(1000, { text: 'BOARDING 7' }), 'BOARDING 7');
  // intermediate glyphs always come from the ordered charset (never random)
  const mid = M.splitFlap(30, { text: 'ZULU' });
  assert.equal(mid.length, 4);
  for (const ch of mid) assert.ok(CS.includes(ch), `glyph ${ch} not in charset`);
  // cycling is ordered: position 0 passes A before B before C...
  assert.equal(M.splitFlap(0, { text: 'C', flipEvery: 1, stagger: 0 }), ' ');
  assert.equal(M.splitFlap(1, { text: 'C', flipEvery: 1, stagger: 0 }), 'A');
  assert.equal(M.splitFlap(2, { text: 'C', flipEvery: 1, stagger: 0 }), 'B');
  assert.equal(M.splitFlap(3, { text: 'C', flipEvery: 1, stagger: 0 }), 'C');
  // once a position locks it never moves again (monotone lock-in)
  const t = 'GATE 9';
  let locked = '';
  for (let f = 0; f <= 400; f++) {
    const s = M.splitFlap(f, { text: t });
    for (let i = 0; i < t.length; i++) {
      if (locked[i] && locked[i] !== ' ') assert.equal(s[i], locked[i], `pos ${i} unlocked at frame ${f}`);
      if (s[i] === t[i]) locked = locked.slice(0, i) + s[i] + locked.slice(i + 1);
    }
  }
  assert.equal(locked, t);
  // stagger: later positions start later (left-to-right clack)
  const s5 = M.splitFlap(5, { text: 'AAAA', flipEvery: 1, stagger: 4 });
  assert.equal(s5[0], 'A');           // pos 0 needs 1 step: locked at frame 1
  assert.equal(s5[3], ' ');           // pos 3 starts at frame 12: still blank
  // characters outside the charset appear whole at their turn
  assert.equal(M.splitFlap(100, { text: 'Aé' }), 'Aé');
  assert.equal(M.splitFlap(0, { text: 'Aé', stagger: 5 }), '  ');
  // frame-pure
  assert.equal(M.splitFlap(33, { text: 'BOARDING' }), M.splitFlap(33, { text: 'BOARDING' }));
});

test('portalWipe: disc blooms, swallows the outgoing scene, contracts to reveal', () => {
  const o = { at: 20, dur: 36, w: 560, h: 315, color: '#F5F4F0', x: 100, y: 150, x2: 460, y2: 160 };
  assert.equal(M.portalWipe(19, o), '', 'disc-only mode: nothing before at');
  assert.equal(M.portalWipe(56, o), '', 'after at + dur: nothing');
  // frame-pure
  assert.equal(M.portalWipe(30, o), M.portalWipe(30, o));
  const rOf = (s) => parseFloat(/ r="([\d.]+)"/.exec(s)[1]);
  const cxOf = (s) => parseFloat(/ cx="([\d.]+)"/.exec(s)[1]);
  // expand phase: radius grows (easeOutCubic, 55% of 32 motion frames = 18 frames)
  const rEarly = rOf(M.portalWipe(22, o));
  const rLate = rOf(M.portalWipe(30, o));
  assert.ok(rLate > rEarly, `expected growth, ${rEarly} -> ${rLate}`);
  // hold phase (frames 38..41 with hold=4): radius pinned at max
  assert.equal(rOf(M.portalWipe(39, o)), rOf(M.portalWipe(40, o)));
  // contract phase: radius shrinks and the center travels toward (x2, y2)
  const rCon1 = rOf(M.portalWipe(44, o));
  const rCon2 = rOf(M.portalWipe(50, o));
  assert.ok(rCon2 < rCon1, `expected shrink, ${rCon1} -> ${rCon2}`);
  assert.ok(cxOf(M.portalWipe(50, o)) > cxOf(M.portalWipe(30, o)), 'center travels during contraction');
  // the disc must swallow the stage: at full bloom radius covers the farthest corner
  const maxR = Math.hypot(Math.max(100, 460, 560 - 100, 560 - 460), Math.max(150, 160, 315 - 150, 315 - 160)) * 1.06;
  assert.ok(Math.abs(rOf(M.portalWipe(39, o)) - maxR) < 0.1, 'hold radius covers the stage');
  // echo rings trail the rim only when asked
  assert.ok(!M.portalWipe(30, o).includes('stroke='), 'no rings by default');
  const echoOut = M.portalWipe(30, { ...o, echo: 2 });
  assert.equal((echoOut.match(/stroke="/g) || []).length, 2, 'two echo rings');
  // html contract: the outgoing scene is carried, clipped, then swallowed
  const scene = '<div>SCENE-ONE-MARKER</div>';
  assert.equal(M.portalWipe(19, { ...o, html: scene }), scene, 'before at: outgoing scene renders whole');
  const bloom = M.portalWipe(22, { ...o, html: scene });
  assert.ok(bloom.includes('SCENE-ONE-MARKER'), 'bloom: outgoing scene still present');
  assert.ok(bloom.includes('mask:url(#pw'), 'bloom: scene clipped by the disc mask');
  assert.ok(bloom.includes('fill="#F5F4F0"'), 'disc keeps the portal color');
  assert.ok(!M.portalWipe(44, { ...o, html: scene }).includes('SCENE-ONE-MARKER'),
    'contract: outgoing scene is swallowed');
});

test('rings: pulse train expands and fades, breathe swells, spin rotates arcs', () => {
  const o = { at: 10, x: 200, y: 150, count: 4, r0: 20, gap: 30, dur: 80 };
  const circles = (s) => [...s.matchAll(/<circle [^/]*\/>/g)].map((m) => m[0]);
  const rOf = (c) => parseFloat(/ r="([\d.]+)"/.exec(c)[1]);
  const opOf = (c) => parseFloat(/ opacity="([\d.]+)"/.exec(c)[1]);
  // window + purity
  assert.equal(M.rings(9, o), '', 'nothing before at');
  assert.equal(M.rings(30, o), M.rings(30, o), 'frame-pure');
  const cs = circles(M.rings(30, o));
  assert.equal(cs.length, 4, 'one circle per ring');
  // pulse: every radius inside [r0, r0 + count*gap], fainter as it grows
  for (const c of cs) {
    const r = rOf(c);
    assert.ok(r >= 20 && r <= 20 + 4 * 30, `radius in train span, got ${r}`);
  }
  const byR = cs.slice().sort((a, b) => rOf(a) - rOf(b));
  assert.ok(opOf(byR[0]) > opOf(byR[byR.length - 1]), 'outer rings fade');
  // pulse: the whole train advances — mean radius at frame 50 beats frame 30's
  // (measured within one loop period, phases never wrap backward together)
  const mean = (s) => circles(s).reduce((a, c) => a + rOf(c), 0) / 4;
  const train = (f) => circles(M.rings(f, { ...o, seed: 0 })).map(rOf).sort((a, b) => a - b).join(',');
  assert.notEqual(train(30), train(50), 'train moves between frames');
  // (mean radius is invariant under shifts of exactly k/count — the
  // train permutes — so compare at a non-multiple shift, 14 frames)
  assert.ok(mean(M.rings(44, o)) !== mean(M.rings(30, o)), 'train state changes');
  // pulse loops: state at lf and lf + dur is identical for the same seed
  assert.equal(M.rings(10 + 40, o), M.rings(10 + 40 + 80, o), 'pulse period = dur');
  // breathe: settled set, radii near r0 + i*gap, periodic on the sine
  const b = { mode: 'breathe', count: 3, r0: 30, gap: 40, speed: (Math.PI * 2) / 60 };
  const bc = circles(M.rings(100, b));
  assert.equal(bc.length, 3);
  bc.forEach((c, i) => {
    const r = rOf(c);
    assert.ok(Math.abs(r - (30 + i * 40)) <= 5.01, `breathe ring ${i} swells around its rest radius, got ${r}`);
  });
  assert.equal(M.rings(100, b), M.rings(160, b), 'breathe period matches speed');
  // spin: dashed arcs, rotation advances with the frame, counter-rotation signs differ
  const s1 = M.rings(100, { mode: 'spin', count: 3 });
  const s2 = M.rings(110, { mode: 'spin', count: 3 });
  assert.ok(s1.includes('stroke-dasharray='), 'spin rings are dashed arcs');
  assert.notEqual(s1, s2, 'spin rotates');
  const angs = (s) => [...s.matchAll(/rotate\((-?[\d.]+) /g)].map((m) => parseFloat(m[1]));
  const a1 = angs(s1), a2 = angs(s2);
  assert.ok(Math.sign(a2[0] - a1[0]) !== Math.sign(a2[1] - a1[1]), 'neighbouring rings counter-rotate');
  // defaults: no options bag beyond position still draws the default 4 rings
  assert.equal(circles(M.rings(0, {})).length, 4, 'defaults draw 4 rings');
});
