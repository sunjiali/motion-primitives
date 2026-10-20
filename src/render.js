#!/usr/bin/env node
/**
 * mini-remotion —— 从零复刻 Remotion 核心机制
 *
 * 机制（对照 Remotion 源码逆向结论）：
 *   renderMedia      -> main()
 *   renderFrames     -> 多 tab 并发截图（--concurrency）
 *   seekToFrame      -> page.evaluate(window.__setFrame(f))
 *   takeFrame        -> page.screenshot()
 *   stitchFramesToVideo -> ffmpeg 图片序列 -> MP4
 *
 * 用法：
 *   node src/render.js --comp demo --out out/demo.mp4 [--concurrency 4] [--audio bgm.mp3]
 *   node src/render.js --comp demo --still 45 --out out/cover.png   # 单帧导出（封面）
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME = '/opt/meta-chromium/chrome';
const SRC = __dirname;

function parseArgs() {
  const a = process.argv.slice(2);
  const o = { comp: 'demo', out: 'out/demo.mp4', concurrency: '2' };
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith('--')) continue;
    const k = a[i].slice(2);
    const v = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : 'true';
    o[k] = v;
  }
  return o;
}

function buildPlayerHtml(compSrc) {
  // libs + composition 全部内联，走 file:// 协议（免 Chrome 本地网络拦截）
  const libs = ['lib/animation.js', 'lib/captions.js', 'lib/primitives.js']
    .map((f) => fs.readFileSync(path.join(SRC, f), 'utf8'))
    .join('\n');
  return fs
    .readFileSync(path.join(SRC, 'player.html'), 'utf8')
    .replace('/*__LIBS__*/', libs)
    .replace('/*__COMPOSITION_CODE__*/', compSrc);
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(cmd + ' exit ' + code + '\n' + err.slice(-500)))));
  });
}

async function main() {
  const t0 = Date.now();
  const opts = parseArgs();
  const compPath = path.join(SRC, 'compositions', opts.comp + '.js');
  if (!fs.existsSync(compPath)) throw new Error('找不到 composition: ' + compPath);

  const playerFile = path.join(process.cwd(), '.player-' + opts.comp + '.html');
  fs.writeFileSync(playerFile, buildPlayerHtml(fs.readFileSync(compPath, 'utf8')));

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=1',
      // 关键：禁止 Chrome 节流后台 tab，否则多 tab 并发时 rAF 不触发导致截图超时
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'],
  });
  try {
    // 元信息以页面为准（单一事实来源）；CLI 可用 --width/--height/--fps/--frames 覆盖
    const probe = await browser.newPage();
    await probe.goto('file://' + playerFile, { waitUntil: 'load' });
    let meta = await probe.evaluate(() => window.__meta);
    await probe.close();
    if (opts.width) meta.width = parseInt(opts.width, 10);
    if (opts.height) meta.height = parseInt(opts.height, 10);
    if (opts.fps) meta.fps = parseInt(opts.fps, 10);
    let frameList = [];
    for (let f = 0; f < meta.durationInFrames; f++) frameList.push(f);
    if (opts.frames) {
      const [s, e] = opts.frames.split('-').map(Number);
      frameList = frameList.filter((f) => f >= s && f <= e);
    }

    // ---- 单帧导出模式（封面图）----
    if (opts.still !== undefined) {
      const f = parseInt(opts.still, 10);
      const page = await browser.newPage();
      await page.goto('file://' + playerFile, { waitUntil: 'load' });
      await page.setViewport({ width: meta.width, height: meta.height, deviceScaleFactor: 1 });
      await page.evaluate((frame) => window.__setFrame(frame), f);
      const out = path.resolve(opts.out);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await page.screenshot({ path: out });
      console.log(`[mini-remotion] 单帧导出：${out}（第 ${f} 帧）`);
      return;
    }

    // ---- 多浏览器进程并发截图 ----
    // 注意：不用"一个浏览器开 N 个 tab"，因为多 tab 共享软件合成器，
    // 高频截图时 Page.captureScreenshot 会超时。每个 worker 独立浏览器进程。
    const concurrency = Math.max(1, parseInt(opts.concurrency, 10));
    const framesDir = path.join(process.cwd(), '.frames-' + opts.comp);
    fs.rmSync(framesDir, { recursive: true, force: true });
    fs.mkdirSync(framesDir, { recursive: true });
    const workers = [];
    for (let i = 0; i < concurrency; i++) {
      const browser = await puppeteer.launch({
        executablePath: CHROME,
        protocolTimeout: 120000,
        args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=1',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'],
      });
      const page = await browser.newPage();
      await page.goto('file://' + playerFile, { waitUntil: 'load' });
      await page.setViewport({ width: meta.width, height: meta.height, deviceScaleFactor: 1 });
      workers.push({ browser, page });
    }
    console.log(`[mini-remotion] ${meta.width}x${meta.height} @${meta.fps}fps, ${frameList.length} 帧，并发 ${concurrency}（独立浏览器进程）`);
    let done = 0;
    // 注意：每个 worker 的页面是"有状态"的（__setFrame 直接改 DOM），同一 worker 的
    // 帧任务必须串行执行，否则任务 A 的 seek(f1)→screenshot 之间会被任务 B 的
    // seek(f2) 插队，导致截到错帧（如字幕出现在不该出现的帧）。per-worker promise
    // 链做互斥；worker 之间仍保持并发。
    const workerLocks = workers.map(() => Promise.resolve());
    await Promise.all(frameList.map((f, i) => {
      const w = i % concurrency;
      const { page } = workers[w];
      const task = workerLocks[w].then(async () => {
        await page.evaluate((frame) => window.__setFrame(frame), f); // = seekToFrame
        await page.screenshot({ path: path.join(framesDir, `f-${String(f).padStart(4, '0')}.png`) }); // = takeFrame
        done++;
        if (done % 30 === 0 || done === frameList.length) process.stdout.write(`\r  截图 ${done}/${frameList.length}`);
      });
      workerLocks[w] = task.catch(() => {}); // 链条不断，错误仍向上传递给 Promise.all
      return task;
    }));
    console.log('\n[mini-remotion] 截图完成，ffmpeg 缝合中…');

    // ---- ffmpeg 缝合 ----
    const out = path.resolve(opts.out);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const tmpVideo = out + '.tmp.mp4';
    await run('ffmpeg', ['-y', '-framerate', String(meta.fps), '-i', path.join(framesDir, 'f-%04d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', tmpVideo]);
    if (opts.audio) {
      // 音频轨混流（对应 Remotion 的音频处理）
      await run('ffmpeg', ['-y', '-i', tmpVideo, '-i', path.resolve(opts.audio),
        '-c:v', 'copy', '-c:a', 'aac', '-shortest', out]);
      fs.rmSync(tmpVideo, { force: true });
    } else {
      fs.renameSync(tmpVideo, out);
    }
    const size = (fs.statSync(out).size / 1024).toFixed(0);
    console.log(`[mini-remotion] 完成：${out} (${size} KB, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    fs.rmSync(framesDir, { recursive: true, force: true });
  } finally {
    await browser.close();
    if (typeof workers !== 'undefined') {
      await Promise.all(workers.map((w) => w.browser.close().catch(() => {})));
    }
    fs.rmSync(playerFile, { force: true });
  }
}

main().catch((e) => { console.error('[mini-remotion] 失败:', e.message); process.exit(1); });
