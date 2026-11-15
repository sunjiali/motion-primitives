// clock-wipe — the radial clock-hand sector reveal: the hero word
// is swept in clockwise from 12 o'clock, the sub-line counter-
// clockwise from the bottom-left corner, and the whole stage winds
// away at the end — the angular counterpart to the iris.
// Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">CLOCK</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">a hand sweeps, the scene arrives</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">CLOCK WIPE</div>';
    const all =
      title +
      M.clockWipe(frame, { html: word, at: 10, dur: 50 }) +
      M.clockWipe(frame, { html: sub, at: 75, dur: 45, dir: 'ccw', x: 140, y: 640 }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.clockWipe(frame, { dir: \'cw\' })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      M.clockWipe(frame, { html: all, at: 110, dur: 40, mode: 'close' });
  },
};
