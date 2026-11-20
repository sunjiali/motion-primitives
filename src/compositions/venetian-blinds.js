// venetian-blinds — the classic blinds transition: the hero word
// arrives in eight simultaneous slats, the sub-line wipes in
// top-down on twelve, and the whole stage closes behind blinds at
// the end — one primitive, both directions.
// Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">BLINDS</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">eight slats, one wipe</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">VENETIAN BLINDS</div>';
    const all =
      title +
      M.venetianBlinds(frame, { html: word, at: 10, dur: 30, slats: 8 }) +
      M.venetianBlinds(frame, { html: sub, at: 55, dur: 30, slats: 12, dir: 'down' }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.venetianBlinds(frame, { slats: 8 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      M.venetianBlinds(frame, { html: all, at: 110, dur: 40, mode: 'out', slats: 8 });
  },
};
