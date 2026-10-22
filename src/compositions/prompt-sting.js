// prompt-sting — kinetic-type brand sting for the Prompt Gallery:
// "one prompt in, one video out". Built from the published prompt
// (site/prompts-data.js) — prompt-iterated, 2 rounds. Morry palette: warm cream
// #F5F1E8, ink #16171A, matcha #A6CF5F, acid #D9F24F. Silent, 16:9,
// hard cuts, 8 s @ 30 fps.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 240 },
  render(frame, stage) {
    const M = window.Motion;
    const CREAM = '#F5F1E8', INK = '#16171A', MATCHA = '#A6CF5F', ACID = '#D9F24F', SOFT = '#8A8272';
    let s = '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>';

    if (frame < 75) {
      // SCENE 1 — the prompt assembles itself, letter by letter.
      const lf = frame;
      s += '<div style="position:absolute;left:0;right:0;top:120px;text-align:center;font:600 22px system-ui;color:' + SOFT + ';letter-spacing:6px;' +
        M.fadeUp(lf, { at: 4, dur: 16 }) + '">ONE PROMPT IN</div>';
      s += M.assembleText(frame, { text: 'PROMPT', at: 12, dur: 22, x: 408, y: 268, size: 118, color: INK, seed: 7, weight: 800 });
      // acid caret block, blinking once the word has landed
      if (lf > 40 && (lf % 26) < 17) {
        s += '<div style="position:absolute;left:884px;top:290px;width:34px;height:96px;background:' + ACID + ';"></div>';
      }
      s += '<div style="position:absolute;left:0;right:0;top:472px;text-align:center;font:400 24px system-ui;color:' + SOFT + ';' +
        M.fadeUp(lf, { at: 46, dur: 16 }) + '">typed by a human, rendered by code</div>';
    } else if (frame < 165) {
      // SCENE 2 — three verbs, one pop each, 30 frames apiece.
      const verbs = [
        { t: 'WRITE.', c: INK },
        { t: 'RENDER.', c: MATCHA },
        { t: 'SHIP.', c: INK },
      ];
      const i = Math.floor((frame - 75) / 30);
      const lf = frame - 75 - i * 30;
      const v = verbs[i];
      const sc = M.pop(lf, { at: 0, stiffness: 150, damping: 11 });
      s += M.burst(frame, { x: 640, y: 360, at: 75 + i * 30 + 2, n: 10, dist: 220, colors: [v.c] });
      s += '<div style="position:absolute;left:0;right:0;top:262px;text-align:center;font:800 138px system-ui;color:' + v.c +
        ';letter-spacing:-2px;transform:scale(' + Math.max(sc, 0.001).toFixed(3) + ');">' + v.t + '</div>';
      s += '<div style="position:absolute;left:50%;top:478px;width:340px;height:6px;margin-left:-170px;background:' + ACID +
        ';transform:scaleX(' + Math.max(sc, 0.001).toFixed(3) + ');"></div>';
      s += '<div style="position:absolute;left:0;right:0;top:596px;text-align:center;font:600 19px ui-monospace,monospace;color:' + SOFT + ';">step ' + (i + 1) + ' / 3</div>';
    } else {
      // SCENE 3 — the lockup: wordmark, a typed code capsule, the claim.
      const lf = frame - 165;
      s += '<div style="position:absolute;left:0;right:0;top:196px;text-align:center;font:800 88px system-ui;letter-spacing:-2px;' +
        M.fadeUp(lf, { at: 2, dur: 14 }) + '"><span style="color:' + INK + ';">motion</span><span style="color:' + MATCHA + ';">-primitives</span></div>';
      const typed = M.typewriter(lf, { at: 16, text: 'M.compose(frame) // no math, just intent', cpf: 1, caret: true });
      s += '<div style="position:absolute;left:0;right:0;top:348px;text-align:center;">' +
        '<div style="display:inline-block;background:' + INK + ';border-radius:999px;padding:16px 34px;' +
        'font:500 24px ui-monospace,monospace;color:#F5F1E8;white-space:nowrap;' + M.fadeUp(lf, { at: 12, dur: 10 }) + '">' + typed + '</div></div>';
      s += '<div style="position:absolute;left:0;right:0;top:470px;text-align:center;font:400 26px system-ui;color:' + SOFT + ';' +
        M.fadeUp(lf, { at: 34, dur: 16 }) + '">87 primitives · copy the prompt, ship the video</div>';
    }
    stage.innerHTML = s;
  },
};
