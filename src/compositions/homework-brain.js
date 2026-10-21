// homework-brain — house style (STYLE.md): flat vector, one solid bg per
// scene, round-faced balls, EN title + CN translation, code pill, hard
// cuts, silent. 20 scenes x 105 frames = 2100 frames (70 s @30fps).
// Source of the ideas: X long-form post by @longhaiqwe123 on the first
// principles of tutoring homework (working memory, chunking, cognitive
// offloading). All on-screen copy is written for this video.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 2100 },

  render(frame, stage) {
    const M = window.Motion;
    const CREAM = '#FBF6EC', BLUE = '#2F6DB3', INKBG = '#26221F';
    const RAYS = 'repeating-conic-gradient(from 0deg at 50% 46%, #FFD93D 0deg 14deg, #F5C93F 14deg 28deg)';
    const ORANGE = '#FF8A4C', SKY = '#3FB6FF', GREEN = '#4ED06A', GOLD = '#FFD93D',
      PURPLE = '#C792EA', PINK = '#FF6B81', RED = '#E4572E', INKTX = '#33302B', SAND = '#9A8F7D';
    const RANGES = [];
    for (let i = 0; i < 20; i++) RANGES.push([i * 105, (i + 1) * 105]);
    const sc = M.scene(frame, RANGES), lf = sc.lf, idx = sc.index;

    // ---- shared helpers -------------------------------------------------
    const div = (x, y, w, h, css) =>
      '<div style="position:absolute;left:' + (x - w / 2) + 'px;top:' + (y - h / 2) + 'px;width:' + w + 'px;height:' + h + 'px;' + css + '"></div>';
    const txt = (x, y, s, o) => {
      o = o || {};
      const size = o.size || 30;
      return '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-50%)' +
        (o.scale != null ? ' scale(' + o.scale + ')' : '') + (o.rot ? ' rotate(' + o.rot + 'deg)' : '') +
        ';font:' + (o.weight || 700) + ' ' + size + 'px ' + (o.font || 'sans-serif') + ';color:' + (o.color || INKTX) +
        ';opacity:' + (o.opacity == null ? 1 : o.opacity) + ';white-space:nowrap;">' + s + '</div>';
    };
    const face = (x, y, r, phase, expr) => {
      const blink = ((frame + (phase || 0)) % 96) < 5;
      const ey = y - r * 0.14, ex = r * 0.36, er = Math.max(r * 0.10, 3);
      let eyes;
      if (blink || expr === 'sleep') {
        eyes = div(x - ex, ey, er * 2, 3, 'border-radius:2px;background:' + INKTX) +
               div(x + ex, ey, er * 2, 3, 'border-radius:2px;background:' + INKTX);
      } else {
        eyes = M.dot({ x: x - ex, y: ey, r: er, color: INKTX }) + M.dot({ x: x + ex, y: ey, r: er, color: INKTX });
      }
      const mw = r * 0.72, mt = y + r * 0.10, bw = Math.max(r * 0.07, 3);
      let mouth;
      if (expr === 'flat') mouth = div(x, mt + r * 0.14, mw * 0.7, bw, 'border-radius:2px;background:' + INKTX);
      else if (expr === 'sad') mouth = '<div style="position:absolute;left:' + (x - mw / 2) + 'px;top:' + (mt + r * 0.18) + 'px;width:' + mw + 'px;height:' + (mw / 2) + 'px;border:' + bw + 'px solid ' + INKTX + ';border-color:' + INKTX + ' transparent transparent transparent;border-radius:50%;"></div>';
      else if (expr === 'wow') mouth = div(x, mt + r * 0.16, r * 0.30, r * 0.36, 'border-radius:50%;background:' + INKTX);
      else mouth = '<div style="position:absolute;left:' + (x - mw / 2) + 'px;top:' + mt + 'px;width:' + mw + 'px;height:' + (mw / 2) + 'px;border:' + bw + 'px solid ' + INKTX + ';border-color:transparent transparent ' + INKTX + ' transparent;border-radius:50%;"></div>';
      return eyes + mouth;
    };
    const ball = (x, y, r, color, o) => {
      o = o || {};
      const s = o.scale == null ? 1 : o.scale;
      if (r * s < 2) return '';
      return M.dot({ x, y, r, color, scale: s, opacity: o.opacity == null ? 1 : o.opacity, candy: true }) +
        (r * s > 15 ? face(x, y, r * s, o.phase || 0, o.expr) : '');
    };
    const sweat = (x, y, r, seed) => {
      let s = '';
      for (let i = 0; i < 2; i++) {
        const ph = ((lf + seed * 13 + i * 21) % 42) / 42;
        if (ph > 0.85) continue;
        s += '<div style="position:absolute;left:' + (x + r * 0.95) + 'px;top:' + (y - r * 0.3 + ph * r * 0.9) + 'px;width:11px;height:15px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#7FC8F8;opacity:' + (1 - ph) + ';transform:rotate(12deg);"></div>';
      }
      return s;
    };
    const title = (en, cn, light, size) =>
      '<div style="position:absolute;top:40px;left:0;right:0;text-align:center;">' +
      '<div style="font:800 ' + (size || 47) + 'px sans-serif;color:' + (light ? '#FFF7E8' : INKTX) + ';">' + en + (en.endsWith('.') ? '' : '.') + '</div>' +
      '<div style="font:600 23px sans-serif;color:' + (light ? '#D8E6F5' : SAND) + ';margin-top:2px;">' + cn + '</div></div>';
    const pill = (code) =>
      '<div style="position:absolute;bottom:36px;left:0;right:0;text-align:center;">' +
      '<span style="font:600 23px monospace;color:#F3E9D2;background:#2E2A24;padding:12px 26px;border-radius:999px;">' + code + '</span></div>';
    const slot = (x, y, w, h, col, dashed) =>
      div(x, y, w, h, 'border:5px ' + (dashed ? 'dashed ' : 'solid ') + col + ';border-radius:16px;background:rgba(255,255,255,0.05);box-sizing:border-box;');

    // Hanoi rig shared by scenes 3-4. init: {0:[peg,level],1:..,2:..} ring ids
    // 0=small 1=mid 2=big. moves: {ring, from:[p,l], to:[p,l], at, dur}.
    const hanoi = (init, moves) => {
      const pegX = [340, 640, 940], baseY = 560, liftTop = 208;
      const W = [118, 182, 248], COL = [SKY, '#F2A03D', RED], RH = 34, STEP = 37;
      let s = '';
      for (let i = 0; i < 3; i++) s += div(pegX[i], 430, 10, 260, 'border-radius:5px;background:#6B543F;');
      s += div(640, 568, 940, 16, 'border-radius:8px;background:#8A6D4B;');
      s += txt(340, 606, 'A', { size: 22, color: SAND }) + txt(640, 606, 'B', { size: 22, color: SAND }) + txt(940, 606, 'C', { size: 22, color: SAND });
      const pose = {};
      for (const k of [0, 1, 2]) pose[k] = init[k].slice();
      const anim = {};
      for (const mv of moves) {
        if (lf >= mv.at + mv.dur) { pose[mv.ring] = mv.to.slice(); }
        else if (lf >= mv.at) {
          const liftP = M.ease(lf, { at: mv.at, dur: mv.dur * 0.38 });
          const acrossP = M.ease(lf, { at: mv.at + mv.dur * 0.38, dur: mv.dur * 0.30 });
          const downP = M.ease(lf, { at: mv.at + mv.dur * 0.68, dur: mv.dur * 0.32 });
          const startTop = baseY - (mv.from[1] + 1) * STEP + 3, endTop = baseY - (mv.to[1] + 1) * STEP + 3;
          const top = downP > 0 ? liftTop + (endTop - liftTop) * downP : startTop + (liftTop - startTop) * liftP;
          anim[mv.ring] = { x: pegX[mv.from[0]] + (pegX[mv.to[0]] - pegX[mv.from[0]]) * acrossP, top };
          pose[mv.ring] = null;
        }
      }
      for (const k of [2, 1, 0]) {
        let x, top;
        if (anim[k]) { x = anim[k].x; top = anim[k].top; }
        else if (pose[k]) { x = pegX[pose[k][0]]; top = baseY - (pose[k][1] + 1) * STEP + 3; }
        else continue;
        s += div(x, top + RH / 2, W[k], RH, 'border-radius:17px;background:' + COL[k] + ';');
      }
      return s;
    };

    let bg = CREAM, body = '';

    // ---- Scene 1: taught it three times -------------------------------
    if (idx === 0) {
      let s = div(640, 500, 700, 16, 'border-radius:8px;background:#C9A876;');
      s += div(360, 562, 14, 108, 'background:#B08D5F;') + div(920, 562, 14, 108, 'background:#B08D5F;');
      s += div(640, 478, 120, 34, 'background:#FFFDF6;border-radius:6px;transform:rotate(-3deg);');
      s += div(640, 478, 4, 34, 'background:#E4DCC8;');
      s += ball(395, 425, 63, ORANGE, { expr: 'flat', phase: 3 });
      s += ball(885, 440, 49, SKY, { expr: 'sad', phase: 21 });
      let qy = 318, qo = 1, qr = 0;
      const qs = lf < 66 ? Math.max(M.pop(lf, { at: 20, stiffness: 120, damping: 9 }), 0.001) : 1;
      if (lf >= 66) { const e = M.ease(lf, { at: 66, dur: 22 }); qy += e * 150; qo = 1 - e; qr = e * 30; }
      s += txt(885, qy, '?', { size: 92, color: RED, scale: qs, opacity: qo, rot: qr });
      body = s + title('Taught it three times', '刚讲过三遍，怎么又不会？') + pill('parent.explain(topic) // again');
    }

    // ---- Scene 2: not attitude, hardware -------------------------------
    if (idx === 1) {
      bg = INKBG;
      const xoff = lf < 64 ? Math.sin(lf * 0.16) * 5 * (1 - lf / 64) : 0;
      let s = ball(470 + xoff, 385, 90, SKY, { expr: 'flat', phase: 5 });
      const chipS = Math.max(M.pop(lf, { at: 14, stiffness: 110, damping: 9 }), 0.001) * M.pulse(lf, { amp: 0.05, speed: 0.08 });
      let chip = '';
      for (let i = -1; i <= 1; i++) {
        chip += div(470 + i * 20, 200, 10, 6, 'background:#57C7FF;') + div(470 + i * 20, 264, 10, 6, 'background:#57C7FF;');
        chip += div(438, 232 + i * 20, 6, 10, 'background:#57C7FF;') + div(502, 232 + i * 20, 6, 10, 'background:#57C7FF;');
      }
      chip += div(470, 232, 58, 58, 'background:#57C7FF;border-radius:12px;transform:scale(' + chipS + ');');
      chip += div(470, 232, 26, 26, 'background:#2F6DB3;border-radius:6px;transform:scale(' + chipS + ');');
      s += chip;
      s += M.morphShape(lf, { from: 'star', to: 'star', x: 592, y: 222, size: 44, color: GOLD, rot: lf * 1.5 });
      if (lf < 80) for (let i = 0; i < 3; i++) {
        const ph = ((lf + i * 14) % 45) / 45;
        s += M.dot({ x: 415 - ph * 46, y: 425 + ph * 30, r: 5, color: '#B9B2A4', opacity: (1 - ph) * 0.7 });
      }
      s += txt(905, 330, '不是不想学', { size: 34, color: '#FFF7E8', opacity: M.ease(lf, { at: 30, dur: 16 }) });
      s += txt(905, 385, '是脑子里的「内存」太小', { size: 34, color: '#D8E6F5', opacity: M.ease(lf, { at: 44, dur: 16 }) });
      body = s + title('Not attitude. Hardware', '不是态度问题，是硬件限制', true) + pill("diagnosis = 'hardware'");
    }

    // ---- Scene 3: Hanoi, first 3 moves ---------------------------------
    if (idx === 2) {
      const init = { 0: [0, 2], 1: [0, 1], 2: [0, 0] };
      const moves = [
        { ring: 0, from: [0, 2], to: [2, 0], at: 10, dur: 26 },
        { ring: 1, from: [0, 1], to: [1, 0], at: 42, dur: 26 },
        { ring: 0, from: [2, 0], to: [1, 1], at: 74, dur: 26 },
      ];
      body = hanoi(init, moves) + title('The three-ring problem', '三环问题：全部移到最右边') + pill('hanoi(n=3) // 7 moves');
    }

    // ---- Scene 4: Hanoi moves 4-7 fast + tracking labels ----------------
    if (idx === 3) {
      bg = BLUE;
      const init = { 0: [1, 1], 1: [1, 0], 2: [0, 0] };
      const moves = [
        { ring: 2, from: [0, 0], to: [2, 0], at: 6, dur: 15 },
        { ring: 0, from: [1, 1], to: [0, 0], at: 25, dur: 15 },
        { ring: 1, from: [1, 0], to: [2, 1], at: 44, dur: 15 },
        { ring: 0, from: [0, 0], to: [2, 2], at: 63, dur: 15 },
      ];
      let s = hanoi(init, moves);
      const tags = [['位置', 430, 80], ['规则', 640, 87], ['下一步', 850, 94]];
      for (const [t, cx, at] of tags) {
        const ps = Math.max(M.pop(lf, { at, stiffness: 130, damping: 10 }), 0.001);
        s += div(cx, 182, t.length > 2 ? 118 : 92, 52, 'background:#26221F;border-radius:26px;transform:scale(' + ps + ');');
        s += txt(cx, 182, t, { size: 24, color: '#FFF7E8', scale: ps });
      }
      body = s + title('Seven moves. Three things to track', '7 步，要同时记三件事', true) + pill('track: position + rules + lookahead');
    }

    // ---- Scene 5: working memory slots ----------------------------------
    if (idx === 4) {
      let s = '';
      const flash = (lf >= 64 && lf < 72) || (lf >= 76 && lf < 84);
      const centers = [355, 515, 675, 835];
      const cols = [ORANGE, SKY, GREEN, GOLD];
      for (let i = 0; i < 4; i++) {
        s += slot(centers[i], 365, 140, 140, flash ? RED : '#B9A98C');
        const ps = Math.max(M.pop(lf, { at: 8 + i * 11, stiffness: 130, damping: 10 }), 0.001);
        s += ball(centers[i], 365, 46, cols[i], { scale: ps, expr: 'smile', phase: i * 13 });
      }
      let bx, by, bexpr = 'wow';
      if (lf < 52) { const ps = Math.max(M.pop(lf, { at: 46, stiffness: 120, damping: 9 }), 0.001); s += ball(1095, 215, 46, PURPLE, { scale: ps, expr: 'wow', phase: 7 }); }
      else {
        if (lf < 66) { const p = M.fly(lf, { at: 52, dur: 14, from: { x: 1095, y: 215 }, to: { x: 905, y: 300 }, arc: 60 }); bx = p.x; by = p.y; }
        else if (lf < 78) { const p = M.fly(lf, { at: 66, dur: 12, from: { x: 905, y: 300 }, to: { x: 1010, y: 460 }, arc: 36 }); bx = p.x; by = p.y; bexpr = 'sad'; }
        else { bx = 1010; by = 545 + M.drop(lf, { at: 78, from: -85 }); bexpr = 'sad'; }
        s += ball(bx, by, 46, PURPLE, { expr: bexpr, phase: 7 });
      }
      s += txt(640, 545, '第 5 个，挤不进去了', { size: 27, color: RED, opacity: M.ease(lf, { at: 60, dur: 12 }) });
      body = s + title('Working memory: 3–4 slots', '工作记忆只有 3–4 个格子') + pill('slots = 4 // modern measure');
    }

    // ---- Scene 6: thinking is expensive ----------------------------------
    if (idx === 5) {
      bg = INKBG;
      let s = '';
      const blob = [[-52, -18, 58], [0, -40, 66], [52, -18, 58], [-32, 24, 52], [32, 24, 52]];
      const bs = M.breathe(lf, { amp: 0.03, speed: 0.05 });
      for (const [ox, oy, r] of blob) s += M.dot({ x: 640 + ox * bs, y: 335 + oy * bs, r: r * bs, color: '#F0A6C8' });
      s += M.waveLine(lf, { x: 585, y: 335, w: 110, amp: 10, wl: 36, speed: 0.06, color: '#D97BA8', width: 5, taper: true });
      const n2 = M.countUp(lf, { at: 12, dur: 18, from: 0, to: 2 });
      const n20 = M.countUp(lf, { at: 30, dur: 42, from: 0, to: 20 });
      s += txt(285, 245, n2 + '%', { size: 92, color: PINK });
      s += txt(285, 320, '体重', { size: 23, color: '#B9B2A4', weight: 600 });
      s += txt(995, 245, n20 + '%', { size: 92, color: GREEN });
      s += txt(995, 320, '能量', { size: 23, color: '#B9B2A4', weight: 600 });
      const filled = 10 - Math.round(M.ease(lf, { at: 12, dur: 66 }) * 8);
      s += div(640, 505, 308, 44, 'border:4px solid #8E867A;border-radius:10px;box-sizing:border-box;');
      s += div(800, 505, 12, 20, 'background:#8E867A;border-radius:3px;');
      for (let i = 0; i < 10; i++) {
        if (i >= filled) break;
        s += div(500 + i * 28, 505, 22, 28, 'border-radius:4px;background:' + (filled <= 3 ? RED : GREEN) + ';');
      }
      s += txt(640, 580, '电量告急', { size: 24, color: RED, opacity: M.ease(lf, { at: 74, dur: 12 }) });
      body = s + title('Thinking is expensive', '思考，是大脑最费电的活动', true) + pill('brain: 2% mass → 20% energy');
    }

    // ---- Scene 7: memory is the cheap lane --------------------------------
    if (idx === 6) {
      bg = BLUE;
      let s = div(640, 380, 3, 400, 'background:rgba(255,247,232,0.45);');
      // left: derive it live — slow, sweaty
      s += div(320, 200, 216, 96, 'background:#FFFDF6;border-radius:20px;transform:scale(' + Math.max(M.pop(lf, { at: 8, stiffness: 120, damping: 10 }), 0.001) + ');');
      s += M.waveLine(lf, { x: 248, y: 200, w: 144, amp: 8, wl: 30, speed: 0.25, color: SAND, width: 4, taper: true });
      s += ball(320, 375, 62, ORANGE, { expr: 'sad', phase: 9 });
      s += sweat(320, 375, 62, 4);
      s += div(320, 530, 268, 30, 'border:3px solid rgba(255,247,232,0.7);border-radius:8px;box-sizing:border-box;');
      s += div(320 - 130 + 130 * M.ease(lf, { at: 10, dur: 82 }) * 0.35, 530, 260 * M.ease(lf, { at: 10, dur: 82 }) * 0.35, 20, 'border-radius:5px;background:' + ORANGE + ';');
      s += txt(320, 478, '现想 · 慢 · 费电', { size: 22, color: '#D8E6F5', weight: 600 });
      // right: recall — instant, full battery
      s += div(960, 200, 216, 96, 'background:#FFFDF6;border-radius:20px;transform:scale(' + Math.max(M.pop(lf, { at: 8, stiffness: 120, damping: 10 }), 0.001) + ');');
      s += txt(960, 200, '7×8 = 56', { size: 32, color: INKTX, weight: 800 });
      s += ball(960, 375, 62, GREEN, { expr: 'smile', phase: 27 });
      for (let i = 0; i < 3; i++) s += div(855, 345 + i * 30, 44 - i * 8, 5, 'border-radius:3px;background:#BFE3FF;opacity:0.85;');
      s += div(960, 530, 268, 30, 'border:3px solid rgba(255,247,232,0.7);border-radius:8px;box-sizing:border-box;');
      s += div(960, 530, 260 * M.ease(lf, { at: 10, dur: 22 }), 20, 'border-radius:5px;background:' + GREEN + ';');
      s += txt(1130, 478, '✓', { size: 34, color: GREEN, scale: Math.max(M.pop(lf, { at: 34, stiffness: 140, damping: 8 }), 0.001) });
      s += txt(960, 478, '背出 · 快 · 省电', { size: 22, color: '#D8E6F5', weight: 600 });
      body = s + title('Memory is the cheap lane', '记住了，就不用现想', true) + pill('recall() &lt;&lt; derive()');
    }

    // ---- Scene 8: chunks pack many into one --------------------------------
    if (idx === 7) {
      let s = '';
      for (let i = 0; i < 4; i++) s += slot(150 + i * 62, 320, 58, 58, '#B9A98C');
      for (let i = 0; i < 7; i++) {
        const ps = Math.max(M.pop(lf, { at: 6 + i * 3, stiffness: 140, damping: 11 }), 0.001);
        s += M.dot({ x: 150 + i * 62, y: 320, r: 17, color: ORANGE, scale: ps });
      }
      for (let i = 0; i < 8; i++) {
        const ps = Math.max(M.pop(lf, { at: 10 + i * 3, stiffness: 140, damping: 11 }), 0.001);
        s += M.dot({ x: 150 + i * 62, y: 398, r: 17, color: SKY, scale: ps });
      }
      s += txt(336, 248, '7 个 ＋ 8 个', { size: 28, color: SAND, weight: 600 });
      s += txt(336, 478, '占满 15 个位置', { size: 24, color: SAND, weight: 600 });
      s += slot(950, 365, 196, 196, '#B9A98C');
      const bp = Math.max(M.pop(lf, { at: 55, stiffness: 115, damping: 9 }), 0.001);
      s += M.dot({ x: 950, y: 365, r: 76, color: GREEN, scale: bp, candy: true });
      s += txt(950, 365, '56', { size: 46, color: '#FFFFFF', weight: 800, opacity: M.ease(lf, { at: 64, dur: 10 }) });
      s += M.ripple(lf, { x: 950, y: 365, at: 58, color: GREEN, maxR: 130 });
      s += txt(950, 238, '7×8 打包成 1 个组块', { size: 28, color: SAND, weight: 600 });
      body = s + title('Chunks pack many into one', '组块：把一堆信息打包成一个') + pill("chunk('7×8') = 56");
    }

    // ---- Scene 9: given answers earn nothing --------------------------------
    if (idx === 8) {
      bg = INKBG;
      let s = div(640, 380, 3, 400, 'background:rgba(255,247,232,0.3);');
      // left: answer handed over, star dies
      const px = 130 + M.ease(lf, { at: 8, dur: 24 }) * 90;
      s += div(px, 300, 150, 108, 'background:#FFFDF6;border-radius:10px;transform:rotate(-4deg);');
      s += txt(px, 300, '7×8=56', { size: 26, color: INKTX, weight: 800, rot: -4 });
      s += ball(330, 470, 56, SKY, { expr: 'flat', phase: 11 });
      s += txt(330, 330, '★', { size: 58, color: '#6E675C' });
      s += txt(330, 330, '★', { size: 58, color: GOLD, opacity: 1 - M.ease(lf, { at: 36, dur: 18 }) });
      s += txt(320, 590, '答案直接递过来', { size: 22, color: '#B9B2A4', weight: 600 });
      // right: figures it out, star bursts
      s += ball(950, 470, 56, ORANGE, { expr: lf >= 50 ? 'smile' : 'flat', phase: 31 });
      s += div(950, 268, 44, 44, 'border-radius:50%;background:' + GOLD + ';opacity:' + M.ease(lf, { at: 44, dur: 8 }) + ';transform:scale(' + Math.max(M.pop(lf, { at: 44, stiffness: 130, damping: 9 }), 0.001) + ');');
      s += div(950, 300, 18, 12, 'background:#B9B2A4;');
      s += txt(950, 330, '★', { size: 58, color: GOLD, scale: Math.max(M.pop(lf, { at: 54, stiffness: 130, damping: 8 }), 0.001) });
      s += M.burst(lf, { x: 950, y: 330, at: 56, n: 12, dist: 110 });
      s += txt(950, 590, '自己想通', { size: 22, color: '#B9B2A4', weight: 600 });
      body = s + title('Given answers earn nothing', '直接给答案，大脑没有奖赏', true) + pill('reward ∝ self_derived');
    }

    // ---- Scene 10: too hard / too easy / just right --------------------------
    if (idx === 9) {
      bg = RAYS;
      let s = '';
      const slope = (cx, cy, len, deg) => div(cx, cy, len, 16, 'border-radius:8px;background:' + INKTX + ';transform:rotate(' + deg + 'deg);');
      // left: steep — slides down, gives up
      s += slope(220, 425, 272, -36);
      const t1 = 0.92 - 0.84 * M.ease(lf, { at: 8, dur: 30, fn: 'cubicIn' });
      s += ball(110 + (330 - 110) * t1, 505 + (345 - 505) * t1 - 40, 40, PURPLE, { expr: lf >= 40 ? 'sad' : 'wow', phase: 3 });
      // middle: flat — yawns
      s += div(640, 520, 300, 16, 'border-radius:8px;background:' + INKTX + ';');
      s += ball(640, 478, 42, SKY, { expr: 'wow', phase: 17 });
      for (let i = 0; i < 2; i++) {
        const ph = ((lf + i * 30) % 60) / 60;
        s += txt(706, 428 - ph * 44, 'Z', { size: 26, color: '#6B5E3F', opacity: 1 - ph });
      }
      // right: just-right slope — climbs, eyes lit
      s += slope(1055, 450, 320, -20);
      const t3 = 0.1 + 0.8 * M.ease(lf, { at: 10, dur: 78 });
      const cx3 = 905 + (1205 - 905) * t3, cy3 = 505 + (395 - 505) * t3 - 40 - (lf < 88 ? Math.abs(Math.sin(lf * 0.35)) * 6 : 0);
      s += ball(cx3, cy3, 40, ORANGE, { expr: 'smile', phase: 23 });
      s += txt(cx3 + 34, cy3 - 58, '✦', { size: 30, color: '#B8860B', scale: Math.max(M.pop(lf, { at: 55, stiffness: 140, damping: 8 }), 0.001) });
      s += txt(cx3 - 30, cy3 - 66, '✦', { size: 24, color: '#B8860B', scale: Math.max(M.pop(lf, { at: 76, stiffness: 140, damping: 8 }), 0.001) });
      s += txt(213, 618, '太难 · 放弃', { size: 23, color: '#6B5E3F' });
      s += txt(640, 618, '太易 · 无聊', { size: 23, color: '#6B5E3F' });
      s += txt(1067, 618, '刚好 · 上瘾', { size: 23, color: '#6B5E3F' });
      body = s + title('Too hard quits. Too easy bores', '太难放弃，太易无聊，刚好上瘾') + pill("engagement peaks at 'just right'");
    }

    // ---- Scene 11: one real homework problem ----------------------------------
    if (idx === 10) {
      let s = div(640, 380, 880, 310, 'background:#FFFDF6;border-radius:24px;border:3px solid #E7DFC9;box-sizing:border-box;transform:scale(' + Math.max(M.pop(lf, { at: 4, stiffness: 120, damping: 12 }), 0.001) + ');');
      const lines = [
        '一本书共 <b style="color:' + RED + '">96</b> 页，小雨已经读了 <b style="color:' + RED + '">36</b> 页。',
        '剩下的要在 <b style="color:' + RED + '">3</b> 天内读完，',
        '平均每天读多少页？',
      ];
      let lt = '';
      for (let i = 0; i < 3; i++) lt += '<div style="' + M.fadeUp(lf, { at: 12 + i * 12, dy: 14 }) + '">' + lines[i] + '</div>';
      s += '<div style="position:absolute;left:272px;top:258px;width:740px;font:600 35px sans-serif;color:' + INKTX + ';line-height:1.9;">' + lt + '</div>';
      s += ball(1042, 208, 32, SKY, { expr: 'smile', phase: 41 });
      body = s + title('One real homework problem', '一道真实的作业题') + pill('problem: (96 − 36) ÷ 3 = ?');
    }

    // ---- Scene 12: failure 1 — a missed word -----------------------------------
    if (idx === 11) {
      let s = div(640, 282, 880, 204, 'background:#FFFDF6;border-radius:24px;border:3px solid #E7DFC9;box-sizing:border-box;');
      s += '<div style="position:absolute;left:272px;top:216px;width:740px;font:600 29px sans-serif;color:' + INKTX + ';line-height:1.8;' + M.fadeUp(lf, { at: 6, dy: 10 }) + '">' +
        '一本书共 96 页，小雨已经读了 36 页，<span style="color:#C4BBA6">剩下的</span>要在 3 天内读完，平均每天读多少页？</div>';
      s += div(600, 520, 560, 120, 'background:#FFFDF6;border-radius:14px;border:3px solid #E7DFC9;box-sizing:border-box;');
      s += M.drawText(lf, { at: 28, dur: 26, text: '96 ÷ 3 = 32', x: 600, y: 520, size: 52, color: INKTX, anchor: 'middle' });
      const shk = lf >= 60 && lf < 78 ? M.shake(lf, { at: 60, amp: 6 }) : { x: 0, y: 0 };
      s += txt(950 + shk.x, 515 + shk.y, '✗', { size: 120, color: RED, scale: Math.max(M.pop(lf, { at: 60, stiffness: 140, damping: 8 }), 0.001) });
      s += ball(215, 520, 44, SKY, { expr: lf >= 60 ? 'sad' : 'wow', phase: 13 });
      body = s + title('Failure 1: a missed word', '卡法一：漏看「剩下的」') + pill('input_error → wrong_path');
    }

    // ---- Scene 13: failure 2 — a missing concept ----------------------------------
    if (idx === 12) {
      bg = BLUE;
      let s = div(640, 198, 500, 96, 'background:#FFFDF6;border-radius:18px;transform:scale(' + Math.max(M.pop(lf, { at: 6, stiffness: 120, damping: 11 }), 0.001) + ');');
      s += txt(640, 198, '还剩 60 页，平均分给 3 天？', { size: 30, color: INKTX, weight: 800 });
      s += ball(215, 300, 44, SKY, { expr: lf >= 80 ? 'smile' : 'flat', phase: 19 });
      s += div(215, 203, 40, 40, 'border-radius:50%;background:' + GOLD + ';opacity:' + M.ease(lf, { at: 78, dur: 8 }) + ';transform:scale(' + Math.max(M.pop(lf, { at: 78, stiffness: 130, damping: 9 }), 0.001) + ');');
      s += div(215, 232, 16, 11, 'background:#B9B2A4;opacity:' + M.ease(lf, { at: 78, dur: 8 }) + ';');
      const starts = [[455, 470], [505, 452], [542, 484], [468, 512], [522, 518], [492, 484]];
      const piles = [700, 880, 1060];
      for (let i = 0; i < 3; i++) s += div(piles[i], 545, 140, 14, 'border-radius:7px;background:rgba(255,247,232,0.9);');
      for (let i = 0; i < 6; i++) {
        const pile = Math.floor(i / 2), off = (i % 2 === 0) ? -27 : 27;
        const p = M.fly(lf, { at: 28 + i * 9, dur: 15, from: { x: starts[i][0], y: starts[i][1] }, to: { x: piles[pile] + off, y: 502 }, arc: 70 });
        s += M.dot({ x: p.x, y: p.y, r: 25, color: GOLD, candy: true });
        s += M.dot({ x: p.x, y: p.y, r: 6, color: INKTX });
      }
      s += '<div style="position:absolute;left:0;right:0;top:582px;text-align:center;font:600 26px sans-serif;color:#D8E6F5;' + M.fadeUp(lf, { at: 84, dy: 12 }) + '">每堆一样多 —— 这就是平均分</div>';
      body = s + title('Failure 2: a missing concept', '卡法二：不懂什么叫「平均分」', true) + pill("concept('average') = split evenly");
    }

    // ---- Scene 14: failure 3 — slots overflow --------------------------------------
    if (idx === 13) {
      bg = INKBG;
      let s = '';
      const centers = [270, 475, 680, 885, 1090];
      const labels = ['96', '36', '60', '3 天', '每天多少页？'];
      const widths = [84, 84, 84, 98, 158];
      const sizes = [30, 30, 30, 27, 21];
      const shk = lf >= 58 && lf < 70 ? M.shake(lf, { at: 58, amp: 5 }) : { x: 0, y: 0 };
      for (let i = 0; i < 5; i++) {
        const isGoal = i === 4;
        const col = isGoal && lf >= 58 && lf < 78 ? RED : '#575046';
        s += slot(centers[i], 330, 168, 120, col);
        let cx = centers[i] + shk.x, cy = 330, co = 1, cr = 0;
        if (isGoal && lf >= 62) { const e = M.ease(lf, { at: 62, dur: 22 }); cx += e * 90; cy += e * 120; co = 1 - e * 0.75; cr = e * 10; }
        const glow = i === 2 && lf >= 55;
        const cbg = glow ? GOLD : '#3A352E';
        const ct = glow ? INKTX : '#FFF7E8';
        const cs = glow ? M.pulse(lf, { amp: 0.06, speed: 0.12 }) : Math.max(M.pop(lf, { at: 6 + i * 8, stiffness: 130, damping: 10 }), 0.001);
        s += div(cx, cy, widths[i], 54, 'background:' + cbg + ';border-radius:27px;opacity:' + co + ';transform:rotate(' + cr + 'deg) scale(' + cs + ');');
        s += txt(cx, cy, labels[i], { size: sizes[i], color: ct, opacity: co, rot: cr });
      }
      s += txt(680, 232, '96 − 36 = 60', { size: 27, color: GOLD, scale: Math.max(M.pop(lf, { at: 55, stiffness: 130, damping: 9 }), 0.001) });
      s += ball(170, 555, 38, PURPLE, { expr: 'sad', phase: 29 });
      s += sweat(170, 555, 38, 6);
      body = s + title('Failure 3: slots overflow', '卡法三：算到一半，忘了问题', true) + pill('intermediate results evict the goal');
    }

    // ---- Scene 15: fix 1 — point, circle, hush ---------------------------------------
    if (idx === 14) {
      const sentence = '一本书96页，已读36页，剩下的3天读完，平均每天读多少页？';
      const chars = sentence.split('');
      // Mixed-run rendering (digits sit on the CJK baseline only inside a
      // mixed run); positions come from a per-char width model + spacing.
      const cw = (c) => (/[0-9]/.test(c) ? 17.5 : 31);
      const LS = 5.4;
      let natural = 0;
      for (const c of chars) natural += cw(c);
      const startX = 640 - (natural + LS * (chars.length - 1)) / 2;
      const charX = (i) => { let x = startX; for (let k = 0; k < i; k++) x += cw(chars[k]) + LS; return x; };
      const hotCol = lf >= 62 ? RED : INKTX;
      let s = '<div style="position:absolute;left:' + startX + 'px;top:182px;font:600 31px sans-serif;letter-spacing:' + LS + 'px;white-space:nowrap;color:' + INKTX + ';">' +
        '<span>' + chars.slice(0, 13).join('') + '</span>' +
        '<span style="color:' + hotCol + ';">' + chars.slice(13, 16).join('') + '</span>' +
        '<span>' + chars.slice(16).join('') + '</span></div>';
      s += M.highlightBox(lf, { x: charX(13) - 5, y: 174, w: (charX(15) + cw(chars[15])) - charX(13) + 10, h: 56, at: 48, dur: 14, color: RED, width: 5 });
      const fidx = Math.max(0, Math.min(chars.length - 1, Math.floor((lf - 12) / 2.6)));
      const fx = charX(fidx) + cw(chars[fidx]) / 2;
      s += M.dot({ x: fx, y: 268, r: 17, color: '#F2C094', candy: true });
      s += txt(fx, 306, '指读', { size: 19, color: SAND, weight: 600 });
      s += div(640, 556, 1100, 6, 'border-radius:3px;background:#E0D6BE;');
      s += ball(255, 478, 50, SKY, { expr: 'smile', phase: 7 });
      s += ball(1065, 470, 56, ORANGE, { expr: 'flat', phase: 15 });
      s += div(1065, 470 + 56 * 0.24, 42, 4, 'border-radius:2px;background:' + INKTX + ';');
      for (let i = -1; i <= 1; i++) s += div(1065 + i * 13, 470 + 56 * 0.24, 3, 11, 'background:' + INKTX + ';');
      body = s + title('Fix 1: point, circle, hush', '卸载一：指读、圈画、大人闭嘴') + pill('environment: calibrate input');
    }

    // ---- Scene 16: fix 2 — paper is external RAM ---------------------------------------
    if (idx === 15) {
      bg = BLUE;
      let s = div(450, 385, 470, 320, 'background:#FFFDF6;border-radius:18px;transform:scale(' + Math.max(M.pop(lf, { at: 4, stiffness: 120, damping: 12 }), 0.001) + ');');
      s += M.drawText(lf, { at: 14, dur: 20, text: '一共 96 页', x: 268, y: 302, size: 42, color: INKTX, anchor: 'start' });
      s += M.drawText(lf, { at: 42, dur: 20, text: '已读 36 页', x: 268, y: 388, size: 42, color: INKTX, anchor: 'start' });
      s += M.drawText(lf, { at: 70, dur: 20, text: '剩下 60 页', x: 268, y: 474, size: 42, color: RED, anchor: 'start' });
      const chipFly = (label, slotY, at, landY) => {
        if (lf < at) return div(905, slotY, 88, 54, 'background:#26221F;border-radius:27px;') + txt(905, slotY, label, { size: 29, color: '#FFF7E8' });
        const p = M.fly(lf, { at, dur: 16, from: { x: 905, y: slotY }, to: { x: 615, y: landY }, arc: 44 });
        const fo = 1 - M.ease(lf, { at: at + 14, dur: 8 });
        if (fo <= 0) return '';
        return div(p.x, p.y, 88, 54, 'background:#26221F;border-radius:27px;opacity:' + fo + ';') + txt(p.x, p.y, label, { size: 29, color: '#FFF7E8', opacity: fo });
      };
      s += slot(905, 300, 170, 120, '#BFE3FF', lf >= 56);
      s += slot(905, 465, 170, 120, '#BFE3FF', lf >= 84);
      s += chipFly('96', 300, 40, 296);
      s += chipFly('36', 465, 68, 382);
      if (lf >= 56) s += txt(905, 300, '空', { size: 26, color: '#BFE3FF', opacity: M.ease(lf, { at: 56, dur: 10 }) });
      if (lf >= 84) s += txt(905, 465, '空', { size: 26, color: '#BFE3FF', opacity: M.ease(lf, { at: 84, dur: 10 }) });
      s += ball(1108, 178, 38, GREEN, { expr: 'smile', phase: 33 });
      body = s + title('Fix 2: paper is external RAM', '卸载二：草稿纸是外置内存', true) + pill('offload(state) → paper');
    }

    // ---- Scene 17: fix 3 — hint the step before -----------------------------------------
    if (idx === 16) {
      let s = div(640, 268, 660, 178, 'background:#FFFDF6;border-radius:28px;transform:scale(' + Math.max(M.pop(lf, { at: 10, stiffness: 115, damping: 11 }), 0.001) + ');');
      s += div(600, 366, 26, 26, 'background:#FFFDF6;transform:rotate(45deg);');
      s += txt(640, 268, '先要知道：哪一部分页数？', { size: 37, color: INKTX, opacity: M.ease(lf, { at: 17, dur: 10 }) });
      s += ball(330, 505, 52, SKY, { expr: 'flat', phase: 23 });
      s += txt(330, 412, '✦', { size: 30, color: '#B8860B', scale: Math.max(M.pop(lf, { at: 72, stiffness: 140, damping: 8 }), 0.001) });
      s += txt(672, 505, '60 ÷ 3 =', { size: 56, color: INKTX, weight: 800, font: 'monospace' });
      s += div(940, 505, 104, 74, 'border:4px dashed #B9A98C;border-radius:12px;box-sizing:border-box;');
      s += txt(940, 505, '?', { size: 44, color: SAND, opacity: 0.45 + 0.3 * Math.sin(lf * 0.2) });
      body = s + title('Fix 3: hint the step before', '卸载三：只提示倒数第二步') + pill('hint(step − 1) // never the answer');
    }

    // ---- Scene 18: he closes the loop ------------------------------------------------------
    if (idx === 17) {
      bg = RAYS;
      let s = div(890, 390, 460, 110, 'background:#FFFDF6;border-radius:20px;transform:scale(' + Math.max(M.pop(lf, { at: 6, stiffness: 120, damping: 11 }), 0.001) + ');');
      s += M.drawText(lf, { at: 16, dur: 26, text: '60 ÷ 3 = 20', x: 890, y: 390, size: 54, color: INKTX, anchor: 'middle' });
      s += ball(400, 405, 68, SKY, { expr: lf >= 46 ? 'smile' : 'flat', phase: 9 });
      s += M.burst(lf, { x: 400, y: 262, at: 46, n: 14, dist: 150 });
      s += M.badge(lf, { left: 302, top: 136, text: '20 页/天', color: GREEN, fg: '#FFFFFF', size: 30, at: 52 });
      s += M.confetti(lf, { at: 54, x: 640, y: 150, n: 26, seed: 3 });
      s += ball(1055, 478, 54, ORANGE, { expr: 'smile', phase: 19 });
      body = s + title('He closes the loop', '最后一步，他自己迈') + pill('answer = 20 pages/day ✓ (his own)');
    }

    // ---- Scene 19: drill the weak link alone --------------------------------------------------
    if (idx === 18) {
      bg = INKBG;
      const cards = ['10÷1', '20÷2', '60÷3', '90÷3', '120÷4'];
      let s = '';
      for (let i = 0; i < 5; i++) {
        const cx = 190 + i * 225;
        const hl = i === 2;
        const cs = Math.max(M.pop(lf, { at: 8 + i * 10, stiffness: 130, damping: 11 }), 0.001);
        s += div(cx, 372, 196, 128, 'background:#FFFDF6;border-radius:18px;border:' + (hl ? '5px solid ' + GOLD : '3px solid #4A4238') + ';box-sizing:border-box;transform:scale(' + cs * (hl ? 1.07 : 1) + ');');
        s += txt(cx, 372, cards[i], { size: 38, color: INKTX, weight: 800, font: 'monospace' });
        s += txt(cx + 70, 322, '✓', { size: 34, color: GREEN, scale: Math.max(M.pop(lf, { at: 44 + i * 9, stiffness: 140, damping: 8 }), 0.001) });
      }
      s += txt(640, 486, '只练卡住的那一步', { size: 24, color: '#B9B2A4', weight: 600, opacity: M.ease(lf, { at: 30, dur: 12 }) });
      s += ball(640, 572, 33, GREEN, { expr: 'smile', phase: 27 });
      body = s + title('Drill the weak link alone', '卡在哪一步，就单练哪一步', true) + pill('isolate(subskill) × 5–10 reps');
    }

    // ---- Scene 20: unload the brain, leave the last step -----------------------------------------
    if (idx === 19) {
      let s = '';
      const groups = [300, 640, 980];
      const tints = ['#FFE3D3', '#D9ECFF', '#FFF3BF'];
      for (let i = 0; i < 3; i++) {
        const at = 10 + i * 14;
        const ps = Math.max(M.pop(lf, { at, stiffness: 120, damping: 10 }), 0.001);
        const fo = M.ease(lf, { at, dur: 12 });
        s += M.dot({ x: groups[i], y: 322, r: 80, color: tints[i], scale: ps });
        if (i === 0) {
          s += div(300, 322, 118, 56, 'background:#FFFDF6;border-radius:12px;border:2px solid #E7DFC9;box-sizing:border-box;opacity:' + fo + ';');
          s += txt(300, 322, '剩下的', { size: 24, color: RED, opacity: fo });
          s += M.highlightBox(lf, { x: 244, y: 296, w: 112, h: 54, at: 22, dur: 14, color: RED, width: 4 });
        }
        if (i === 1) {
          s += div(640, 322, 96, 122, 'background:#FFFDF6;border-radius:8px;border:2px solid #E7DFC9;box-sizing:border-box;opacity:' + fo + ';');
          for (let j = 0; j < 3; j++) s += div(640, 292 + j * 28, 58, 7, 'border-radius:3px;background:#C9BFA9;opacity:' + fo + ';');
        }
        if (i === 2) {
          s += div(980, 318, 132, 84, 'background:#FFFDF6;border-radius:20px;border:2px solid #E7DFC9;box-sizing:border-box;opacity:' + fo + ';');
          s += M.dot({ x: 962, y: 368, r: 7, color: '#FFFDF6' });
          s += txt(980, 318, '哪一步？', { size: 22, color: INKTX, opacity: fo });
        }
        s += txt(groups[i], 448, ['指读 · 圈画', '草稿纸', '只提示一步'][i], { size: 23, color: SAND, weight: 600, opacity: fo });
      }
      s += txt(640, 548, '原理来自 X 长文《辅导孩子做作业的第一性原理》@longhaiqwe123', { size: 20, color: SAND, weight: 500, opacity: M.ease(lf, { at: 58, dur: 14 }) });
      s += ball(168, 586, 36, ORANGE, { expr: 'smile', phase: 5 });
      s += ball(1112, 586, 40, SKY, { expr: 'smile', phase: 17 });
      body = s + title('Unload the brain. Leave the last step', '给大脑卸载，把最后一步留给孩子', false, 39) + pill('first principle of tutoring');
    }

    stage.innerHTML = '<div style="position:absolute;inset:0;background:' + bg + ';">' + body + '</div>';
  },
};
