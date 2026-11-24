// fisheye — radial lens distortion: the hero word bends into the
// lens, the sub-line shows the pincushion mirror, and the title
// unbends back to flat at the end — one primitive, three modes.
// Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">LENS</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">bent light, flat edges</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">FISHEYE</div>';
    const code = '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.fisheye(frame, { strength: 0.6 })</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      M.fisheye(frame, { html: title, at: 110, dur: 40, mode: 'out', strength: 0.6 }) +
      M.fisheye(frame, { html: word, at: 10, dur: 45, strength: 0.6 }) +
      M.fisheye(frame, { html: sub, at: 60, dur: 40, strength: -0.6 }) +
      code;
  },
};
