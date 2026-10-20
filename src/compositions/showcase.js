// Showcase: every scene is ONE primitive (or one pair), labeled with its call.
// 1280x720, 20s, 30fps. Light theme, flat vector — the house style.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 600 },

  render(frame, stage) {
    const M = window.Motion;
    const BG = '#FBF6EC', INK = '#33302B', SOFT = '#9A8F7D';
    const C = ['#FF8A4C', '#3FB6FF', '#4ED06A', '#FFD93D', '#C792EA', '#FF6B81'];
    const RANGES = [[0, 100], [100, 200], [200, 300], [300, 400], [400, 500], [500, 600]];
    const sc = M.scene(frame, RANGES), lf = sc.lf;
    const tr = M.transition(lf, sc.len);

    const head = (name, code) =>
      '<div style="position:absolute;top:44px;left:0;right:0;text-align:center;">' +
      '<span style="font:800 44px sans-serif;color:' + INK + ';">' + name + '</span></div>' +
      '<div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;">' +
      '<span style="font:600 26px monospace;color:' + SOFT + ';background:#fff;padding:12px 26px;border-radius:999px;' +
      'border:2px solid #EFE6D4;">' + code + '</span></div>';

    let body = '';

    if (sc.index === 0) { // pop
      const s = M.pop(lf, { at: 10, stiffness: 110, damping: 9 });
      body = M.dot({ x: 640, y: 360, r: 110, color: C[0], scale: Math.max(s, 0.001), candy: true }) + head('pop', 'M.pop(frame, { at: 10 })');
    }

    if (sc.index === 1) { // stagger
      let d = '';
      for (let i = 0; i < 6; i++) {
        const s = M.pop(lf, { at: M.stagger(i, { base: 8, each: 9 }), stiffness: 130, damping: 10 });
        d += M.dot({ x: 240 + i * 160, y: 360, r: 62, color: C[i], scale: Math.max(s, 0.001), candy: true });
      }
      body = d + head('stagger + pop', 'M.pop(frame, { at: M.stagger(i, { each: 9 }) })');
    }

    if (sc.index === 2) { // fly + trail
      const o = { at: 8, dur: 74, from: { x: 180, y: 480 }, to: { x: 1100, y: 480 }, arc: 300 };
      let d = '';
      for (const g of M.trail(lf, o)) d += M.dot({ x: g.x, y: g.y, r: 52, color: C[1], scale: g.scale, opacity: g.opacity });
      const p = M.fly(lf, o);
      d += M.dot({ x: p.x, y: p.y, r: 56, color: C[1], candy: true, glow: true });
      body = d + head('fly + trail', 'M.fly(frame, { from, to, arc: 300 })');
    }

    if (sc.index === 3) { // drop → squash + ripple
      const fall = M.ease(lf, { at: 6, dur: 42, fn: 'cubicIn' });
      const y = 140 + (500 - 140) * fall;
      let d = '';
      if (fall >= 1) {
        const sq = M.squash(lf - 48);
        d += M.ripple(lf, { x: 640, y: 540, at: 48, color: C[2] });
        d += '<div style="position:absolute;left:' + (640 - 62 * sq.sx) + 'px;top:' + (540 - 124 * sq.sy) +
          'px;width:' + (124 * sq.sx) + 'px;height:' + (124 * sq.sy) + 'px;border-radius:50%;' +
          'background:radial-gradient(circle at 32% 28%,#ffffffcc 0%,#ffffff22 32%,transparent 55%),' + C[2] + ';"></div>';
      } else {
        d += M.dot({ x: 640, y, r: 62, color: C[2], candy: true });
      }
      d += '<div style="position:absolute;left:340px;right:340px;top:536px;height:8px;border-radius:4px;background:#E5DCC8;"></div>';
      body = d + head('squash + ripple', 'M.squash(lf) · M.ripple(frame, { at: land })');
    }

    if (sc.index === 4) { // countUp
      const n = M.countUp(lf, { at: 6, dur: 70, from: 0, to: 100 });
      body = '<div style="position:absolute;top:250px;left:0;right:0;text-align:center;">' +
        '<span style="font:800 190px sans-serif;color:' + C[4] + ';">' + n + '</span></div>' +
        head('countUp', 'M.countUp(frame, { to: 100, dur: 70 })');
    }

    if (sc.index === 5) { // burst + badge
      let d = M.burst(lf, { x: 640, y: 350, at: 10, n: 16, dist: 260 });
      d += M.dot({ x: 640, y: 350, r: 66, color: C[3], scale: Math.max(M.pop(lf, { at: 4 }), 0.001), candy: true });
      d += M.badge(lf, { right: 300, top: 130, text: 'Done!', color: C[2], at: 26 });
      body = d + head('burst + badge', 'M.burst(frame, { at: 10 }) · M.badge(...)');
    }

    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + BG + ';opacity:' + tr.opacity.toFixed(3) +
      ';transform:scale(' + tr.scale.toFixed(4) + ');">' + body + '</div>';
  },
};
