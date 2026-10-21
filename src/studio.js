#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * motion-primitives Studio —— 生成自包含的预览 HTML
 * 用法：node src/studio.js --comp demo --out studio-demo.html
 * 打开后可播放/暂停/拖动 scrub，直接在手机浏览器里看效果。
 */
const fs = require("fs");
const path = require("path");
const SRC = __dirname;
function arg(k, d) {
    const i = process.argv.indexOf('--' + k);
    return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
}
const comp = arg('comp', 'demo');
const out = path.resolve(arg('out', `studio-${comp}.html`));
const compSrc = fs.readFileSync(path.join(SRC, 'compositions', comp + '.js'), 'utf8');
const libs = ['lib/animation.js', 'lib/captions.js']
    .map((f) => fs.readFileSync(path.join(SRC, f), 'utf8'))
    .join('\n');
const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>motion-primitives Studio — ${comp}</title>
<style>
  body { margin: 0; font-family: sans-serif; background: #141414; color: #eee; }
  #wrap { max-width: 960px; margin: 0 auto; padding: 16px; }
  #stage { position: relative; overflow: hidden; background: #fff; width: 100%; aspect-ratio: 16/9; }
  #stage > div { transform-origin: top left; }
  #bar { display: flex; gap: 12px; align-items: center; margin-top: 12px; }
  #seek { flex: 1; }
  button { padding: 8px 18px; font-size: 15px; border-radius: 8px; border: 0; background: #4f8cff; color: #fff; }
  #info { font-size: 13px; color: #999; margin-top: 8px; }
</style></head>
<body><div id="wrap">
<div id="stage"></div>
<div id="bar">
  <button id="play">▶ 播放</button>
  <input id="seek" type="range" min="0" value="0">
  <span id="frame">0</span>
</div>
<div id="info"></div>
</div>
<script>${libs}</script>
<script>${compSrc}</script>
<script>
  const stage = document.getElementById('stage');
  const meta = window.Composition.meta;
  const seek = document.getElementById('seek');
  const frameEl = document.getElementById('frame');
  const playBtn = document.getElementById('play');
  const info = document.getElementById('info');
  seek.max = meta.durationInFrames - 1;
  info.textContent = meta.width + 'x' + meta.height + ' @' + meta.fps + 'fps，共 ' + meta.durationInFrames + ' 帧';
  // 按比例缩放舞台以适应屏幕
  function fit() {
    const s = stage.clientWidth / meta.width;
    stage.style.aspectRatio = meta.width + '/' + meta.height;
    const inner = stage.firstElementChild;
    if (inner) inner.style.transform = 'scale(' + s + ')';
  }
  // 用一个内层 div 承载 composition 的固定尺寸舞台
  const inner = document.createElement('div');
  inner.style.width = meta.width + 'px'; inner.style.height = meta.height + 'px';
  inner.style.position = 'relative';
  stage.appendChild(inner);

  let cur = 0, timer = null;
  async function setFrame(f) {
    cur = Math.max(0, Math.min(meta.durationInFrames - 1, f));
    window.Composition.render(cur, inner);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    seek.value = cur; frameEl.textContent = cur;
  }
  // composition 的 render 期望 stage 参数，这里转交给 inner
  const origRender = window.Composition.render.bind(window.Composition);
  window.Composition.render = (f, stageArg) => origRender(f, inner);

  playBtn.onclick = () => {
    if (timer) { clearInterval(timer); timer = null; playBtn.textContent = '▶ 播放'; return; }
    playBtn.textContent = '⏸ 暂停';
    timer = setInterval(() => {
      let n = cur + 1;
      if (n >= meta.durationInFrames) { n = 0; }
      setFrame(n);
    }, 1000 / meta.fps);
  };
  seek.oninput = () => { if (timer) playBtn.onclick(); setFrame(parseInt(seek.value, 10)); };
  window.addEventListener('resize', fit);
  setFrame(0).then(fit);
</script></body></html>`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('[studio] 已生成：' + out);
