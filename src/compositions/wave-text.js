// wave-text — the waveText showcase: a sentence ripples sideways on a
// travelling sine wave while a second line bobs vertically, proving
// both axes of the same primitive. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + INK + ';">WAVE TEXT</div>' +
      M.waveText(frame, { text: 'letters ride the wave', x: 640, y: 360, amp: 18, wl: 6, speed: 0.15, size: 84, color: INK }) +
      M.waveText(frame, { text: 'and bob up and down', x: 640, y: 500, amp: 12, wl: 5, speed: 0.2, axis: 'y', size: 36, weight: 500, color: INK }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + INK + ';opacity:.55;">M.waveText(frame, { amp: 18, wl: 6, speed: 0.15 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CORAL + ';"></div>';
  },
};
