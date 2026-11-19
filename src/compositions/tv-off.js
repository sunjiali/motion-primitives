// tv-off — the CRT power-off/on: the hero word squashes into a
// glowing line and pinches to a phosphor dot, the sub-line powers
// back on dot → line → full, and the whole stage dies to black at
// the end — the tube-TV sign-off.
// Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">TV OFF</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">the tube dies to a dot</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">TV OFF</div>';
    const all =
      title +
      M.tvOff(frame, { html: word, at: 10, dur: 30, glow: '#FF6B81' }) +
      M.tvOff(frame, { html: sub, at: 55, dur: 35, mode: 'on' }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.tvOff(frame, { mode: \'off\' })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      M.tvOff(frame, { html: all, at: 110, dur: 40, mode: 'off' });
  },
};
