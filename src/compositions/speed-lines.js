// speed-lines — the speedLines showcase: a dot dashes across the
// stage trailing a narrow cone of streaks behind it, then lands with
// a full radial burst of speed lines. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const p = M.fly(frame, { at: 20, dur: 80, from: { x: 180, y: 360 }, to: { x: 1060, y: 360 }, arc: 0 });
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + INK + ';">SPEED LINES</div>' +
      // trailing cone: re-centred on the dot every frame, aimed backwards
      M.speedLines(frame, { x: p.x, y: p.y, at: 20, dur: 90, n: 10, angle: 180, spread: 80, gap: 34, minLen: 30, maxLen: 110, color: INK, seed: 7 }) +
      // impact burst at the landing point
      M.speedLines(frame, { x: 1060, y: 360, at: 105, dur: 30, n: 20, gap: 44, minLen: 40, maxLen: 150, color: INK, seed: 11 }) +
      M.dot({ x: p.x, y: p.y, r: 26, color: CORAL }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + INK + ';opacity:.55;">M.speedLines(frame, { angle: 180, spread: 80 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CORAL + ';"></div>';
  },
};
