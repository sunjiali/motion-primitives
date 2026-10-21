'use strict';
/* Core contract of the library: everything is a pure function of the frame.
 * Same frame in -> identical output out, in Node and in the browser. */
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../index.js');

const API = ['pop', 'ease', 'fadeUp', 'pulse', 'breathe', 'countUp', 'stagger',
  'fly', 'trail', 'smear', 'squash', 'dot', 'ripple', 'burst', 'badge', 'targetSlot',
  'scene', 'transition', 'wiggle', 'typewriter', 'hash', 'beat', 'drop',
  'travel', 'shake', 'punch', 'flash', 'camera', 'meshBg', 'drawOn', 'poly',
  'bars', 'scramble', 'kenBurns', 'fx', 'paperEl', 'pivot', 'stepped', 'onTwos', 'whip', 'pathFly', 'flipIn', 'counterRoll'];

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

test('hash is deterministic and stays in [0, 1)', () => {
  for (let n = 0; n < 200; n++) {
    const h = M.hash(n);
    assert.ok(h >= 0 && h < 1, `hash(${n})=${h}`);
    assert.equal(h, M.hash(n));
  }
  assert.notEqual(M.hash(1), M.hash(2));
});
