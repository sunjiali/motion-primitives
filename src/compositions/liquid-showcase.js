// liquid-showcase — four creative cases built on ONE primitive:
// liquidMetal (the WebGL raymarched chrome). Scenes hard-cut,
// house style. 1 STING: the cluster forms, a wordmark assembles
// under it (logo-opener shape). 2 TRIO: chrome / gold / oil side
// by side. 3 LOADER: a small cluster as a living loading mark
// over a progress bar. 4 HERO: headline card, gold orb accent.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 300 },
  render(frame, stage) {
    const M = window.Motion;
    const dark = '<div style="position:absolute;inset:0;background:radial-gradient(120% 120% at 50% 28%,#1A2230,#07090D);"></div>';
    const label = (txt, x, y, color) =>
      '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;font:600 21px system-ui;color:' + (color || '#8E99AD') + ';letter-spacing:4px;">' + txt + '</div>';
    let s = '';
    if (frame < 90) {
      // STING — metal forms, then the wordmark assembles beneath it
      s = dark +
        M.liquidMetal(frame, { w: 800, h: 450, x: 240, y: 46, palette: 'chrome', seed: 2, speed: 0.9 }) +
        (frame > 34 ? M.assembleText(frame, { text: 'MOTION', at: 36, dur: 20, x: 437, y: 540, size: 64, color: '#E8E4DA', seed: 4 }) : '') +
        (frame > 58 ? '<div style="position:absolute;left:490px;top:640px;width:300px;height:2px;background:#46506A;transform:scaleX(' +
          Math.min(1, (frame - 58) / 14) + ');"></div>' : '');
    } else if (frame < 165) {
      // TRIO — one cluster, three finishes
      const lf = frame - 90;
      const panel = (pal, x, name, seed) =>
        M.liquidMetal(frame, { w: 400, h: 225, x, y: 190, palette: pal, seed, speed: 0.9 }) +
        (lf > 8 ? label(name, x + 118, 448) : '');
      s = dark + panel('chrome', 20, 'CHROME', 2) + panel('gold', 440, 'GOLD', 7) + panel('oil', 860, 'OIL SLICK', 5) +
        (lf > 4 ? '<div style="position:absolute;left:0;right:0;top:86px;text-align:center;font:700 30px system-ui;color:#E8E4DA;letter-spacing:8px;">ONE FIELD, THREE FINISHES</div>' : '');
    } else if (frame < 225) {
      // LOADER — the cluster as a living loading mark
      const lf = frame - 165;
      const pct = Math.min(100, Math.round((lf / 59) * 100));
      s = dark +
        M.liquidMetal(frame, { w: 380, h: 214, x: 450, y: 150, palette: 'chrome', seed: 9, speed: 1.6, blobs: 4 }) +
        '<div style="position:absolute;left:440px;top:430px;width:400px;height:8px;border-radius:4px;background:#232B3A;"></div>' +
        '<div style="position:absolute;left:440px;top:430px;width:' + (pct * 4) + 'px;height:8px;border-radius:4px;background:#C7CEDA;"></div>' +
        '<div style="position:absolute;left:0;right:0;top:462px;text-align:center;font:600 20px ui-monospace,monospace;color:#8E99AD;letter-spacing:5px;">LOADING ' + pct + '%</div>';
    } else {
      // HERO — headline card with a gold orb
      const lf = frame - 225;
      const fu = (at, x, y, inner) =>
        '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;' + M.fadeUp(lf, { at }) + '">' + inner + '</div>';
      s = dark +
        M.liquidMetal(frame, { w: 540, h: 304, x: 676, y: 196, palette: 'gold', seed: 3, speed: 0.8 }) +
        fu(4, 84, 218, '<div style="font:800 92px system-ui;color:#E8E4DA;line-height:1.04;">LIQUID</div>') +
        fu(10, 84, 318, '<div style="font:800 92px system-ui;color:#C9A86A;line-height:1.04;">METAL</div>') +
        fu(18, 88, 452, '<div style="font:400 25px system-ui;color:#8E99AD;">Raymarched SDF chrome, in one call.</div>') +
        (lf > 26 ? '<div style="position:absolute;left:88px;top:520px;padding:12px 26px;border:2px solid #46506A;border-radius:999px;font:600 20px system-ui;color:#E8E4DA;">M.liquidMetal(frame, o)</div>' : '');
    }
    stage.innerHTML = s;
  },
};
