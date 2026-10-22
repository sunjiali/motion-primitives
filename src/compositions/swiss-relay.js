// swiss-relay — a Swiss International Style study built on ONE new
// primitive: relay. Paper #F5F4F0, black #111111, grey #7A7A78, and a
// single accent — Swiss red #E30613 — carried by one hero block that
// never leaves the stage: it relays across every scene cut, sliding
// and morphing from pose to pose (square → wide bar → big square →
// tall column → home). Grid first (12 × 6, hairlines shown), flush
// left, square corners, hierarchy by size and weight only.
//
// TUNE — beat-locked cuts (after @guanmo_ai's Swiss Style film):
//   BPM 120 · fps 30 · framesPerBeat = 15 · scene = 4 beats = 60 f
//   scene boundaries (the beats array) = 0 / 60 / 120 / 180 / 240 —
//   every cut and every relay key lands exactly on a beat.
// Silent, 16:9, hard cuts only.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 240 },
  render(frame, stage) {
    const M = window.Motion;
    const TUNE = { bpm: 120, fps: 30, framesPerBeat: 15, beats: [0, 60, 120, 180, 240] };
    const PAPER = '#F5F4F0', INK = '#111111', GREY = '#7A7A78', RED = '#E30613';

    // 12 × 6 grid hairlines, drawn only as a teaching overlay.
    let grid = '<svg style="position:absolute;left:0;top:0;" width="1280" height="720">';
    for (let c = 1; c < 12; c++) {
      const x = (c * 1280 / 12).toFixed(1);
      grid += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="720" stroke="rgba(17,17,17,.09)" stroke-width="1"/>';
    }
    for (let r = 1; r < 6; r++) {
      const y = r * 120;
      grid += '<line x1="0" y1="' + y + '" x2="1280" y2="' + y + '" stroke="rgba(17,17,17,.09)" stroke-width="1"/>';
    }
    grid += '</svg>';

    // THE RELAY — one red hero, five poses, every key on a beat.
    const hero = M.relay(frame, {
      keys: [
        { at: TUNE.beats[0], x: 970, y: 80, w: 190, h: 190 },
        { at: TUNE.beats[1], x: 90, y: 470, w: 760, h: 95 },
        { at: TUNE.beats[2], x: 90, y: 130, w: 340, h: 340 },
        { at: TUNE.beats[3], x: 1030, y: 110, w: 160, h: 460 },
        { at: TUNE.beats[4], x: 970, y: 80, w: 190, h: 190 },
      ],
    });
    const heroHtml = '<div style="position:absolute;left:' + hero.x.toFixed(1) + 'px;top:' + hero.y.toFixed(1) +
      'px;width:' + hero.w.toFixed(1) + 'px;height:' + hero.h.toFixed(1) + 'px;background:' + RED + ';"></div>';

    const label = (txt, x, y) =>
      '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;font:600 19px system-ui;color:' + GREY + ';letter-spacing:3px;">' + txt + '</div>';
    const big = (lines, x, y, size) =>
      '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;font:800 ' + size + 'px/1.02 system-ui;color:' + INK + ';letter-spacing:-2px;">' +
      lines.join('<br>') + '</div>';
    const rule = (x, y, w) =>
      '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:3px;background:' + INK + ';"></div>';

    // Beat squares: 16 beats, filled as they pass.
    let ticks = '';
    const beatNow = Math.floor(frame / TUNE.framesPerBeat);
    for (let b = 0; b < 16; b++) {
      ticks += '<div style="position:absolute;left:' + (90 + b * 22) + 'px;top:676px;width:10px;height:10px;background:' +
        (b <= beatNow ? INK : 'rgba(17,17,17,.18)') + ';"></div>';
    }
    const foot = '<div style="position:absolute;left:1010px;top:672px;font:600 15px ui-monospace,monospace;color:' + GREY + ';">M.relay(frame, { keys })</div>';

    let s = '<div style="position:absolute;inset:0;background:' + PAPER + ';"></div>' + grid;
    if (frame < TUNE.beats[1]) {
      s += label('01 · GRID FIRST — RASTER', 90, 84) +
        big(['Swiss', 'Style'], 86, 128, 150) +
        rule(90, 470, 420) +
        '<div style="position:absolute;left:90px;top:492px;font:400 26px system-ui;color:' + INK + ';">International Typographic Style, 1957 —<br>one grid, one typeface, one red.</div>';
    } else if (frame < TUNE.beats[2]) {
      // Text parks top-right: the relay runs the left column and the
      // bottom bar, so this block is never crossed.
      s += label('02 · ONE HERO PER SCENE', 724, 84) +
        big(['The red', 'never leaves.'], 720, 128, 80) +
        rule(724, 316, 300) +
        '<div style="position:absolute;left:724px;top:340px;font:400 26px system-ui;color:' + INK + ';">No wipes, no fades —<br>the hero itself carries the cut.</div>';
    } else if (frame < TUNE.beats[3]) {
      // Text parks bottom-left / bottom-right: the relay crosses
      // the upper middle on its way to the right-hand column.
      s += label('03 · SQUARE — SACHLICHKEIT', 90, 462) +
        big(['No rounded', 'corners.'], 86, 492, 76) +
        '<div style="position:absolute;left:560px;top:536px;font:400 26px system-ui;color:' + INK + ';">Flush left, ragged right.<br>Hierarchy by size and weight only.</div>';
    } else {
      s += label('04 · EVERY CUT ON A BEAT', 90, 84) +
        big(['120 BPM.', '15 frames', 'per beat.'], 86, 128, 110) +
        '<div style="position:absolute;left:90px;top:520px;font:400 26px system-ui;color:' + INK + ';">swiss-relay · a design-style study after @guanmo_ai</div>';
    }
    stage.innerHTML = s + heroHtml + ticks + foot;
  },
};
