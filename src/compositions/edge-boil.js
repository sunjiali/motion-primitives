// edge-boil — the hand-drawn boiling-line showcase: the hero word
// shivers on a sustained turbulence boil while the sub-line boils
// only inside a window (ramping in and out), against a title that
// stays perfectly still — the contrast proves the wobble is the
// filter, not a camera move. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const hero = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 150px system-ui;color:' + CORAL + ';white-space:nowrap;">BOIL</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">outlines redrawn 8&times; a second</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">EDGE BOIL</div>' +
      M.edgeBoil(frame, { html: hero, amp: 5, freq: 0.025 }) +
      M.edgeBoil(frame, { html: sub, at: 45, dur: 60, amp: 6, freq: 0.03 }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.edgeBoil(frame, { amp: 5, step: 4 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
  },
};
