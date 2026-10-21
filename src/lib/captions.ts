// mini-remotion 字幕库（浏览器端）
// 用法：
//   const caps = Remotion.parseSRT(srt文本, fps);
//   Remotion.renderCaption(frame, stage, caps);  // 每帧调用，自动显示当前字幕
window.Remotion = window.Remotion || {};

(function () {
  function toSeconds(ts: string): number {
    // "00:00:01,500" 或 "00:00:01.500"
    const m = ts.replace(',', '.').match(/(\d+):(\d+):([\d.]+)/);
    if (!m) throw new Error('parseSRT: bad timestamp ' + ts);
    return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseFloat(m[3]);
  }

  // 返回 [{ startFrame, endFrame, text }]
  function parseSRT(srt: string, fps: number): CaptionCue[] {
    const out: CaptionCue[] = [];
    const blocks = srt.trim().split(/\n\s*\n/);
    for (const b of blocks) {
      const lines = b.trim().split('\n');
      if (lines.length < 2) continue;
      const tm = lines[1].match(/(.+?)\s*-->\s*(.+)/);
      if (!tm) continue;
      out.push({
        startFrame: Math.floor(toSeconds(tm[1].trim()) * fps),
        endFrame: Math.ceil(toSeconds(tm[2].trim()) * fps),
        text: lines.slice(2).join('\n'),
      });
    }
    return out;
  }

  // 在舞台底部绘制当前帧的字幕（无字幕时清空）
  function renderCaption(frame: number, stage: HTMLElement, captions: CaptionCue[], style?: CaptionStyle): void {
    style = style || {};
    let el = stage.querySelector('[data-mr-caption]') as HTMLElement | null;
    const cap = captions.find((c) => frame >= c.startFrame && frame <= c.endFrame);
    if (!cap) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('data-mr-caption', '1');
      el.style.cssText =
        'position:absolute;left:0;right:0;bottom:' + (style.bottom || '48px') + ';' +
        'text-align:center;pointer-events:none;';
      stage.appendChild(el);
    }
    el.innerHTML =
      '<span style="display:inline-block;max-width:80%;padding:10px 22px;' +
      'background:rgba(0,0,0,' + (style.bgOpacity == null ? 0.65 : style.bgOpacity) + ');' +
      'color:' + (style.color || '#fff') + ';' +
      'font:' + (style.font || '600 40px sans-serif') + ';line-height:1.4;border-radius:12px;">' +
      cap.text.replace(/\n/g, '<br>') + '</span>';
  }

  window.Remotion.parseSRT = parseSRT;
  window.Remotion.renderCaption = renderCaption;
})();
