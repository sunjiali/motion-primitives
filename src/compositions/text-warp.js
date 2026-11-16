// text-warp — the field-warped kinetic type showcase: the hero word
// rides a breathing arch while the sub-line flows on mirrored ripples
// outward from its centre — two live fields, one primitive.
// Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">TEXT WARP</div>' +
      M.textWarp(frame, { text: 'WARP', x: 640, y: 330, size: 150, amp: 55, speed: 0.08, color: CORAL }) +
      M.textWarp(frame, { text: 'letters flow like water', x: 640, y: 500, size: 36, weight: 500, field: 'ripple', amp: 10, wl: 10, speed: 0.12, color: CREAM }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.textWarp(frame, { field: \'arch\' })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
  },
};
