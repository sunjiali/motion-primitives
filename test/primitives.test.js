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
  'bars', 'scramble', 'splitFlap', 'kenBurns', 'fx', 'paperEl', 'pivot', 'stepped', 'onTwos', 'whip', 'pathFly', 'flipIn', 'counterRoll', 'drawText', 'particleField', 'morphShape', 'glitch', 'chroma', 'beatGrid', 'beatFrames', 'morphPoly', 'splitText', 'wipeReveal', 'confetti', 'cursor', 'isoBox', 'isoCylinder', 'isoWedge', 'isoPipe', 'isoGear', 'isoCone', 'isoBolt', 'isoTerrain', 'isoSort', 'orbit', 'swing', 'marquee', 'marchingAnts', 'highlightBox', 'waveLine', 'spotlight', 'maskReveal', 'matchCut', 'inertia', 'pixelDissolve', 'charGrid', 'assembleText', 'textOnPath', 'patternField', 'slitScan', 'sliceWave', 'letterTrack', 'speedLines', 'liquidMetal', 'liquidMetalDraw', 'anticipate', 'followThrough', 'velocitySkew', 'noiseGlow', 'relay', 'portalWipe', 'rings', 'mosaic', 'springSheet', 'waveText', 'shine', 'frost', 'edgeBoil', 'dominoReveal', 'varFont', 'tvOff', 'venetianBlinds', 'shatter', 'flicker', 'echo'];

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

test('chroma: passthrough outside the window, smooth RGB fringe inside, pulse envelope clean at both ends', () => {
  const o = { at: 10, dur: 20, html: '<b>X</b>', amount: 8 };
  assert.equal(M.chroma(9, o), '<b>X</b>');
  assert.equal(M.chroma(30, o), '<b>X</b>');
  assert.equal(M.chroma(10, { html: '' }), '');
  const shifts = (h) => [...h.matchAll(/translate\((-?[\d.]+)px,(-?[\d.]+)px\)/g)]
    .map((m) => [parseFloat(m[1]), parseFloat(m[2])]);
  const mid = M.chroma(20, o); // p = 0.5, envelope peak
  assert.equal((mid.match(/<b>X<\/b>/g) || []).length, 3); // base + 2 channel ghosts
  assert.ok(mid.includes('feColorMatrix'), 'channel ghosts use SVG isolation');
  assert.ok(!mid.includes('clip-path'), 'no slicing — that is glitch, not chroma');
  const m = shifts(mid);
  assert.equal(m.length, 2);
  assert.ok(Math.abs(m[0][0]) > 5 && Math.abs(m[1][0]) > 5, 'mid-window ghosts are offset');
  assert.ok(Math.abs(m[0][0] + m[1][0]) < 0.05, 'ghosts are symmetric around the clean base');
  assert.ok(Math.max(...shifts(M.chroma(10, o)).flat().map(Math.abs)) < 0.05, 'first frame is clean (envelope 0)');
  assert.ok(Math.max(...shifts(M.chroma(29, o)).flat().map(Math.abs)) < 1.5, 'last frame nearly clean');
  assert.equal(M.chroma(20, o), mid); // determinism
  const sus = M.chroma(50, { ...o, at: 40, dur: 40, mode: 'sustain' });
  assert.ok(Math.max(...shifts(sus).flat().map(Math.abs)) > 4, 'sustain holds a steady offset');
  const diag = M.chroma(20, { ...o, angle: 90 });
  assert.ok(Math.abs(shifts(diag)[0][1]) > 5 && Math.abs(shifts(diag)[0][0]) < 0.05, 'angle 90 splits vertically');
});

test('shine: passthrough outside the window, one light band sweeping across, angle steers the gradient', () => {
  const o = { at: 10, dur: 20, html: '<b>X</b>' };
  assert.equal(M.shine(9, o), '<b>X</b>');
  assert.equal(M.shine(30, o), '<b>X</b>');
  assert.equal(M.shine(10, { html: '' }), '');
  const mid = M.shine(20, o); // p = 0.5, band centre at 50%
  assert.ok(mid.includes('linear-gradient(90deg,'), 'default angle 0 sweeps left-to-right');
  assert.ok(mid.includes('mix-blend-mode:screen'), 'default blend is screen');
  assert.ok(mid.includes('opacity:0.800'), 'default amount is 0.8');
  assert.ok(mid.includes('rgba(255,255,255,1.000)'), 'white band by default');
  // bright-stop centre: mean of the two full-strength stops
  const centre = (h) => {
    const stops = [...h.matchAll(/rgba\(255,255,255,1\.000\) ([-\d.]+)%/g)].map((m) => parseFloat(m[1]));
    assert.equal(stops.length, 2, 'one bright core, two edge stops');
    return (stops[0] + stops[1]) / 2;
  };
  assert.ok(Math.abs(centre(mid) - 50) < 1, 'band is centred mid-window');
  assert.ok(centre(M.shine(15, o)) < 0, 'band still off-stage left early on');
  assert.ok(centre(M.shine(25, o)) > 100, 'band already off-stage right late on');
  assert.ok(centre(M.shine(15, o)) < centre(mid) && centre(mid) < centre(M.shine(25, o)), 'band travels monotonically');
  assert.equal(M.shine(20, o), mid); // determinism
  const diag = M.shine(20, { ...o, angle: 90 });
  assert.ok(diag.includes('linear-gradient(180deg,'), 'angle 90 sweeps top-to-bottom');
  const pink = M.shine(20, { ...o, color: '#FF6B81', blend: 'overlay', amount: 0.5 });
  assert.ok(pink.includes('rgba(255,107,129,1.000)'), 'custom color drives the band');
  assert.ok(pink.includes('mix-blend-mode:overlay'), 'custom blend respected');
  assert.ok(pink.includes('opacity:0.500'), 'custom amount respected');
});

test('frost: passthrough outside the window, blur radius clears from `from` to `to` on the ease', () => {
  const o = { at: 10, dur: 20, html: '<b>X</b>' };
  assert.equal(M.frost(9, o), '<b>X</b>');
  assert.equal(M.frost(30, o), '<b>X</b>');
  assert.equal(M.frost(10, { html: '' }), '');
  const radius = (h) => {
    const m = h.match(/filter:blur\(([-\d.]+)px\)/);
    assert.ok(m, 'blur filter present, got: ' + h);
    return parseFloat(m[1]);
  };
  assert.ok(Math.abs(radius(M.frost(10, o)) - 12) < 0.01, 'first frame is fully frosted (from 12)');
  // p = 0.5, cubicOut(0.5) = 0.875, so 12 * (1 - 0.875) = 1.5
  assert.ok(Math.abs(radius(M.frost(20, o)) - 1.5) < 0.05, 'mid-window nearly clear on cubicOut');
  assert.ok(radius(M.frost(29, o)) < 0.05, 'last frame essentially clear');
  assert.ok(radius(M.frost(15, o)) > radius(M.frost(20, o)) && radius(M.frost(20, o)) > radius(M.frost(25, o)), 'blur clears monotonically');
  const mid = M.frost(20, o);
  assert.equal(M.frost(20, o), mid); // determinism
  const rev = M.frost(20, { ...o, from: 0, to: 12 });
  assert.ok(Math.abs(radius(rev) - 10.5) < 0.05, 'reversed frost sinks in (0 -> 12)');
  const lin = M.frost(20, { ...o, fn: 'linear' });
  assert.ok(Math.abs(radius(lin) - 6) < 0.01, 'custom fn respected (linear mid = 6)');
  const deep = M.frost(20, { ...o, from: 24 });
  assert.ok(Math.abs(radius(deep) - 3) < 0.05, 'custom from respected (24 * 0.125)');
});

