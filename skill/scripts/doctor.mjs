#!/usr/bin/env node
/* motion skill preflight: Node >= 18, Chrome/Chromium, ffmpeg, the
 * bundled runtime, and the one npm dependency. Prints a friendly
 * verdict per line; exit 1 when a hard requirement is missing. */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findChrome } from './chrome.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const ok = (msg) => console.log('  ✓ ' + msg);
const bad = (msg, fix) => { failures++; console.log('  ✗ ' + msg + (fix ? `\n      fix: ${fix}` : '')); };
const warn = (msg, fix) => console.log('  ! ' + msg + (fix ? `\n      fix: ${fix}` : ''));

console.log('motion skill — environment check');

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor >= 18) ok(`Node ${process.versions.node}`);
else bad(`Node ${process.versions.node} is too old`, 'install Node.js 18 or newer');

try {
  const v = execSync('ffmpeg -version', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n')[0];
  ok(v.replace('ffmpeg version ', 'ffmpeg '));
} catch {
  bad('ffmpeg not found on PATH', 'install ffmpeg (brew install ffmpeg / apt install ffmpeg / winget install ffmpeg)');
}

const chrome = findChrome();
if (chrome) ok(`Chrome: ${chrome}`);
else bad('no Chrome/Chromium found', 'install Chrome, or set CHROME_PATH to the browser binary');

const runtimeFiles = [
  'runtime/index.js',
  'runtime/src/render.js',
  'runtime/src/record.js',
  'runtime/src/sfx.js',
  'runtime/src/player.html',
  'runtime/src/lib/animation.js',
  'runtime/src/lib/captions.js',
  'runtime/src/lib/primitives.js',
  'runtime/src/compositions/hello-motion.js',
];
const missing = runtimeFiles.filter((f) => !fs.existsSync(path.join(root, f)));
if (missing.length === 0) ok('bundled runtime complete');
else bad(`runtime files missing: ${missing.join(', ')}`, 're-download or re-copy the skill folder');

if (fs.existsSync(path.join(root, 'node_modules', 'puppeteer-core'))) ok('puppeteer-core installed');
else warn('puppeteer-core not installed yet', 'run: npm install');

console.log(failures === 0 ? '\nReady. Try: node scripts/render.mjs --comp hello-motion --still 45 --out /tmp/hello.png' : `\n${failures} problem(s) to fix first.`);
process.exit(failures === 0 ? 0 : 1);
