'use strict';
// Parity guards: the surfaces that describe this library — runtime
// exports, TypeScript declarations, the Motion interface, and the site's
// mirrored lib copies — must never drift apart. A stale site copy would
// silently demo old code; a missing declaration makes the package lie.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const M = require(path.join(root, 'index.js')).Motion;

// Attached namespaces/utilities on the export — not primitives.
const NON_PRIMITIVES = new Set(['Motion', 'Remotion', 'sfx', 'Easing', 'clamp01']);

test('runtime exports, index.d.ts functions and the Motion interface agree', () => {
  const dts = fs.readFileSync(path.join(root, 'index.d.ts'), 'utf8');
  const declared = new Set([...dts.matchAll(/export function (\w+)/g)].map((m) => m[1]));
  const ifaceBlock = dts.match(/declare const Motion: \{([\s\S]*?)\n\};/);
  assert.ok(ifaceBlock, 'Motion object type not found in index.d.ts');
  const iface = new Set([...ifaceBlock[1].matchAll(/(\w+): typeof/g)].map((m) => m[1])
    .filter((k) => !NON_PRIMITIVES.has(k)));
  const runtime = new Set(Object.keys(M).filter((k) => !NON_PRIMITIVES.has(k)));
  const only = (a, b) => [...a].filter((k) => !b.has(k));
  assert.deepEqual(only(runtime, declared), [], 'runtime exports missing from index.d.ts');
  assert.deepEqual(only(declared, runtime), [], 'index.d.ts declares functions the runtime lacks');
  assert.deepEqual(only(runtime, iface), [], 'runtime exports missing from the Motion interface');
  assert.deepEqual(only(iface, runtime), [], 'Motion interface lists members the runtime lacks');
});

test('site/lib mirrors src/lib byte for byte', () => {
  const siteLib = path.join(root, 'site', 'lib');
  for (const f of fs.readdirSync(siteLib)) {
    const a = fs.readFileSync(path.join(siteLib, f));
    const b = fs.readFileSync(path.join(root, 'src', 'lib', f));
    assert.ok(a.equals(b), `site/lib/${f} differs from src/lib/${f} — re-copy it`);
  }
});