test('edgeBoil: hand-drawn boil — SVG turbulence displaces the wrapped HTML, seed re-rolls every step frames, window ramps in/out', () => {
  const o = { at: 10, dur: 20, html: '<b>X</b>' };
  assert.equal(M.edgeBoil(9, o), '<b>X</b>');
  assert.equal(M.edgeBoil(30, o), '<b>X</b>');
  assert.equal(M.edgeBoil(10, { html: '' }), '');
  const scale = (h) => {
    const m = h.match(/scale="([-\d.]+)"/);
    assert.ok(m, 'displacement scale present, got: ' + h);
    return parseFloat(m[1]);
  };
  const seedOf = (h) => {
    const m = h.match(/seed="(\d+)"/);
    assert.ok(m, 'turbulence seed present, got: ' + h);
    return parseInt(m[1], 10);
  };
  const freqOf = (h) => {
    const m = h.match(/baseFrequency="([-\d.]+)"/);
    assert.ok(m, 'baseFrequency present, got: ' + h);
    return parseFloat(m[1]);
  };
  const idOf = (h) => {
    const m = h.match(/filter id="([^"]+)"/);
    assert.ok(m, 'filter id present, got: ' + h);
    return m[1];
  };
  // sustained (no dur): full amp from frame 0, default amp 4 / freq 0.02 / octaves 2
  const s0 = M.edgeBoil(0, { html: '<b>X</b>' });
  assert.ok(Math.abs(scale(s0) - 4) < 0.01, 'sustained boil runs at default amp 4');
  assert.ok(Math.abs(freqOf(s0) - 0.02) < 1e-9, 'default baseFrequency 0.02');
  assert.ok(s0.includes('numOctaves="2"'), 'default 2 octaves');
  assert.ok(s0.includes('feDisplacementMap'), 'displacement map present');
  assert.ok(s0.includes('filter:url(#'), 'wrapper carries the filter url');
  // seed re-rolls every step (default 4): same block -> same seed, next block -> new seed
  assert.equal(seedOf(M.edgeBoil(10, o)), seedOf(M.edgeBoil(13, o)), 'seed holds inside a step-block');
  assert.notEqual(seedOf(M.edgeBoil(10, o)), seedOf(M.edgeBoil(14, o)), 'seed re-rolls at the block boundary');
  assert.equal(M.edgeBoil(12, o), M.edgeBoil(12, o)); // determinism
  // windowed ramp: 4-frame smooth in/out (dur 20, ramp 4)
  assert.ok(Math.abs(scale(M.edgeBoil(10, o))) < 0.01, 'first window frame boils at 0 (ramp start)');
  assert.ok(Math.abs(scale(M.edgeBoil(12, o)) - 2) < 0.01, 'halfway up the ramp the scale is half amp');
  assert.ok(Math.abs(scale(M.edgeBoil(14, o)) - 4) < 0.01, 'ramp done by frame 14');
  assert.ok(Math.abs(scale(M.edgeBoil(29, o))) < 0.01, 'last window frame boils back to 0');
  // knobs respected
  assert.ok(Math.abs(scale(M.edgeBoil(14, { ...o, amp: 8 })) - 8) < 0.01, 'custom amp respected');
  assert.ok(Math.abs(freqOf(M.edgeBoil(14, { ...o, freq: 0.05 })) - 0.05) < 1e-9, 'custom freq respected');
  assert.notEqual(seedOf(M.edgeBoil(11, { ...o, step: 2 })), seedOf(M.edgeBoil(12, { ...o, step: 2 })), 'step 2 re-rolls every 2 frames');
  assert.notEqual(idOf(M.edgeBoil(14, { ...o, amp: 4 })), idOf(M.edgeBoil(14, { ...o, amp: 8 })), 'different amp -> different filter id');
  assert.equal(idOf(M.edgeBoil(14, { ...o, amp: 4 })), idOf(M.edgeBoil(14, { ...o, amp: 4 })), 'same params -> same filter id');
});

test('dominoReveal: tiles stand before at, topple in a propagated wave, fade flat, passthrough after dur', () => {
  // count 4, dur 30, fall 10, fade 8 -> step = (30-10-8)/3 = 4
  const o = { at: 10, dur: 30, count: 4, html: '<b>X</b>' };
  assert.equal(M.dominoReveal(40, o), '<b>X</b>'); // past the window: passthrough
  assert.equal(M.dominoReveal(10, { html: '' }), '');
  const tiles = (h) => {
    const ms = [...h.matchAll(/transform:rotate\(([-\d.]+)deg\);opacity:([\d.]+)/g)];
    assert.equal(ms.length, 4, 'four tiles, got: ' + h);
    return ms.map((m) => ({ deg: parseFloat(m[1]), op: parseFloat(m[2]) }));
  };
  const before = tiles(M.dominoReveal(9, o));
  assert.ok(before.every((t) => t.deg === 0 && t.op === 1), 'all tiles standing before at');
  const mid = tiles(M.dominoReveal(20, o));
  // tile 0 started at 10, 10 frames in: fully fallen (quadIn(1) = 1 -> 90°)
  assert.ok(Math.abs(mid[0].deg - 90) < 0.01, 'first tile flat by frame 20');
  // tile 1 started at 14, 6/10 through the fall: quadIn(0.6) = 0.36 -> 32.4°
  assert.ok(Math.abs(mid[1].deg - 32.4) < 0.05, 'second tile mid-fall on the gravity ease');
  // tile 2 started at 18, 2/10 in: quadIn(0.2) = 0.04 -> 3.6°
  assert.ok(Math.abs(mid[2].deg - 3.6) < 0.05, 'third tile barely started');
  assert.equal(mid[3].deg, 0, 'last tile still standing');
  assert.ok(mid[0].deg > mid[1].deg && mid[1].deg > mid[2].deg, 'wave propagates in order');
  const late = tiles(M.dominoReveal(29, o));
  // tile 0 landed at 20, 9 frames into its 8-frame fade: opacity 0
  assert.equal(late[0].op, 0, 'fallen tile faded out');
  // tile 1 landed at 24, 5/8 through its fade: opacity 0.375; tile 2 just landed (1/8): 0.875
  assert.ok(Math.abs(late[1].op - 0.375) < 0.01, 'second tile mid-fade');
  assert.ok(Math.abs(late[2].op - 0.875) < 0.01, 'third tile just landed, barely faded');
  assert.equal(late[3].op, 1, 'last tile still falling, full opacity');
  const left = tiles(M.dominoReveal(20, { ...o, dir: 'left' }));
  assert.ok(Math.abs(left[3].deg + 90) < 0.01, 'left wave: last tile falls first, negative angle');
  assert.equal(left[0].deg, 0, 'left wave: first tile still standing');
  const stay = tiles(M.dominoReveal(29, { ...o, fade: 0 }));
  assert.ok(stay.every((t) => t.op === 1), 'fade 0 keeps fallen tiles lying');
  const band = M.dominoReveal(15, { ...o, x: 10, y: 20, w: 400, h: 100 });
  assert.ok(band.includes('left:10.0px;top:20px;width:100.0px;height:100px;'), 'band geometry respected (first tile)');
  assert.ok(band.includes('left:310.0px;'), 'band tiles span x..x+w');
  const full = M.dominoReveal(15, o);
  assert.ok(full.includes('top:0;') && full.includes('height:100%;'), 'no band: tiles cover the full stage');
  assert.ok(full.includes('inset:0;overflow:hidden;'), 'wrapper stays full-stage so html keeps its coordinates');
  assert.equal(M.dominoReveal(20, o), M.dominoReveal(20, o)); // determinism
});

