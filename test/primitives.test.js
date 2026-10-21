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
  'bars', 'scramble', 'kenBurns', 'fx', 'paperEl', 'pivot', 'stepped', 'onTwos', 'whip', 'pathFly', 'flipIn', 'counterRoll', 'drawText', 'particleField', 'morphShape', 'glitch', 'beatGrid', 'beatFrames', 'morphPoly', 'splitText'];

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

test('hash is deterministic and stays in [0, 1)', () => {
  for (let n = 0; n < 200; n++) {
    const h = M.hash(n);
    assert.ok(h >= 0 && h < 1, `hash(${n})=${h}`);
    assert.equal(h, M.hash(n));
  }
  assert.notEqual(M.hash(1), M.hash(2));
});
