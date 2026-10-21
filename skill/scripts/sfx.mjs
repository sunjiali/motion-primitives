#!/usr/bin/env node
/* SFX launcher: synthesize a sound score into a WAV.
 *   node scripts/sfx.mjs --score <score.json> --out <file.wav> */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const child = spawn(process.execPath, [path.join(here, '..', 'runtime', 'src', 'sfx.js'), ...process.argv.slice(2)], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 1));
