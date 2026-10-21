#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * record.ts — 把「活网页」录成 MP4：交互式图（如 anatomy 的等距
 * 机械图）、动效页面、WebGL 演示。它不是帧纯函数 composition，
 * 而是被导演的真实页面：鼠标滑行 + 定时按键都写在命令行里，
 * 页面自己的模型驱动运动，录制只负责忠实地拍下来。
 *
 * 两种模式：
 *   cast（默认）— 实时录屏（CDP screencast）：合成器直出帧，
 *     按真实时间戳缝合。任何页面都能录，包括主线程很重的。
 *   virtual — 虚拟时间：浏览器时钟一次走一帧（1/fps 秒），
 *     逐帧截图。完全确定性、可复现，但主线程会饿死队列的页面
 *     （重型审计/物理循环）会卡住——卡住 20 秒自动报错并提示
 *     改用 cast。
 *
 * 用法：
 *   node src/record.js --url <页面 file:// 或 https://> --out out.mp4
 *     [--seconds 6] [--fps 30] [--mode cast|virtual]
 *     [--mouse "x1,y1>x2,y2"]   全程把鼠标从起点滑到终点
 *     [--keys "3.8:i,5:Space"]  在第 N 秒按键（支持组合名原样透传）
 *     [--width 1280] [--height 720] [--draft]
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const child_process_1 = require("child_process");
const puppeteer = require("puppeteer-core");
const CHROME = process.env.CHROME_PATH || '/opt/meta-chromium/chrome';
function parseArgs() {
    const a = process.argv.slice(2);
    const out = {};
    for (let i = 0; i < a.length; i++) {
        if (a[i].startsWith('--')) {
            const k = a[i].slice(2);
            out[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : 'true';
        }
    }
    return out;
}
function run(cmd, args) {
    return new Promise((resolve, reject) => {
        const p = (0, child_process_1.spawn)(cmd, args, { stdio: 'inherit' });
        p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(cmd + ' exited ' + code))));
        p.on('error', reject);
    });
}
function parseMouse(spec) {
    if (!spec)
        return null;
    const m = spec.match(/^(-?[\d.]+),(-?[\d.]+)>(-?[\d.]+),(-?[\d.]+)$/);
    if (!m)
        throw new Error('--mouse 格式应为 "x1,y1>x2,y2"，收到: ' + spec);
    return { from: [parseFloat(m[1]), parseFloat(m[2])], to: [parseFloat(m[3]), parseFloat(m[4])] };
}
function parseKeys(spec) {
    if (!spec)
        return [];
    return spec.split(',').map((part) => {
        const idx = part.lastIndexOf(':');
        if (idx < 0)
            throw new Error('--keys 格式应为 "秒:键名,..."，收到: ' + part);
        return { at: parseFloat(part.slice(0, idx)), key: part.slice(idx + 1) };
    });
}
function glidePos(g, p) {
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // cubicInOut
    return [g.from[0] + (g.to[0] - g.from[0]) * e, g.from[1] + (g.to[1] - g.from[1]) * e];
}
function codecArgs(draft) {
    return draft
        ? ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '23']
        : ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-tune', 'film',
            '-crf', '16', '-profile:v', 'high', '-x264-params', 'aq-mode=3:deblock=-1,-1',
            '-movflags', '+faststart'];
}
async function recordVirtual(page, cdp, o, framesDir) {
    const total = Math.round(o.seconds * o.fps);
    const stepOnce = async (ms) => {
        const expired = new Promise((r) => cdp.once('Emulation.virtualTimeBudgetExpired', r));
        const watchdog = new Promise((_r, rej) => setTimeout(() => rej(new Error('虚拟时间推进超时——这个页面的主线程在虚拟时钟下饿死了队列。改用 --mode cast（实时录屏）。')), 20000));
        await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: ms });
        await Promise.race([expired, watchdog]);
    };
    const fired = new Set();
    await stepOnce(1); // 进入虚拟时间
    for (let f = 0; f < total; f++) {
        const t = f / o.fps;
        if (o.mouse) {
            const [x, y] = glidePos(o.mouse, total <= 1 ? 0 : f / (total - 1));
            await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        }
        for (let i = 0; i < o.keys.length; i++) {
            if (!fired.has(i) && t >= o.keys[i].at) {
                fired.add(i);
                const key = o.keys[i].key;
                await page.keyboard.press(key);
            }
        }
        await page.screenshot({ path: path.join(framesDir, 'f' + String(f).padStart(4, '0') + '.png') });
        await stepOnce(1000 / o.fps);
    }
    await run('ffmpeg', ['-y', '-framerate', String(o.fps), '-i', path.join(framesDir, 'f%04d.png'),
        ...codecArgs(o.draft), o.out]);
}
async function recordCast(page, cdp, o, framesDir) {
    const frames = [];
    cdp.on('Page.screencastFrame', async (ev) => {
        frames.push({ ts: ev.metadata.timestamp, data: ev.data });
        try {
            await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId });
        }
        catch { /* 收尾中 */ }
    });
    await cdp.send('Page.startScreencast', { format: 'png', maxWidth: o.width, maxHeight: o.height, everyNthFrame: 1 });
    const t0 = Date.now();
    const timers = [];
    if (o.mouse) {
        const iv = setInterval(() => {
            const t = (Date.now() - t0) / 1000;
            const [x, y] = glidePos(o.mouse, Math.min(t / o.seconds, 1));
            page.mouse.move(x, y).catch(() => { });
        }, 50);
        timers.push(iv);
    }
    for (const k of o.keys) {
        timers.push(setTimeout(() => { page.keyboard.press(k.key).catch(() => { }); }, k.at * 1000));
    }
    await new Promise((r) => setTimeout(r, o.seconds * 1000));
    for (const t of timers) {
        clearTimeout(t);
        clearInterval(t);
    }
    await cdp.send('Page.stopScreencast').catch(() => { });
    if (frames.length < 2)
        throw new Error('录屏没有拿到帧——页面可能全程静止（合成器只在画面变化时出帧）。');
    frames.forEach((fr, i) => {
        fs.writeFileSync(path.join(framesDir, 'f' + String(i).padStart(4, '0') + '.png'), Buffer.from(fr.data, 'base64'));
    });
    const lines = [];
    for (let i = 0; i < frames.length; i++) {
        const d = i + 1 < frames.length ? frames[i + 1].ts - frames[i].ts : 1 / o.fps;
        lines.push(`file 'f${String(i).padStart(4, '0')}.png'`);
        lines.push('duration ' + Math.max(0.005, Math.min(d, 0.25)).toFixed(4));
    }
    const concatPath = path.join(framesDir, 'concat.txt');
    fs.writeFileSync(concatPath, lines.join('\n') + '\n');
    await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concatPath,
        '-vf', 'fps=' + o.fps, ...codecArgs(o.draft), o.out]);
}
async function main() {
    const opts = parseArgs();
    if (opts.help) {
        console.log('用法: node src/record.js --url <页面> --out out.mp4 [--seconds 6] [--fps 30] [--mode cast|virtual] [--mouse "x1,y1>x2,y2"] [--keys "3.8:i"] [--width 1280] [--height 720] [--draft]');
        return;
    }
    if (!opts.url)
        throw new Error('缺少 --url（要录的页面，file:// 或 https://）');
    const o = {
        url: opts.url,
        out: path.resolve(opts.out || 'out/record.mp4'),
        seconds: parseFloat(opts.seconds || '6'),
        fps: parseInt(opts.fps || '30', 10),
        mode: opts.mode || 'cast',
        mouse: parseMouse(opts.mouse),
        keys: parseKeys(opts.keys),
        width: parseInt(opts.width || '1280', 10),
        height: parseInt(opts.height || '720', 10),
        draft: opts.draft === 'true',
    };
    if (o.mode !== 'cast' && o.mode !== 'virtual')
        throw new Error('--mode 只支持 cast 或 virtual');
    fs.mkdirSync(path.dirname(o.out), { recursive: true });
    const framesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-record-'));
    const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox'], protocolTimeout: 120000 });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: o.width, height: o.height });
        await page.goto(o.url, { waitUntil: 'networkidle0', timeout: 90000 });
        await new Promise((r) => setTimeout(r, 800));
        const cdp = await page.createCDPSession();
        console.log(`[motion-primitives] 录制中（${o.mode}，${o.seconds}s）…`);
        if (o.mode === 'virtual')
            await recordVirtual(page, cdp, o, framesDir);
        else
            await recordCast(page, cdp, o, framesDir);
        console.log('[motion-primitives] 完成：' + o.out);
    }
    finally {
        await browser.close();
        fs.rmSync(framesDir, { recursive: true, force: true });
    }
}
main().catch((e) => { console.error('[motion-primitives] 录制失败：' + e.message); process.exit(1); });
