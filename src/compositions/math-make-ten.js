// Teaching demo rebuilt with ONLY motion-primitives: the "make-ten" method
// (9 + 4) for first-graders. Compare with a hand-written version: no easing
// math, no spring constants, no arc interpolation anywhere below — just
// primitive composition. 720x1280, 15s, 30fps.
window.Composition = {
  meta: { width: 720, height: 1280, fps: 30, durationInFrames: 450 },

  render(frame, stage) {
    const M = window.Motion;
    const ORANGE = '#FF8A4C', BLUE = '#3FB6FF', GREEN = '#4ED06A', INK = '#4A3728', SOFT = '#A08B76';
    const A = 9, B = 4, rest = B - (10 - A);

    const cell = 104, pitch = 116, fx = 70, fy = 420;
    const cellC = (i) => ({ x: fx + (i % 5) * pitch + cell / 2, y: fy + Math.floor(i / 5) * pitch + cell / 2 });
    const gy = 850, R = 40;
    const gx = (i) => 360 + (i - (B - 1) / 2) * 140;

    const flyOpts = { at: 130, dur: 90, from: { x: gx(0), y: gy }, to: cellC(A), arc: 170 };
    const p = M.fly(frame, flyOpts);
    const landed = p.done;

    let g = '<div style="position:absolute;inset:0;background:linear-gradient(180deg,#FFF8EC,#FFEFD9);"></div>';
    g += '<div style="position:absolute;top:80px;left:0;right:0;text-align:center;font:800 64px sans-serif;color:' + INK + ';">9 + 4 · 凑十法</div>';

    // ten-frame + A dots pop in, staggered
    for (let i = 0; i < 10; i++) {
      const c = cellC(i);
      const cs = M.pop(frame, { at: M.stagger(i, { each: 3 }), stiffness: 130, damping: 12 });
      g += '<div style="position:absolute;left:' + (c.x - cell / 2) + 'px;top:' + (c.y - cell / 2) + 'px;width:' + cell +
        'px;height:' + cell + 'px;border-radius:26px;background:#fff;border:3px solid #FFE3C2;transform:scale(' + Math.max(cs, 0.001).toFixed(3) + ');"></div>';
    }
    for (let i = 0; i < A; i++) {
      const c = cellC(i);
      const s = M.pop(frame, { at: M.stagger(i, { base: 14, each: 5 }), stiffness: 140, damping: 10 });
      g += M.dot({ x: c.x, y: c.y, r: R, color: ORANGE, scale: Math.max(s, 0.001), candy: true });
    }
    // the empty slot breathes until the flyer lands, then: squash + ripple + badge
    const ec = cellC(A);
    if (!landed) g += M.targetSlot(frame, { x: ec.x, y: ec.y, r: R, color: BLUE });
    else {
      const sq = M.squash(frame - 220);
      g += M.dot({ x: ec.x, y: ec.y, r: R, color: ORANGE, candy: true, extra: 'transform:scale(' + sq.sx.toFixed(3) + ',' + sq.sy.toFixed(3) + ');' });
      g += M.ripple(frame, { x: ec.x, y: ec.y, at: 220, color: ORANGE });
      g += M.badge(frame, { right: 40, top: 320, text: '⭐ 凑成 10!', color: GREEN, at: 226 });
    }
    // B dots; the first one flies away
    for (let i = landed ? 1 : 0; i < B; i++) {
      if (i === 0 && frame >= flyOpts.at) continue;
      const s = M.pop(frame, { at: M.stagger(i, { base: 40, each: 5 }), stiffness: 140, damping: 10 });
      g += M.dot({ x: gx(i), y: gy, r: R, color: BLUE, scale: Math.max(s, 0.001), candy: true });
    }
    if (!landed && frame >= flyOpts.at) {
      for (const t of M.trail(frame, flyOpts)) g += M.dot({ x: t.x, y: t.y, r: R, color: BLUE, scale: t.scale, opacity: t.opacity });
      g += M.dot({ x: p.x, y: p.y, r: R * 1.08, color: BLUE, candy: true, glow: true });
    }
    // equation: count-up to the answer after landing
    if (landed) {
      const n = M.countUp(frame, { at: 240, dur: 40, from: 10, to: 10 + rest });
      g += '<div style="position:absolute;left:0;right:0;top:1010px;text-align:center;font:800 66px sans-serif;color:' + INK + ';">' +
        '10 + ' + rest + ' = <span style="color:' + GREEN + ';">' + n + '</span></div>';
      g += M.burst(frame, { x: 360, y: 700, at: 268, n: 12, dist: 210 });
    } else {
      g += '<div style="position:absolute;left:0;right:0;top:1010px;text-align:center;font:600 34px sans-serif;color:' + SOFT + ';">把 1 个送过去，凑成 10</div>';
    }

    stage.innerHTML = g;
  },
};
