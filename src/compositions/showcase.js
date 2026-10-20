// Showcase v2 — house style (see STYLE.md): flat vector, one solid background
// per scene, round-faced balls, EN title + CN translation, code pill at the
// bottom, hard cuts, silent. Every scene is still ONE primitive (or one pair).
// 1280x720, 20s, 30fps.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 600 },

  render(frame, stage) {
    const M = window.Motion;
    const CREAM = '#FBF6EC', BLUE = '#2F6DB3', DARK = '#26221F';
    const C = ['#FF8A4C', '#3FB6FF', '#4ED06A', '#FFD93D', '#C792EA', '#FF6B81'];
    const RANGES = [[0, 100], [100, 200], [200, 300], [300, 400], [400, 500], [500, 600]];
    const sc = M.scene(frame, RANGES), lf = sc.lf;

    // round face overlay for a ball at (x, y) radius r; blinks every ~96 frames
    const face = (x, y, r, phase, dark) => {
      const blink = ((frame + (phase || 0)) % 96) < 5;
      const ink = dark ? '#26221F' : '#33302B';
      const ey = y - r * 0.14, ex = r * 0.36, er = Math.max(r * 0.10, 3);
      const eyes = blink
        ? '<div style="position:absolute;left:' + (x - ex - er) + 'px;top:' + ey + 'px;width:' + (er * 2) + 'px;height:3px;border-radius:2px;background:' + ink + ';"></div>' +
          '<div style="position:absolute;left:' + (x + ex - er) + 'px;top:' + ey + 'px;width:' + (er * 2) + 'px;height:3px;border-radius:2px;background:' + ink + ';"></div>'
        : M.dot({ x: x - ex, y: ey, r: er, color: ink }) + M.dot({ x: x + ex, y: ey, r: er, color: ink });
      const mw = r * 0.72;
      const mouth = '<div style="position:absolute;left:' + (x - mw / 2) + 'px;top:' + (y + r * 0.08) + 'px;width:' + mw +
        'px;height:' + (mw / 2) + 'px;border:' + Math.max(r * 0.07, 3) + 'px solid ' + ink + ';border-color:transparent transparent ' +
        ink + ' transparent;border-radius:50%;"></div>';
      return eyes + mouth;
    };
    const ball = (x, y, r, color, scale, phase, extra) => {
      const rr = r * (scale == null ? 1 : scale);
      if (rr < 2) return '';
      return M.dot({ x, y, r, color, scale: scale == null ? 1 : scale, extra: extra || '' }) + (rr > 16 ? face(x, y, rr, phase) : '');
    };
    const title = (en, cn, light) =>
      '<div style="position:absolute;top:42px;left:0;right:0;text-align:center;">' +
      '<div style="font:800 47px sans-serif;color:' + (light ? '#FFF7E8' : '#33302B') + ';">' + en + '.</div>' +
      '<div style="font:600 23px sans-serif;color:' + (light ? '#D8E6F5' : '#9A8F7D') + ';margin-top:2px;">' + cn + '</div></div>';
    const pill = (code) =>
      '<div style="position:absolute;bottom:38px;left:0;right:0;text-align:center;">' +
      '<span style="font:600 24px monospace;color:#F3E9D2;background:#2E2A24;padding:12px 26px;border-radius:999px;">' + code + '</span></div>';
    const rays = 'repeating-conic-gradient(from 0deg at 50% 46%, #FFD93D 0deg 14deg, #F5C93F 14deg 28deg)';

    let bg = CREAM, body = '';

    if (sc.index === 0) { // Pop — cream
      const s = M.pop(lf, { at: 10, stiffness: 110, damping: 9 });
      body = ball(640, 372, 112, C[0], Math.max(s, 0.001), 0) + title('Pop', '弹簧弹出') + pill('M.pop(frame, { at: 10 })');
    }

    if (sc.index === 1) { // Stagger — cream, a row of faces (the "appeal" shot)
      let d = '';
      for (let i = 0; i < 6; i++) {
        const s = M.pop(lf, { at: M.stagger(i, { base: 8, each: 9 }), stiffness: 130, damping: 10 });
        d += ball(240 + i * 160, 372, 62, C[i], Math.max(s, 0.001), i * 17);
      }
      body = d + title('Stagger', '错峰入场') + pill('M.pop(frame, { at: M.stagger(i, { each: 9 }) })');
    }

    if (sc.index === 2) { // Fly — blue
      bg = BLUE;
      const o = { at: 8, dur: 74, from: { x: 180, y: 470 }, to: { x: 1100, y: 470 }, arc: 300 };
      let d = '';
      for (const g of M.trail(lf, o)) d += M.dot({ x: g.x, y: g.y, r: 52, color: '#FFFFFF', scale: g.scale, opacity: g.opacity * 0.8 });
      const p = M.fly(lf, o);
      d += ball(p.x, p.y, 58, C[0], 1, 31);
      body = d + title('Fly', '弧线飞行', true) + pill('M.fly(frame, { from, to, arc: 300 })');
    }

    if (sc.index === 3) { // Squash — dark
      bg = DARK;
      const fall = M.ease(lf, { at: 6, dur: 42, fn: 'cubicIn' });
      const y = 150 + (492 - 150) * fall;
      let d = '<div style="position:absolute;left:340px;right:340px;top:528px;height:8px;border-radius:4px;background:#4A4238;"></div>';
      if (fall >= 1) {
        const sq = M.squash(lf - 48);
        d += M.ripple(lf, { x: 640, y: 532, at: 48, color: C[2] });
        d += '<div style="position:absolute;left:' + (640 - 62 * sq.sx) + 'px;top:' + (532 - 124 * sq.sy) +
          'px;width:' + (124 * sq.sx) + 'px;height:' + (124 * sq.sy) + 'px;border-radius:50%;background:' + C[2] + ';"></div>';
        d += face(640, 532 - 62 * sq.sy, 62, 7);
      } else {
        d += ball(640, y, 62, C[2], 1, 7);
      }
      body = d + title('Squash', '压扁回弹', true) + pill('M.squash(lf) · M.ripple(frame, { at: land })');
    }

    if (sc.index === 4) { // Count Up — cream
      const n = M.countUp(lf, { at: 6, dur: 70, from: 0, to: 100 });
      const hop = n >= 100 ? Math.abs(Math.sin(lf * 0.3)) * 16 : 0;
      body = '<div style="position:absolute;top:238px;left:0;right:0;text-align:center;">' +
        '<span style="font:800 190px sans-serif;color:' + C[4] + ';">' + n + '</span></div>' +
        ball(1052, 560 - hop, 52, C[1], 1, 53) +
        title('Count Up', '数字滚动') + pill('M.countUp(frame, { to: 100, dur: 70 })');
    }

    if (sc.index === 5) { // Burst — yellow rays
      bg = rays;
      let d = M.burst(lf, { x: 640, y: 360, at: 10, n: 16, dist: 260 });
      const s = M.pop(lf, { at: 4, stiffness: 120, damping: 10 });
      d += ball(640, 360, 68, C[0], Math.max(s, 0.001), 71);
      d += M.badge(lf, { right: 268, top: 128, text: 'Done!', color: C[2], at: 26 });
      body = d + title('Burst', '粒子庆祝') + pill('M.burst(frame, { at: 10 }) · M.badge(...)');
    }

    stage.innerHTML = '<div style="position:absolute;inset:0;background:' + bg + ';">' + body + '</div>';
  },
};
