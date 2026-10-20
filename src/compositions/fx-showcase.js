// fx-showcase — the "advanced" reel: complex effects composed from the
// v0.3 primitives (meshBg / camera / scramble / drawOn / bars / beat /
// drop / travel / shake / punch / flash / kenBurns / fx).
// Dark premium style — deliberately NOT the flat house style of STYLE.md,
// which is reserved for teaching videos. 1280x720, 30fps, 540 frames.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 540 },
  render(frame, stage) {
    const M = window.Motion;
    const CAM = [
      { f: 0, x: 640, y: 360, z: 1 }, { f: 110, x: 640, y: 360, z: 1 },
      { f: 175, x: 830, y: 320, z: 1.5 }, { f: 235, x: 830, y: 320, z: 1.5 },
      { f: 290, x: 640, y: 360, z: 1 }, { f: 540, x: 640, y: 360, z: 1 },
    ];
    let world = '';

    /* Act 1 (0-119): scramble title + typewriter sub + beat entrance */
    if (frame < 120) {
      const title = M.scramble(frame, { at: 8, text: 'ADVANCED MOTION', cpf: 2 });
      world += '<div style="position:absolute;left:0;top:218px;width:1280px;text-align:center;' +
        'font:800 86px ui-monospace,Menlo,monospace;color:#F5EFE2;letter-spacing:2px;">' + title + '</div>';
      const sub = M.typewriter(frame, { at: 44, cpf: 2, text: 'frame-pure primitives, composed by AI', caret: frame < 112 });
      world += '<div style="position:absolute;left:0;top:336px;width:1280px;text-align:center;' +
        'font:600 30px ui-monospace,Menlo,monospace;color:#B9B2CC;">' + sub + '</div>';
      const b = M.beat(frame, { at: 18, dist: 120 });
      const idle = frame > 60 ? M.breathe(frame, { amp: 0.03, speed: 0.07 }) : 1;
      world += M.dot({ x: 640 + b.x, y: 500, r: 36, color: '#FF8A4C', scale: Math.max(b.s * idle, 0.001), candy: true, glow: true });
      world += M.targetSlot(frame, { x: 640 + b.x, y: 500, r: 56, color: '#FF8A4C' });
    }

    /* Act 2 (120-249): self-drawing chart + growing bars, camera push, punch */
    if (frame >= 120 && frame < 250) {
      const lf = frame - 120;
      world += '<div style="position:absolute;left:0;top:84px;width:1280px;text-align:center;' +
        'font:800 44px sans-serif;color:#F5EFE2;">Data, drawn by code.</div>';
      // bars (left)
      world += M.bars(frame, {
        at: 128, data: [{ k: 'Mon', v: 42 }, { k: 'Tue', v: 68 }, { k: 'Wed', v: 55 }, { k: 'Thu', v: 92 }],
        x: 170, y: 560, h: 270, bw: 74, gap: 44, stagger: 6, dur: 20, color: '#4CC9F0', label: '#EDE8DA',
      });
      // self-drawing line (right)
      const pts = [[700, 540], [830, 450], [950, 486], [1075, 330], [1180, 250]];
      const pl = M.poly(pts);
      world += '<svg style="position:absolute;left:0;top:0;" width="1280" height="720">' +
        '<polyline points="' + pl.attr + '" fill="none" stroke="#FFD93D" stroke-width="7" ' +
        'stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="' +
        M.drawOn(frame, { at: 134, dur: 66, len: pl.len }) + '"/></svg>';
      pts.forEach((p, i) => {
        const v = M.pop(frame, { at: 140 + i * 15, stiffness: 150, damping: 12 });
        if (v > 0.01) world += M.dot({ x: p[0], y: p[1], r: 13, color: '#FFD93D', scale: v, candy: true });
      });
      const n = M.countUp(frame, { at: 134, dur: 66, from: 0, to: 92 });
      world += '<div style="position:absolute;left:960px;top:120px;width:240px;text-align:center;' +
        'font:800 92px sans-serif;color:#FFD93D;">' + n + '<span style="font-size:44px;">%</span></div>';
    }

    /* Act 3 (250-379): travel lanes + a drop that lands with impact */
    if (frame >= 250 && frame < 380) {
      const lf = frame - 250;
      const sh = M.shake(frame, { at: 318, amp: 13, dur: 15, seed: 4 });
      let g = '';
      g += '<div style="position:absolute;left:0;top:84px;width:1280px;text-align:center;' +
        'font:800 44px sans-serif;color:#F5EFE2;">Physics, without a physics engine.</div>';
      const cols = ['#FF8A4C', '#3ED97E', '#4CC9F0'];
      cols.forEach((c, i) => {
        const y = 250 + i * 90;
        const tr = M.travel(frame, { at: 258 + i * 9, from: { x: 240, y }, to: { x: 1010, y }, dur: 26 });
        M.trail(frame, { at: 258 + i * 9, dur: 26, from: { x: 240, y }, to: { x: 1010, y }, ghosts: 5, arc: 0 })
          .forEach((gh) => {
            g += '<div style="position:absolute;left:' + (gh.x - 15) + 'px;top:' + (gh.y - 15) +
              'px;width:30px;height:30px;border-radius:50%;background:#FFFFFF;opacity:' +
              (gh.opacity * 0.5).toFixed(3) + ';transform:scale(' + gh.scale.toFixed(3) + ');"></div>';
          });
        g += M.dot({ x: tr.x, y: tr.y, r: 24, color: c, candy: true, glow: true });
        g += M.targetSlot(frame, { x: 1010, y, r: 34, color: c });
      });
      // the drop: falls at 306, lands at 317, squash + ripple; shake is on the group
      const dy = M.drop(frame, { at: 306, from: 330, dur: 11 });
      const sq = M.squash(frame - 317);
      g += M.dot({ x: 640, y: 592 + dy, r: 34, color: '#FFD93D', sx: sq.sx, sy: sq.sy, candy: true, glow: true });
      g += M.ripple(frame, { x: 640, y: 624, at: 317, color: '#FFD93D' });
      g += '<div style="position:absolute;left:240px;top:624px;width:800px;height:5px;border-radius:3px;background:#FFFFFF33;"></div>';
      world += '<div style="position:absolute;inset:0;transform:translate(' + sh.x.toFixed(1) + 'px,' + sh.y.toFixed(1) + 'px);">' + g + '</div>';
    }

    /* Act 4 (380-539): Ken Burns panel + staggered statement + badge */
    if (frame >= 380) {
      const lf = frame - 380;
      const kb = M.kenBurns(frame, { at: 380, dur: 160, from: 1, to: 1.09, panX: -14 });
      world += '<div style="position:absolute;left:190px;top:110px;width:900px;height:500px;border-radius:28px;' +
        'background:linear-gradient(140deg,#3B2FBF,#B83A8C 55%,#FF8A4C);transform:' + kb + ';opacity:.92;"></div>';
      const lines = ['One line', 'per motion.'];
      lines.forEach((t, i) => {
        world += '<div style="position:absolute;left:0;top:' + (238 + i * 108) + 'px;width:1280px;text-align:center;' +
          'font:800 92px sans-serif;color:#FFFFFF;' + M.fadeUp(frame, { at: 392 + i * 14, dist: 36, dur: 18 }) + '">' + t + '</div>';
      });
      world += M.badge(frame, { right: 856, top: 512, text: 'motion-primitives · v0.3', color: '#3ED97E', at: 452, size: 25 });
    }

    const punchZ = frame >= 196 && frame < 250 ? M.punch(frame, { at: 196, amp: 0.05 }) : 1;
    const camT = M.camera(frame, CAM, { w: 1280, h: 720 });
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + M.meshBg(frame, {}) + ';"></div>' +
      '<div style="position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0;transform:' + camT + ';">' +
      '<div style="position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:640px 360px;transform:scale(' +
      punchZ.toFixed(4) + ');">' + world + '</div></div>' +
      (frame >= 196 && frame < 250 ? M.flash(frame, { at: 196, dur: 3, opacity: 0.55 }) : '') +
      M.fx(frame, { grain: 0.06, vignette: 0.3 });
  },
};
