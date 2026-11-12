// domino — the domino topple-chain reveal: a row of cream tiles
// stands across the hero word and falls left to right, one tile
// knocking the next over, uncovering DOMINO as the wave passes;
// the sub-line is revealed by a second, reversed wave in coral.
// Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">DOMINO</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">one falls, the next follows</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">DOMINO</div>' +
      M.dominoReveal(frame, { html: word, at: 10, dur: 60, count: 12, fall: 12, fade: 10, color: CREAM, x: 0, y: 240, w: 1280, h: 180 }) +
      M.dominoReveal(frame, { html: sub, at: 85, dur: 45, count: 10, fall: 10, fade: 8, dir: 'left', color: CORAL, x: 0, y: 460, w: 1280, h: 80 }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.dominoReveal(frame, { count: 12, fall: 12 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
  },
};
