// dot-text — halftone dot-filled type: the hero word prints itself
// one dot at a time (mode 'in', hash-staggered), the second line
// follows in cream, and a small third line breathes for the whole
// film (mode 'pulse') — the Adhemas "Do All Good" poster, three rows
// of dot-filled letterforms. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81', TEAL = '#3FB6FF';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:96px;font:800 64px system-ui;color:' + CREAM + ';">DOT TEXT</div>';
    const all =
      title +
      M.dotText(frame, { text: 'DOT', x: 640, y: 285, size: 150, color: CORAL, at: 10, dur: 45, gap: 16 }) +
      M.dotText(frame, { text: 'TEXT', x: 640, y: 440, size: 150, color: CREAM, at: 60, dur: 45, gap: 16 }) +
      M.dotText(frame, { text: 'printed, one dot at a time', x: 640, y: 580, size: 34, weight: 500, color: TEAL, mode: 'pulse', gap: 10, dot: 0.45, speed: 40 }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.dotText(frame, { mode: \'in\', gap: 16 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' + all;
  },
};
