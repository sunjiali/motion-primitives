// flap-board — an airport departures board built on ONE new primitive:
// splitFlap. Every cell of the board cycles through an ordered charset
// and clacks into place; mid-film the board UPDATES (a status re-flaps
// from blank to its new value), the way real Solari boards do.
// Near-black hall, amber accents, mono type. Silent, 16:9, hard cuts.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 360 },
  render(frame, stage) {
    const M = window.Motion;
    const BG = '#0E0F12', PANEL = '#15171B', LINE = '#26292F';
    const TXT = '#E8E4D8', DIM = '#8A8F98', AMBER = '#FFD94D', RED = '#FF7A6B', GREEN = '#9BD97A';

    function seg(x, y, w, str, at, color, size) {
      return '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;' +
        'font:700 ' + (size || 34) + 'px ui-monospace,Menlo,monospace;color:' + (color || TXT) + ';letter-spacing:2px;white-space:pre;">' +
        M.splitFlap(frame, { at, text: str }) + '</div>';
    }
    function row(y, at, time, flight, dest, status, statusColor, statusAt) {
      return '<div style="position:absolute;left:90px;top:' + y + 'px;width:1100px;height:84px;background:' + PANEL + ';border:2px solid ' + LINE + ';border-radius:10px;"></div>' +
        seg(130, y + 24, 130, time, at, DIM) +
        seg(280, y + 24, 180, flight, at + 6, TXT) +
        seg(480, y + 24, 400, dest, at + 12, TXT) +
        seg(910, y + 24, 260, status, statusAt == null ? at + 18 : statusAt, statusColor);
    }

    // Mid-film updates: row 1 departs, row 2 goes LAST CALL — each status
    // re-flaps from blank at its update frame.
    const s1 = frame >= 255 ? ['DEPARTED', GREEN, 255] : ['ON TIME', GREEN, 28];
    const s2 = frame >= 215 ? ['LAST CALL', RED, 215] : ['BOARDING', AMBER, 58];

    stage.innerHTML = '' +
      '<div style="position:absolute;inset:0;background:' + BG + ';"></div>' +
      '<div style="position:absolute;left:90px;top:56px;font:800 40px ui-monospace,Menlo,monospace;color:' + TXT + ';letter-spacing:6px;">DEPARTURES</div>' +
      '<div style="position:absolute;left:560px;top:70px;font:700 24px \'PingFang SC\',sans-serif;color:' + DIM + ';letter-spacing:10px;">出 发</div>' +
      '<div style="position:absolute;right:90px;top:66px;font:700 26px ui-monospace,Menlo,monospace;color:' + AMBER + ';">SHANGHAI · ' + M.splitFlap(frame, { at: 4, text: 'OCT 22' }) + '</div>' +
      '<div style="position:absolute;left:130px;top:140px;font:700 19px ui-monospace,Menlo,monospace;color:' + DIM + ';letter-spacing:3px;">TIME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FLIGHT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DESTINATION&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STATUS</div>' +
      row(180, 10, '0840', 'MU5137', 'BEIJING', s1[0], s1[1], s1[2]) +
      row(284, 40, '0915', 'CA1832', 'SHENZHEN', s2[0], s2[1], s2[2]) +
      row(388, 70, '0950', 'HO1253', 'CHENGDU', 'DELAYED', RED, 88) +
      row(492, 100, '1020', 'FM9105', 'XIAMEN', 'ON TIME', GREEN, 118) +
      '<div style="position:absolute;left:0;bottom:34px;width:1280px;text-align:center;font:600 17px ui-monospace,Menlo,monospace;color:' + DIM + ';letter-spacing:2px;">splitFlap · motion-primitives</div>';
  },
};
