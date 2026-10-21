#!/usr/bin/env node
/* Renderer launcher: finds Chrome (sets CHROME_PATH), then runs the
 * bundled renderer with your arguments, from your working directory.
 *   node scripts/render.mjs --comp <name> --out out.mp4 [--still N]
 *                           [--audio score.wav] [--concurrency 4] [--draft] */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome } from './chrome.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const chrome = findChrome();
if (!chrome) {
  console.error('[motion] No Chrome/Chromium found. Install Chrome or set CHROME_PATH to the browser binary.');
  process.exit(1);
}
const env = { ...process.env, CHROME_PATH: chrome };
const child = spawn(process.execPath, [path.join(here, '..', 'runtime', 'src', 'render.js'), ...process.argv.slice(2)], { stdio: 'inherit', env });
child.on('exit', (code) => process.exit(code ?? 1));
