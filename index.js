'use strict';

/**
 * motion-primitives — Node entry point.
 *
 * In the browser, src/lib/*.js attach `Motion` (alias `M`) and `Remotion`
 * to window. In Node they attach to globalThis instead; this module loads
 * them in dependency order and re-exports the namespaces, plus the SFX
 * synthesizer (src/sfx.js, Node-only).
 *
 *   const M = require('@sunjiali/motion-primitives');
 *   const html = M.dot({ x: 100, y: 100, r: 40, color: '#FF8A4C',
 *                        scale: M.pop(42, { at: 30 }) });
 */

require('./src/lib/animation.js');
require('./src/lib/primitives.js');

const Motion = globalThis.Motion;

module.exports = Motion;
module.exports.Motion = Motion;
module.exports.Remotion = globalThis.Remotion;
module.exports.sfx = require('./src/sfx.js');