test('dotText: halftone dot-filled text — in grows on a hash stagger, out shrinks away, pulse breathes on a period', () => {
  const o = { text: 'DOT', at: 10, dur: 30 };
  const circles = (h) => [...h.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="([^"]+)"/g)]
    .map((m) => ({ x: parseFloat(m[1]), y: parseFloat(m[2]), r: parseFloat(m[3]), fill: m[4] }));
  const maskId = (h) => { const m = h.match(/<mask id="([^"]+)"/); assert.ok(m, 'mask present, got: ' + h.slice(0, 200)); return m[1]; };
  assert.equal(M.dotText(5, o), '', 'in: hidden before at');
  assert.equal(M.dotText(10, { text: '' }), '', 'empty text returns nothing');
  // Full field at the window end: 1280x720 stage, gap 16 -> 80x45 dots,
  // every dot at its full radius (base 16*0.42 = 6.72, ±8% print variation).
  const full = circles(M.dotText(40, o));
  assert.equal(full.length, 3600, 'full field covers the whole stage grid');
  assert.ok(full.every((c) => c.r >= 6.72 * 0.92 - 0.1 && c.r <= 6.72 * 1.08 + 0.1),
    'settled radii sit at base ± print variation');
  assert.ok(full.every((c) => c.fill === '#26221F'), 'default ink colour on every dot');
  assert.ok(M.dotText(40, o).includes('<text') && M.dotText(40, o).includes('>DOT</text>'),
    'mask carries the text itself');
  // Mid-window: dots are mid-growth, a few still below the 0.05 skip floor.
  const mid = circles(M.dotText(25, { ...o, fn: 'linear' }));
  assert.ok(mid.length < 3600 && mid.length > 3000, 'mid-window field is mostly grown, got ' + mid.length);
  assert.ok(mid.some((c) => c.r < 6), 'stagger leaves some dots small mid-window');
  assert.ok(mid.every((c) => c.r <= 6.72 * 1.08 + 0.1), 'no dot overshoots its settled radius');
  // Mask ids are deterministic per text+geometry, and differ by position.
  assert.equal(maskId(M.dotText(40, o)), maskId(M.dotText(40, o)), 'same call, same mask id');
  assert.notEqual(maskId(M.dotText(40, o)), maskId(M.dotText(40, { ...o, x: 100 })),
    'same text at another spot gets another mask id');
  assert.notEqual(maskId(M.dotText(40, o)), maskId(M.dotText(40, { ...o, text: 'DOG' })),
    'another word gets another mask id');
  // Gap steers the grid: gap 32 quarters the dot count.
  assert.equal(circles(M.dotText(40, { ...o, gap: 32 })).length, 920, 'gap 32 -> 40x23 grid');
  // Custom dot fraction steers the radius: dot 0.5 -> base 8.
  const chunky = circles(M.dotText(40, { ...o, dot: 0.5 }));
  assert.ok(chunky.every((c) => c.r <= 8 * 1.08 + 0.1) && chunky.some((c) => c.r > 7.5),
    'dot fraction scales the radius');
  // Out: full before at, gone after the window, shrinking mid-window.
  assert.equal(circles(M.dotText(9, { ...o, mode: 'out' })).length, 3600, 'out: full field before at');
  assert.equal(M.dotText(40, { ...o, mode: 'out' }), '', 'out: gone after the window');
  const shrinking = circles(M.dotText(25, { ...o, mode: 'out', fn: 'linear' }));
  assert.ok(shrinking.length < 3600 && shrinking.length > 3000, 'out: dots shrink away staggered');
  // Pulse: sustained (ignores at/dur) and periodic on `speed` (default 30 f).
  assert.ok(M.dotText(0, { ...o, mode: 'pulse' }).length > 1000, 'pulse: dots present from frame 0');
  assert.equal(M.dotText(0, { ...o, mode: 'pulse' }), M.dotText(30, { ...o, mode: 'pulse' }),
    'pulse repeats every period');
  assert.notEqual(M.dotText(0, { ...o, mode: 'pulse' }), M.dotText(8, { ...o, mode: 'pulse' }),
    'pulse actually moves mid-period');
  assert.equal(M.dotText(40, o), M.dotText(40, o)); // determinism
});

