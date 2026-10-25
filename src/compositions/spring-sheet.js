// spring-sheet — the springSheet showcase: a dock bar that springs
// open into a full sheet, icons popping in one by one as it opens,
// then collapsing back to the dock. Silent, 16:9, hard cuts —
// the sheet is the whole film, so the stage stays plain and the
// bounce reads.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 180 },
  render(frame, stage) {
    const M = window.Motion;
    const CREAM = '#FBF6EC', INK = '#26221F';
    const TUNE = { at: 30, closeAt: 140, dockH: 72, openH: 460 };
    const icons = [
      { glyph: '★', color: '#FFD93D' },
      { glyph: '♪', color: '#57C7D4' },
      { glyph: '♥', color: '#FF6B81' },
      { glyph: '●', color: '#4ED06A' },
    ];
    const sheet = M.springSheet(frame, {
      x: 340, bottom: 720, w: 600, h: TUNE.openH, dockH: TUNE.dockH,
      at: TUNE.at, closeAt: TUNE.closeAt, icons, stagger: 5, iconSize: 64,
      color: '#FFFFFF', dockColor: '#EDE8DC', radius: 28,
    });
    const dockLabel = '<div style="position:absolute;left:0;right:0;top:' +
      (720 - TUNE.dockH + 22) + 'px;text-align:center;font:700 22px system-ui;' +
      'letter-spacing:6px;color:#8A8272;">SHEET</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>' +
      '<div style="position:absolute;left:0;right:0;top:52px;text-align:center;">' +
      '<div style="font:800 64px system-ui;color:' + INK + ';letter-spacing:-1px;">Spring Sheet.</div>' +
      '<div style="font:600 24px system-ui;color:#8A8272;margin-top:6px;">dock → spring open → icons pop in → back to dock</div></div>' +
      '<div style="position:absolute;left:0;right:0;top:190px;text-align:center;">' +
      '<span style="display:inline-block;background:#16171A;color:#F5F1E8;font:500 22px ui-monospace,Menlo,monospace;' +
      'padding:12px 26px;border-radius:999px;">M.springSheet(frame, { at, closeAt, icons, stagger })</span></div>' +
      sheet + dockLabel;
  },
};
