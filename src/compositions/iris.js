// iris — the circular-aperture reveal: the hero word arrives through
// an iris opening from the stage centre, the sub-line through a second
// iris opening from the bottom-left corner, and the whole stage irises
// out to a dot at the end — the classic film iris-out.
// Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">IRIS</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">a circle opens, the scene arrives</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">IRIS</div>';
    const all =
      title +
      M.iris(frame, { html: word, at: 10, dur: 50, feather: 24 }) +
      M.iris(frame, { html: sub, at: 75, dur: 45, x: 140, y: 640, feather: 16 }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.iris(frame, { mode: \'open\', feather: 24 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      M.iris(frame, { html: all, at: 110, dur: 40, mode: 'close', feather: 12 });
  },
};