test('iris: circular-aperture reveal — open grows, close shrinks, blink holds a dot, feather softens the rim', () => {
  const o = { at: 10, dur: 30, html: '<b>X</b>' };
  const radius = (h) => {
    const m = h.match(/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/);
    assert.ok(m, 'clip circle present, got: ' + h);
    return { r: parseFloat(m[1]), x: parseFloat(m[2]), y: parseFloat(m[3]) };
  };
  // open: hidden before at, passthrough after the window
  assert.equal(M.iris(9, o), '');
  assert.equal(M.iris(40, o), '<b>X</b>');
  assert.equal(M.iris(10, { html: '' }), '');
  // maxR for the 1280x720 default stage from centre: hypot(640,360)*1.02
  const maxR = Math.hypot(640, 360) * 1.02;
  const mid = radius(M.iris(25, { ...o, fn: 'linear' }));
  assert.ok(Math.abs(mid.r - maxR / 2) < 0.05, 'linear mid = half the farthest-corner radius');
  assert.deepEqual([mid.x, mid.y], [640, 360]);
  const late = radius(M.iris(39, { ...o, fn: 'linear' }));
  assert.ok(Math.abs(late.r - maxR * (29 / 30)) < 0.05, 'radius still growing at the window end');
  // custom fn respected: cubicOut(0.5) = 0.875
  const eased = radius(M.iris(25, o));
  assert.ok(Math.abs(eased.r - maxR * 0.875) < 0.05, 'default cubicOut ease on the open');
  // custom origin: corner origin reaches the opposite corner
  const corner = radius(M.iris(25, { ...o, fn: 'linear', x: 0, y: 0 }));
  assert.ok(Math.abs(corner.r - (Math.hypot(1280, 720) * 1.02) / 2) < 0.05, 'corner origin uses the farthest corner');
  assert.deepEqual([corner.x, corner.y], [0, 0]);
  // close: content before, gone after, radius shrinking mid-window
  assert.equal(M.iris(9, { ...o, mode: 'close' }), '<b>X</b>');
  assert.equal(M.iris(40, { ...o, mode: 'close' }), '');
  const closing = radius(M.iris(25, { ...o, mode: 'close', fn: 'linear' }));
  assert.ok(Math.abs(closing.r - maxR / 2) < 0.05, 'close mid = half radius');
  // blink: closes to a dot, holds, reopens — content visible before and after
  const blink = { at: 10, dur: 40, hold: 8, html: '<b>X</b>' };
  assert.equal(M.iris(9, { ...blink, mode: 'blink' }), '<b>X</b>');
  assert.equal(M.iris(50, { ...blink, mode: 'blink' }), '<b>X</b>');
  const held = radius(M.iris(30, { ...blink, mode: 'blink' }));
  assert.ok(Math.abs(held.r - 8) < 0.05, 'blink holds at the dot radius (default 8)');
  const reopened = radius(M.iris(42, { ...blink, mode: 'blink' }));
  assert.ok(Math.abs(reopened.r - maxR * 0.5) < 0.05, 'blink reopens on cubicInOut(0.5)');
  // feather: soft rim via mask gradient (inner stop = r - feather), hard clip otherwise
  const soft = M.iris(25, { ...o, fn: 'linear', feather: 20 });
  const g = soft.match(/mask-image:radial-gradient\(circle ([\d.]+)px at [\d.]+px [\d.]+px,#000 0,#000 ([\d.]+)px,transparent ([\d.]+)px\)/);
  assert.ok(g, 'feathered iris carries a mask gradient, got: ' + soft);
  assert.ok(Math.abs(parseFloat(g[1]) - maxR / 2) < 0.05, 'gradient outer stop = radius');
  assert.ok(Math.abs(parseFloat(g[2]) - (maxR / 2 - 20)) < 0.05, 'gradient inner stop = radius - feather');
  assert.ok(!soft.includes('clip-path'), 'feathered iris uses a mask, not clip-path');
  assert.ok(M.iris(25, o).includes('clip-path:circle('), 'feather 0 uses a hard clip-path');
  assert.equal(M.iris(25, o), M.iris(25, o)); // determinism
});

test('clockWipe: radial clock-hand sector reveal — open sweeps 0→360, close winds back, ccw mirrors, start moves home', () => {
  const o = { at: 10, dur: 30, html: '<b>X</b>' };
  const sector = (h) => {
    const m = h.match(/conic-gradient\(from (-?[\d.]+)deg at ([\d.]+)px ([\d.]+)px,#000 0deg,#000 ([\d.]+)deg,transparent ([\d.]+)deg\)/);
    assert.ok(m, 'conic-gradient sector mask present, got: ' + h);
    return { from: parseFloat(m[1]), x: parseFloat(m[2]), y: parseFloat(m[3]), sweep: parseFloat(m[4]) };
  };
  // open: hidden before at, passthrough after the window
  assert.equal(M.clockWipe(9, o), '');
  assert.equal(M.clockWipe(40, o), '<b>X</b>');
  assert.equal(M.clockWipe(10, { html: '' }), '');
  // linear mid = half the circle; origin defaults to stage centre
  const mid = sector(M.clockWipe(25, { ...o, fn: 'linear' }));
  assert.ok(Math.abs(mid.sweep - 180) < 0.05, 'linear mid = 180 degrees');
  assert.deepEqual([mid.from, mid.x, mid.y], [0, 640, 360]);
  // custom fn respected: cubicOut(0.5) = 0.875 -> 315 degrees
  const eased = sector(M.clockWipe(25, o));
  assert.ok(Math.abs(eased.sweep - 315) < 0.05, 'default cubicOut ease on the open');
  // close: content before, gone after, sector shrinking mid-window
  assert.equal(M.clockWipe(9, { ...o, mode: 'close' }), '<b>X</b>');
  assert.equal(M.clockWipe(40, { ...o, mode: 'close' }), '');
  const closing = sector(M.clockWipe(25, { ...o, mode: 'close', fn: 'linear' }));
  assert.ok(Math.abs(closing.sweep - 180) < 0.05, 'close mid = 180 degrees remaining');
  // ccw: same sweep, gradient starts lower so the sector runs backwards
  const ccw = sector(M.clockWipe(25, { ...o, fn: 'linear', dir: 'ccw' }));
  assert.ok(Math.abs(ccw.sweep - 180) < 0.05, 'ccw keeps the sweep size');
  assert.ok(Math.abs(ccw.from - (-180)) < 0.05, 'ccw starts one sweep below home');
  // start: moves the hand's home angle (90 = 3 o'clock)
  const started = sector(M.clockWipe(25, { ...o, fn: 'linear', start: 90 }));
  assert.ok(Math.abs(started.from - 90) < 0.05, 'start 90 puts the hand at 3 o\'clock');
  // custom origin: sector centred where asked
  const corner = sector(M.clockWipe(25, { ...o, fn: 'linear', x: 0, y: 0 }));
  assert.deepEqual([corner.x, corner.y], [0, 0]);
  assert.equal(M.clockWipe(25, o), M.clockWipe(25, o)); // determinism
});

test('tvOff: CRT power-off/on — vertical squash into a glowing line, horizontal pinch to a dot, then black; on mirrors it', () => {
  const o = { at: 10, dur: 30, html: '<b>X</b>' };
  const scales = (h) => {
    const m = h.match(/transform:scaleX\(([\d.]+)\) scaleY\(([\d.]+)\)/);
    assert.ok(m, 'wrapper scale present, got: ' + h);
    return { sx: parseFloat(m[1]), sy: parseFloat(m[2]) };
  };
  const glowOp = (h) => {
    const m = h.match(/opacity:([\d.]+)/);
    assert.ok(m, 'glow line opacity present, got: ' + h);
    return parseFloat(m[1]);
  };
  // off: content before at, gone after the window
  assert.equal(M.tvOff(9, o), '<b>X</b>');
  assert.equal(M.tvOff(40, o), '');
  assert.equal(M.tvOff(10, { html: '' }), '');
  // phase 1 (vertical collapse), linear: t=0.5, p1=0.5/0.6, sy = 1 - p1*(1 - 2/720), sx still 1
  const mid = scales(M.tvOff(25, { ...o, fn: 'linear' }));
  assert.ok(Math.abs(mid.sy - (1 - (0.5 / 0.6) * (1 - 2 / 720))) < 0.001, 'mid-collapse scaleY follows the linear phase');
  assert.equal(mid.sx, 1, 'no horizontal pinch before the split');
  // at the split the picture is exactly the line tall, glow fully on
  const line = scales(M.tvOff(28, { ...o, fn: 'linear' }));
  assert.ok(Math.abs(line.sy - 2 / 720) < 0.001, 'at the split the picture is the line tall');
  assert.ok(Math.abs(glowOp(M.tvOff(28, { ...o, fn: 'linear' })) - 1) < 0.001, 'glow fully on at the line');
  // phase 2 (horizontal pinch), linear: t=0.8, p2=0.5 -> sx 0.5, sy stays the line
  const pinch = scales(M.tvOff(34, { ...o, fn: 'linear' }));
  assert.ok(Math.abs(pinch.sx - 0.5) < 0.001, 'mid-pinch scaleX is half');
  assert.ok(Math.abs(pinch.sy - 2 / 720) < 0.001, 'pinch keeps the line height');
  // late pinch: the dot winks out — glow fades in the last quarter
  assert.ok(Math.abs(glowOp(M.tvOff(38, { ...o, fn: 'linear' })) - (1 - (0.8333 - 0.75) / 0.25)) < 0.01, 'glow fades as the dot pinches out');
  // custom fn respected: cubicIn(5/6)^3 on the collapse
  const eased = scales(M.tvOff(25, o));
  assert.ok(Math.abs(eased.sy - (1 - Math.pow(0.5 / 0.6, 3) * (1 - 2 / 720))) < 0.001, 'default cubicIn ease on the collapse');
  // custom origin: collapse line and pinch point move together
  const corner = M.tvOff(25, { ...o, fn: 'linear', x: 0, y: 0 });
  assert.ok(corner.includes('transform-origin:0.0px 0.0px'), 'custom origin anchors the squash');
  assert.ok(corner.includes('top:-1.0px'), 'glow line sits on the collapse line');
  // custom line height: a 6 px line at the split
  const thick = scales(M.tvOff(28, { ...o, fn: 'linear', line: 6 }));
  assert.ok(Math.abs(thick.sy - 6 / 720) < 0.001, 'line option sets the collapsed height');
  // on: nothing before at, content after; dot widens first, then the line grows tall
  assert.equal(M.tvOff(9, { ...o, mode: 'on' }), '');
  assert.equal(M.tvOff(40, { ...o, mode: 'on' }), '<b>X</b>');
  const widen = scales(M.tvOff(25, { ...o, mode: 'on', fn: 'linear' }));
  assert.ok(Math.abs(widen.sx - 0.5 / 0.6) < 0.001, 'on widens the dot to a line first');
  assert.ok(Math.abs(widen.sy - 2 / 720) < 0.001, 'on stays line-tall while widening');
  const grow = scales(M.tvOff(34, { ...o, mode: 'on', fn: 'linear' }));
  assert.equal(grow.sx, 1, 'on is full width once the line grows');
  assert.ok(Math.abs(grow.sy - (2 / 720 + (1 - 2 / 720) * 0.5)) < 0.001, 'on grows the line to half height mid-phase');
  assert.ok(Math.abs(glowOp(M.tvOff(25, { ...o, mode: 'on', fn: 'linear' })) - (1 - 0.5 * (0.5 / 0.6))) < 0.001, 'on glow dims as the dot widens');
  assert.equal(M.tvOff(25, o), M.tvOff(25, o)); // determinism
});

test('venetianBlinds: N equal slats wipe at the same moment — centre-out by default, down/up origins, feather softens the edge', () => {
  const o = { at: 10, dur: 30, html: '<b>X</b>' };
  const insets = (h) => [...h.matchAll(/clip-path:inset\(([\d.]+)px 0px ([\d.]+)px 0px\)/g)]
    .map((m) => ({ top: parseFloat(m[1]), bottom: parseFloat(m[2]) }));
  const tops = (h) => [...h.matchAll(/top:([\d.]+)px;width:[\d.]+px;height:([\d.]+)px;overflow:hidden/g)]
    .map((m) => ({ top: parseFloat(m[1]), h: parseFloat(m[2]) }));
  // in: nothing before at, content after the window; out mirrors it
  assert.equal(M.venetianBlinds(9, o), '');
  assert.equal(M.venetianBlinds(40, o), '<b>X</b>');
  assert.equal(M.venetianBlinds(9, { ...o, mode: 'out' }), '<b>X</b>');
  assert.equal(M.venetianBlinds(40, { ...o, mode: 'out' }), '');
  assert.equal(M.venetianBlinds(10, { html: '' }), '');
  // default 8 slats over the 720 stage: 90 px bands, all starting at once
  const mid = M.venetianBlinds(25, { ...o, fn: 'linear' });
  const slats = tops(mid);
  assert.equal(slats.length, 8, '8 slats by default');
  assert.deepEqual(slats.map((s) => s.top), [0, 90, 180, 270, 360, 450, 540, 630]);
  assert.ok(slats.every((s) => s.h === 90), 'equal 90 px bands');
  // centre-out, linear, t=0.5: each slat shows its middle 45 px (22.5–67.5)
  const ins = insets(mid);
  assert.equal(ins.length, 8, 'one clip per slat');
  assert.ok(ins.every((s) => Math.abs(s.top - 22.5) < 0.01 && Math.abs(s.bottom - 22.5) < 0.01),
    'centre-out insets are symmetric at mid-wipe, got: ' + JSON.stringify(ins[0]));
  // down: the wipe grows from the top edge (top inset 0, bottom 45 at p=0.5)
  const down = insets(M.venetianBlinds(25, { ...o, fn: 'linear', dir: 'down' }));
  assert.ok(down.every((s) => s.top === 0 && Math.abs(s.bottom - 45) < 0.01), 'down wipes from the top edge');
  // up: the wipe grows from the bottom edge
  const up = insets(M.venetianBlinds(25, { ...o, fn: 'linear', dir: 'up' }));
  assert.ok(up.every((s) => Math.abs(s.top - 45) < 0.01 && s.bottom === 0), 'up wipes from the bottom edge');
  // every slat shows the same moment: all insets identical (simultaneous, not staggered)
  assert.ok(new Set(ins.map((s) => s.top + '/' + s.bottom)).size === 1, 'all slats wipe together');
  // custom slat count + region: 4 slats over a 200 px band at (100, 50)
  const band = M.venetianBlinds(25, { ...o, fn: 'linear', slats: 4, x: 100, y: 50, w: 400, h: 200 });
  const bt = tops(band);
  assert.equal(bt.length, 4, 'slats option sets the count');
  assert.deepEqual(bt.map((s) => s.top), [50, 100, 150, 200]);
  assert.ok(bt.every((s) => s.h === 50), 'region height splits evenly');
  assert.ok(band.includes('left:100.0px'), 'slats sit at the region x');
  assert.ok(band.includes('left:-100.0px;top:-50.0px'), 'first inner crop offsets back to stage origin');
  assert.ok(band.includes('top:-100.0px'), 'second inner crop offsets to its band');
  // out: at mid-window the visible fraction is the same 0.5 (1 - p)
  const outMid = insets(M.venetianBlinds(25, { ...o, fn: 'linear', mode: 'out' }));
  assert.ok(outMid.every((s) => Math.abs(s.top - 22.5) < 0.01), 'out closes symmetrically from the same centre');
  assert.equal(M.venetianBlinds(10, { ...o, mode: 'out' }), '<b>X</b>', 'out starts fully visible');
  // feather: mask gradient instead of a hard clip-path, edge stops ordered
  const f = M.venetianBlinds(25, { ...o, fn: 'linear', feather: 12 });
  assert.ok(!f.includes('clip-path'), 'feather drops the hard clip');
  assert.ok(f.includes('mask-image:linear-gradient(to bottom,transparent 0px,transparent 22.5px,#000 34.5px,#000 55.5px,transparent 67.5px'),
    'feather gradient spans the visible band, got: ' + f.slice(0, 400));
  // default ease is cubicOut on the open: p = 1-(1-0.5)^3 = 0.875, centre band 90*0.875 wide
  const eased = insets(M.venetianBlinds(25, o));
  assert.ok(Math.abs(eased[0].top - parseFloat((45 - 0.875 * 45).toFixed(1))) < 0.01, 'default cubicOut ease on the open');
  assert.equal(M.venetianBlinds(25, o), M.venetianBlinds(25, o)); // determinism
});

test('shatter: tiles fling outward from the force centre with rotation under gravity and fade; negative strength implodes; bricks/triangle patterns', () => {
  const o = { at: 10, dur: 40, html: '<b>X</b>' };
  const tiles = (h) => [...h.matchAll(/transform:translate\((-?[\d.]+)px,(-?[\d.]+)px\) rotate\((-?[\d.]+)deg\);opacity:([\d.]+)/g)]
    .map((m) => ({ dx: parseFloat(m[1]), dy: parseFloat(m[2]), rot: parseFloat(m[3]), op: parseFloat(m[4]) }));
  // before at the html passes through; after the window it is gone; empty html is empty
  assert.equal(M.shatter(9, o), '<b>X</b>');
  assert.equal(M.shatter(50, o), '');
  assert.equal(M.shatter(10, { html: '' }), '');
  // default 12x8 grid: 96 tiles; at the launch frame every tile sits in place, opaque
  const start = tiles(M.shatter(10, o));
  assert.equal(start.length, 96, '12x8 = 96 tiles by default');
  assert.ok(start.every((t) => t.dx === 0 && t.dy === 0 && t.rot === 0 && t.op === 1), 'all tiles at rest at frame at');
  // mid-window: tiles have flown (non-zero offsets), some already fading; the
  // flight grows between two frames — aggregate displacement must increase
  const mag = (ts) => ts.reduce((s, t) => s + Math.abs(t.dx) + Math.abs(t.dy), 0);
  const mid = tiles(M.shatter(30, o));
  const late = tiles(M.shatter(45, o));
  assert.ok(mag(mid) > 0, 'tiles have left their rest positions mid-window');
  assert.ok(mag(late) > mag(mid), 'the flight keeps growing toward the end of the window');
  assert.ok(late.some((t) => t.op < 1), 'tiles fade late in the window');
  assert.ok(late.every((t) => t.op >= 0 && t.op <= 1), 'opacity stays in range');
  // gravity: with the force centre at the region centre, outward dy cancels
  // in the mean, so a positive mean dy is the gravity fall
  const meanDy = (ts) => ts.reduce((s, t) => s + t.dy, 0) / ts.length;
  assert.ok(meanDy(late) > 0, 'gravity pulls the mean tile downward, got: ' + meanDy(late).toFixed(1));
  assert.ok(meanDy(late) > meanDy(mid), 'the gravity fall accelerates (t^2), not linear');
  // rotation: tiles spin on their own hash angles
  assert.ok(mid.some((t) => Math.abs(t.rot) > 1), 'tiles rotate as they fly');
  // a corner tile (top-left, idx 0) flies away from the centre: dx,dy both negative
  assert.ok(mid[0].dx < 0 && mid[0].dy < 0, 'corner tile flees the centre, got: ' + JSON.stringify(mid[0]));
  // negative strength implodes: the same corner tile moves toward the centre
  const impl = tiles(M.shatter(30, { ...o, strength: -260 }));
  assert.ok(impl[0].dx > 0 && impl[0].dy > 0, 'implosion pulls the corner tile toward the centre');
  assert.ok(Math.abs(impl[0].dx) > 0, 'implosion moves tiles, not a no-op');
  // force centre: exploding from the top-left corner throws every tile
  // down-right (all dx,dy positive) instead of radially outward
  const corner = tiles(M.shatter(30, { ...o, fx: 0, fy: 0 }));
  assert.ok(corner.every((t) => t.dx >= 0), 'corner force throws every tile right');
  assert.ok(corner.every((t) => t.dy >= -0.01), 'corner force throws every tile down (gravity only adds)');
  // bricks: odd rows carry one extra tile each — 4 odd rows in 8 = 100 tiles
  assert.equal(tiles(M.shatter(30, { ...o, pattern: 'bricks' })).length, 100, 'bricks adds one tile per odd row');
  // triangle: two flying triangles per cell — 192 tiles, each clip-pathed
  const tri = M.shatter(30, { ...o, pattern: 'triangle' });
  assert.equal(tiles(tri).length, 192, 'triangle splits every cell in two');
  assert.ok(tri.includes('clip-path:polygon(0 0,100% 0,0 100%)'), 'first triangle clips upper-left');
  assert.ok(tri.includes('clip-path:polygon(100% 0,100% 100%,0 100%)'), 'second triangle clips lower-right');
  // custom grid + region: 4x2 tiles over a 400x200 band at (100, 50)
  const band = M.shatter(30, { ...o, cols: 4, rows: 2, x: 100, y: 50, w: 400, h: 200 });
  assert.equal(tiles(band).length, 8, 'cols/rows set the tile count');
  assert.ok(band.includes('left:100.0px;top:50.0px'), 'first tile sits at the region origin');
  assert.ok(band.includes('left:-100.0px;top:-50.0px'), 'first inner crop offsets back to stage origin');
  // linear ease: a tile launched at t=0.5 of its flight has eased 0.5 — check
  // the corner tile's flight distance grows linearly with e under fn linear
  // (gravity aside, the outward part is mag * e); determinism holds
  assert.equal(M.shatter(30, o), M.shatter(30, o)); // determinism
});

test('flicker: neon-sign flicker-on — hash stutter with decaying off-probability, then solid with glow; sustain/pulse/blink modes', () => {
  const o = { at: 10, dur: 30, html: '<b>X</b>' };
  const op = (h) => { const m = /opacity:([\d.]+)/.exec(h); return m ? parseFloat(m[1]) : null; };
  assert.equal(M.flicker(10, { html: '' }), '');
  // before at the sign is dark (dim 0); after the window it is solid, glowing
  assert.equal(M.flicker(9, o), '');
  const settled = M.flicker(40, o);
  assert.equal(op(settled), 1, 'settled at full opacity');
  assert.ok(settled.includes('drop-shadow(0 0 10.0px #FF2E88)'), 'settled with the pink halo, got: ' + settled.slice(0, 200));
  assert.ok(settled.includes('drop-shadow(0 0 34.0px #FF2E88)'), 'settled with the wide halo layer');
  // the stutter: early window mostly off, late window mostly on (decaying off-probability)
  const onIn = (a, b) => { let n = 0; for (let f = a; f < b; f++) if (M.flicker(f, o) !== '') n++; return n; };
  const early = onIn(10, 20), late = onIn(30, 40);
  assert.ok(early < late, 'off-probability decays: early on-frames ' + early + ' < late ' + late);
  assert.ok(early > 0, 'some early frames do flash on');
  // an on-frame inside the stutter wobbles below 1 (the SMOOTH register)
  assert.ok(Math.abs(op(M.flicker(20, o)) - 0.877) < 0.001, 'stutter on-frame wobbles, got: ' + op(M.flicker(20, o)));
  // dim: the off-state leaves a faint tube with no glow
  const ghost = M.flicker(9, { ...o, dim: 0.15 });
  assert.ok(ghost.includes('opacity:0.150'), 'dim ghost before at, got: ' + ghost.slice(0, 120));
  assert.ok(!ghost.includes('drop-shadow'), 'a dead sign casts no glow');
  // sustain: still flickering long after dur — both states occur in a 60-frame span
  let onN = 0, offN = 0;
  for (let f = 10; f < 70; f++) (M.flicker(f, { ...o, mode: 'sustain' }) === '' ? offN++ : onN++);
  assert.ok(onN > 10 && offN > 10, 'broken neon keeps misfiring: on ' + onN + ' off ' + offN);
  // pulse: |sin| envelope, period `rate` — frame f and f+rate identical, brightest at the half-period
  const p = (f) => op(M.flicker(f, { html: '<b>X</b>', mode: 'pulse', rate: 60 }));
  assert.equal(p(0), p(60), 'pulse period is exact');
  assert.ok(p(0) === 0.25 && Math.abs(p(15) - 0.78) < 0.01 && p(30) === 1, 'pulse brightens toward the half-period, got: ' + [p(0), p(15), p(30)].join('/'));
  // blink: square wave, 6 on / 6 off at rate 12 (seed 0 for a clean phase)
  const b = (f) => M.flicker(f, { html: '<b>X</b>', mode: 'blink', rate: 12, seed: 0 });
  assert.ok(b(0) !== '' && b(5) !== '', 'blink on in the first half');
  assert.equal(b(6), '', 'blink off in the second half');
  assert.equal(b(11), '', 'blink stays off to the end of the half');
  assert.equal(b(12), b(0), 'blink period is exact');
  // glow colour + amount scale the halo; amount 0 removes it
  assert.ok(M.flicker(40, { ...o, glow: '#00FFCC' }).includes('#00FFCC'), 'glow colour is honoured');
  assert.ok(!M.flicker(40, { ...o, amount: 0 }).includes('drop-shadow'), 'amount 0 kills the halo');
  assert.equal(M.flicker(25, o), M.flicker(25, o)); // determinism
});

test('echo: AE Echo-style ghost stack — N copies at fixed offsets along an angle, opacity decaying per copy; in stretches out, out collapses, sustain stands', () => {
  const o = { at: 10, dur: 30, html: '<b>X</b>', echoes: 3, step: 10, angle: 0, decay: 0.5 };
  const count = (h, s) => (h.match(new RegExp(s, 'g')) || []).length;
  assert.equal(M.echo(10, { html: '' }), '');
  // before at the html passes through untouched — no ghost divs at all
  assert.equal(M.echo(10, o), '<b>X</b>');
  assert.equal(M.echo(0, o), '<b>X</b>');
  // settled (frame 40, past the window): 3 ghosts + the original on top
  const settled = M.echo(40, o);
  assert.equal(count(settled, 'translate\\('), 3, 'three echo copies, got: ' + settled.slice(0, 300));
  assert.ok(settled.includes('translate(30.00px,0.00px);opacity:0.125'), 'farthest echo at 3*step, decay^3, got: ' + settled.slice(0, 300));
  assert.ok(settled.includes('translate(20.00px,0.00px);opacity:0.250'), 'middle echo at 2*step, decay^2');
  assert.ok(settled.includes('translate(10.00px,0.00px);opacity:0.500'), 'nearest echo at 1*step, decay^1');
  assert.equal(M.echo(41, o), settled, 'settled exactly at at + dur');
  // mid-window the train is stretched by the cubicOut ease: frame 25 is
  // p=0.5 -> ease 0.875, so the farthest echo sits at 3*10*0.875 = 26.25px
  assert.ok(M.echo(25, o).includes('translate(26.25px,0.00px)'), 'mid-window train stretched by the ease, got: ' + M.echo(25, o).slice(0, 200));
  // angle 90 trails downward: +y, no x
  const down = M.echo(40, { ...o, angle: 90 });
  assert.ok(down.includes('translate(0.00px,30.00px);opacity:0.125'), 'angle 90 is straight down, got: ' + down.slice(0, 200));
  // out: full train before at, collapsed (clean html) after the window
  assert.equal(M.echo(9, { ...o, mode: 'out' }), settled, 'out starts with the full train');
  assert.equal(M.echo(40, { ...o, mode: 'out' }), '<b>X</b>', 'out ends clean');
  assert.ok(M.echo(25, { ...o, mode: 'out' }).includes('translate(3.75px,0.00px)'), 'out mid-window collapsed to 1-0.875 of the train');
  // sustain: full train at every frame, at/dur ignored
  assert.equal(M.echo(0, { ...o, mode: 'sustain' }), settled, 'sustain ignores at');
  assert.equal(M.echo(100, { ...o, mode: 'sustain' }), settled, 'sustain never settles away');
  // echoes 0 is a no-op passthrough
  assert.equal(M.echo(40, { ...o, echoes: 0 }), '<b>X</b>');
  assert.equal(M.echo(25, o), M.echo(25, o)); // determinism
});

test('textWarp: field-warped kinetic type — arch bends the line and rotates letters to the tangent, ripple mirrors from the centre', () => {
  const spans = (h) => [...h.matchAll(/translate\((-?[\d.]+)px,(-?[\d.]+)px\) rotate\((-?[\d.]+)deg\)/g)]
    .map((m) => ({ x: parseFloat(m[1]), y: parseFloat(m[2]), a: parseFloat(m[3]) }));
  assert.equal(M.textWarp(0, { text: '' }), '', 'empty text returns nothing');
  // arch, frame 0, speed 0: size 100 -> adv 62, W 248, x0 516; u = 0.125/0.375/0.625/0.875
  const o = { text: 'WARP', x: 640, y: 360, size: 100, amp: 40, speed: 0 };
  const arch = spans(M.textWarp(0, o));
  assert.equal(arch.length, 4, 'one span per letter');
  assert.ok(Math.abs(arch[0].y - 342.5) < 0.05 && Math.abs(arch[1].y - 322.5) < 0.05, 'arch peaks amp above the centre line');
  assert.ok(arch[1].y < arch[0].y && arch[2].y < arch[3].y, 'middle letters sit higher than the ends');
  assert.ok(Math.abs(arch[0].a - -25.8) < 0.2 && Math.abs(arch[1].a - -9.2) < 0.2, 'left letters tilt up to the right');
  assert.ok(Math.abs(arch[2].a - 9.2) < 0.2 && Math.abs(arch[3].a - 25.8) < 0.2, 'right letters tilt down to the right');
  assert.equal(M.textWarp(0, o), M.textWarp(0, { ...o, field: 'arch' }), 'arch is the default field');
  // negative amp hangs the arch into a valley
  const valley = spans(M.textWarp(0, { ...o, amp: -40 }));
  assert.ok(valley[1].y > valley[0].y, 'negative amp inverts the arch');
  // arch breathes on speed: frame 15 (sin pi/2) lifts the peak 15%, frame 60 is one full period
  const breathing = spans(M.textWarp(15, { ...o, speed: Math.PI / 30 }));
  assert.ok(Math.abs(breathing[1].y - (360 - 40 * 1.15 * 0.9375)) < 0.05, 'arch breathes to 1.15x amp at a quarter period');
  assert.equal(M.textWarp(0, { ...o, speed: Math.PI / 30 }), M.textWarp(60, { ...o, speed: Math.PI / 30 }), 'arch period is exact');
  // ripple: wl 6 -> wl*adv 372; r = 93/31/31/93 px from centre, mirrored pairs share y and opposite angles
  const r = spans(M.textWarp(0, { ...o, field: 'ripple', amp: 20 }));
  assert.equal(r[0].y, r[3].y, 'ripple mirrors left/right y');
  assert.equal(r[1].y, r[2].y, 'inner pair mirrors too');
  assert.ok(Math.abs(r[0].y - 380) < 0.05 && Math.abs(r[1].y - 370) < 0.05, 'outer letters ride the crest, inner ones halfway down');
  assert.equal(r[0].a, 0, 'crest letters sit flat');
  assert.ok(Math.abs(r[1].a - -16.3) < 0.2 && Math.abs(r[2].a - 16.3) < 0.2, 'inner letters tilt toward the crest');
  assert.ok(Math.abs(r[0].a + r[3].a) < 0.05 && Math.abs(r[1].a + r[2].a) < 0.05, 'mirrored letters tilt opposite');
  assert.equal(M.textWarp(0, { ...o, field: 'ripple', speed: Math.PI / 30 }),
    M.textWarp(60, { ...o, field: 'ripple', speed: Math.PI / 30 }), 'ripple period is exact');
  assert.equal(M.textWarp(0, o), M.textWarp(0, o)); // determinism
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

test('sliceWave: passthrough outside the window, travelling packet inside, still strips at the edges', () => {
  const html = '<div>SCENE</div>';
  const o = { html, slices: 8, at: 10, dur: 80, amp: 36, waves: 2, width: 0.28 };
  assert.equal(M.sliceWave(5, o), html);
  assert.equal(M.sliceWave(100, o), html);
  const mid = M.sliceWave(50, o);
  assert.equal((mid.match(/clip-path:inset/g) || []).length, 8); // one clipped copy per slice
  assert.equal(M.sliceWave(50, o), mid); // frame-pure
  assert.notEqual(M.sliceWave(60, o), mid); // the front travels
  // the packet moves: the most-displaced strip index shifts between early and late frames
  const peakStrip = (s) => {
    const dxs = [...s.matchAll(/translateX\((-?[\d.]+)px\)/g)].map((m) => Math.abs(parseFloat(m[1])));
    return dxs.indexOf(Math.max(...dxs));
  };
  assert.ok(Math.max(...[...mid.matchAll(/translateX\((-?[\d.]+)px\)/g)].map((m) => Math.abs(parseFloat(m[1])))) > 5, 'some strip is actually displaced mid-wave');
  assert.notEqual(peakStrip(M.sliceWave(25, o)), peakStrip(M.sliceWave(75, o)), 'peak displacement travels down the scene');
  // dir:'up' mirrors the travel: early-frame peak sits low, late-frame peak sits high
  assert.ok(peakStrip(M.sliceWave(25, { ...o, dir: 'up' })) > peakStrip(M.sliceWave(75, { ...o, dir: 'up' })), 'up wave travels upward');
});

test('letterTrack: hidden at from-spacing before at, settled at to-spacing after, monotonic in between', () => {
  const o = { text: 'TRACK', at: 20, dur: 60, from: 30, to: 0 };
  const ls = (s) => parseFloat(/letter-spacing:(-?[\d.]+)px/.exec(s)[1]);
  const op = (s) => parseFloat(/opacity:([\d.]+)/.exec(s)[1]);
  const before = M.letterTrack(10, o);
  assert.equal(ls(before), 30); assert.equal(op(before), 0);
  assert.ok(before.includes('TRACK'));
  const after = M.letterTrack(90, o);
  assert.equal(ls(after), 0); assert.equal(op(after), 1);
  const m1 = M.letterTrack(35, o), m2 = M.letterTrack(55, o);
  assert.ok(ls(m1) > ls(m2) && ls(m2) > 0, 'spacing eases down toward resting value');
  assert.ok(op(m1) < op(m2) && op(m2) < 1, 'opacity rides the same ease');
  assert.equal(M.letterTrack(35, o), m1); // frame-pure
  // contract direction: tight negative spacing squeezes out to resting
  const c = { text: 'TIGHT', at: 0, dur: 40, from: -6, to: 2 };
  assert.equal(ls(M.letterTrack(0, c)), -6);
  assert.equal(ls(M.letterTrack(50, c)), 2);
  assert.ok(ls(M.letterTrack(20, c)) > -6 && ls(M.letterTrack(20, c)) < 2);
});

test('speedLines: empty outside the window, n streaks inside, frame-pure, cone aims', () => {
  const o = { x: 100, y: 80, at: 20, dur: 40, n: 12, seed: 3 };
  assert.equal(M.speedLines(10, o), '');
  assert.equal(M.speedLines(60, o), '');
  const mid = M.speedLines(30, o);
  const count = (mid.match(/border-radius/g) || []).length;
  assert.equal(count, 12);
  assert.equal(M.speedLines(30, o), mid); // frame-pure
  assert.ok(mid.includes('left:100px') && mid.includes('top:80px'));
  // narrow cone: every line angle stays within spread/2 of the base angle
  const cone = M.speedLines(30, { x: 0, y: 0, at: 20, dur: 40, n: 10, angle: 180, spread: 80, seed: 3 });
  const angs = [...cone.matchAll(/rotate\((-?[\d.]+)deg\)/g)].map((m) => parseFloat(m[1]));
  assert.equal(angs.length, 10);
  assert.ok(angs.every((a) => Math.abs(a - 180) <= 40), `cone angles out of range: ${angs}`);
  // fade: last frame inside the window is dimmer than mid-window
  const op = (s) => [...s.matchAll(/opacity:([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const midOps = op(M.speedLines(30, o)), lateOps = op(M.speedLines(59, o));
  assert.ok(Math.max(...lateOps) < Math.max(...midOps), 'lines fade over the last quarter');
  // n: 0 returns ''
  assert.equal(M.speedLines(30, { ...o, n: 0 }), '');
});

test('waveText: one span per character, sine phase staggers across letters, frame-pure, axis y bobs vertically', () => {
  const o = { text: 'WAVE', x: 640, y: 360, amp: 14, wl: 4, speed: 0.15 };
  const html = M.waveText(10, o);
  const dx = (s) => [...s.matchAll(/translateX\((-?[\d.]+)px\)/g)].map((m) => parseFloat(m[1]));
  const spans = (html.match(/display:inline-block/g) || []).length;
  assert.equal(spans, 4);
  const d0 = dx(M.waveText(10, o)), d1 = dx(M.waveText(11, o));
  assert.ok(d0.some((v, i) => v !== d0[(i + 1) % 4]), 'letters sit at different wave phases');
  assert.ok(d0.some((v, i) => v !== d1[i]), 'wave travels with the frame');
  assert.ok(d0.every((v) => Math.abs(v) <= 14), 'drift never exceeds amp');
  assert.equal(M.waveText(10, o), html); // frame-pure
  const yHtml = M.waveText(10, { ...o, axis: 'y' });
  assert.ok(/translateY\(/.test(yHtml) && !/translateX\(/.test(yHtml), 'axis y uses translateY only');
  assert.equal(M.waveText(10, { text: '' }), '');
  assert.ok(M.waveText(10, { text: 'A<B' }).includes('&lt;'), 'glyphs escaped');
});

test('varFont: one span per character, wght/wdth ride an inverted travelling sine, frame-pure', () => {
  const o = { text: 'FLEX', x: 640, y: 360, wght: [100, 900], wdth: [75, 125], wl: 4, speed: 0.12 };
  const html = M.varFont(10, o);
  const spans = (html.match(/display:inline-block/g) || []).length;
  assert.equal(spans, 4);
  const axes = (s) => [...s.matchAll(/font-variation-settings:'wght' (\d+), 'wdth' (\d+)/g)]
    .map((m) => [parseInt(m[1], 10), parseInt(m[2], 10)]);
  const a0 = axes(M.varFont(10, o)), a1 = axes(M.varFont(11, o));
  assert.equal(a0.length, 4);
  assert.ok(a0.every(([w, d]) => w >= 100 && w <= 900 && d >= 75 && d <= 125), 'axes stay inside their ranges');
  assert.ok(a0.some(([w], i) => w !== a0[(i + 1) % 4][0]), 'letters sit at different wave phases');
  assert.ok(a0.some(([w], i) => w !== a1[i][0]), 'wave travels with the frame');
  // width rides inverted: the heaviest letter is the narrowest
  const heaviest = a0.reduce((bi, [w], i) => (w > a0[bi][0] ? i : bi), 0);
  const narrowest = a0.reduce((bi, [, d], i) => (d < a0[bi][1] ? i : bi), 0);
  assert.equal(heaviest, narrowest, 'wght max pairs with wdth min');
  assert.equal(M.varFont(10, o), html); // frame-pure
  assert.ok(M.varFont(10, o).includes("font-family:Roboto Flex"), 'default family is the vendored Roboto Flex');
  assert.equal(M.varFont(10, { text: '' }), '');
  assert.ok(M.varFont(10, { text: 'A<B' }).includes('&lt;'), 'glyphs escaped');
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

test('springSheet: dock bar before at, spring overshoot past open height, staggered icons, dock again after close', () => {
  const o = { x: 100, bottom: 720, w: 400, h: 420, dockH: 64, at: 20, closeAt: 120,
    icons: [{ glyph: 'A', color: '#FFD93D' }, { glyph: 'B', color: '#57C7D4' }, { glyph: 'C', color: '#FF6B81' }] };
  const heightOf = (s) => parseFloat(/height:([\d.]+)px/.exec(s)[1]);
  const iconsOf = (s) => (s.match(/data-sheet-icon="/g) || []).length;
  // before at: exactly the dock bar, no icons
  assert.equal(heightOf(M.springSheet(10, o)), 64, 'dock only before at');
  assert.equal(iconsOf(M.springSheet(10, o)), 0, 'no icons before at');
  // frame-pure
  assert.equal(M.springSheet(40, o), M.springSheet(40, o), 'frame-pure');
  // open: spring overshoots the open height briefly, then settles on it
  let peak = 0;
  for (let f = 20; f <= 80; f++) peak = Math.max(peak, heightOf(M.springSheet(f, o)));
  assert.ok(peak > 420, `spring overshoots open height, peak=${peak}`);
  assert.ok(Math.abs(heightOf(M.springSheet(110, o)) - 420) < 1, 'settles at open height before close');
  // icons stagger in: at frame 26 the third icon (at + 8) has not started yet, so fewer than all three show
  assert.ok(iconsOf(M.springSheet(26, o)) < iconsOf(M.springSheet(70, o)), 'icons stagger in');
  assert.equal(iconsOf(M.springSheet(70, o)), 3, 'all icons in once open');
  // collapse: mid-collapse is between dock and open, settled collapse is exactly the dock again
  const mid = heightOf(M.springSheet(135, o));
  assert.ok(mid > 64 && mid < 420, `mid-collapse between dock and open, got ${mid}`);
  assert.equal(heightOf(M.springSheet(200, o)), 64, 'dock again after collapse settles');
  assert.equal(iconsOf(M.springSheet(200, o)), 0, 'icons gone after collapse');
  // anchor: the sheet's bottom edge never moves
  const topOf = (s) => parseFloat(/top:([\d.-]+)px/.exec(s)[1]);
  assert.ok(Math.abs((topOf(M.springSheet(40, o)) + heightOf(M.springSheet(40, o))) - 720) < 1.01, 'bottom edge anchored at 720');
});
