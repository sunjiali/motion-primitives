# X motion sweep — 2026-10-21 round 2 (22:06 round, backlog exhausted)

Second sweep tonight, rotated query batches (round 1 used motion graphics
techniques / animation breakdown / GSAP tips / Remotion / isometric /
spring physics / text animation / Lottie / easing / kinetic typography /
SVG draw). Coverage caveat (unchanged): `social.search` indexes
Instagram/Threads/Facebook only — it does not index X. One X-targeted
`browser.search` query returned CSS-tutorials blogs, no genuine X post.
So: partial coverage again; no fabricated posts or engagement numbers.

## Queries used

social.search batch A (3 queries):
- "velocity skew animation UI motion" / "morphing shape SVG animation technique" / "glitch animation technique code tutorial"

social.search batch B (3 queries):
- "3D tilt card animation hover technique" / "particle burst explosion animation code" / "scroll triggered animation breakdown thread"

browser.search (X-targeted): "x.com" skew shake animation velocity skew
technique motion design thread → mostly CSS shake tutorials, unused-css
blog, MDN — no genuine X thread.

## What was found

### Candidate 1: `velocitySkew` — ACCEPTED (becomes backlog #1)
Skew proportional to velocity during a move (top of the element lags
behind the direction of motion — the "speed lines" feel), plus the
decaying ±skew impact oscillation. Sources:
- Niek Pronk (@niek_pronk, Sr. Motion Designer at Bakken & Baeck) reel
  https://www.instagram.com/reel/DYEiGFGOrlT/ — AE Skew animator on
  variable-font type, with the centering trick: link Position X to
  skew × −2 so the skewed text stays centered (AE skews about the
  layer's anchor point, which for text sits at the leading edge).
- CapCut "Skew Shake" edit style
  https://www.instagram.com/reel/DZmsR-bMn9H/ — skew as a punchy
  transition effect: speed-curved clips, ±10° rotation keyframes,
  Skew Shake animation, motion blur.
- Skew-shake keyframes (decay ±15° over ~20% of the cycle):
  https://unused-css.com/blog/css-shake-animation/
Dedup: no skew primitive exists in index.d.ts (shake/wiggle are
translation/rotation; smear covers motion-blur ghosts). Novel: yes.

### Candidate 2: `noiseGlow` — ACCEPTED (backlog #2, lower priority)
Procreate Dreams animated-glow workflow by Manon Louart
https://www.instagram.com/reel/DWgYWGhCDcF/ — animatable noise on a
mask, luminance-mask duplicate, color-dodge composite, gaussian blur
under-layer, flipbook sparkle bursts where the light hits. Maps to a
frame-pure pipeline: hash-driven noise mask + additive glow composite
+ seeded sparkle bursts. Visual-craft heavy; deprioritized behind
velocitySkew.

### Rejected (deduped or out of scope)
- Odometer / price-roll toggle (zeeuiux pack
  https://www.instagram.com/p/DehXP1FgIzI/) → `counterRoll` already
  ships the digit-roll with stagger.
- Icon morph with spring physics (Morphicons
  https://www.morphicons.com/, from
  https://www.facebook.com/reel/1034607756145855/) → `morphShape` +
  `morphPoly` already cover point-interpolated shape morphing.
- Type morph (pixrate_ old-fashioned morph-type AE workflow
  https://www.instagram.com/pixrate_) → `morphPoly` covers arbitrary
  path morphs; letterform morphing is tooling territory.
- 3D card tilt/hover reels (~10 tutorials, e.g. @designcodewithav gooey
  tilt, @iron.coding flip card) → hover-driven interactivity, not
  frame-pure video primitives; the gooey-fill variant is CSS-filter
  tooling.
- Before/after drag slider (zeeuiux pack) → interaction widget, not a
  video primitive; wipeReveal covers the motion half.
- Scroll-triggered exploded-view (santhoshdesign reel) → scroll-driven,
  AI-generated frame sequences; out of scope.
- Figma Motion Beta / swishy.ai / ripplix / jitter.video → tooling,
  no implementable technique.
- "6 ANIMATION MISTAKES" (@motion_ui_interface reel) → validates our
  duration/easing discipline (≤250ms, ease-out, transform-only);
  no new primitive.
- Glitch-build AE tutorial (fractal-noise map + displacement + RGB
  split) → `glitch` ships slices + channel-split; noise-mapped
  displacement is a possible later variant, not tonight.

## Skill leads (GitHub — research, not implemented tonight)
- greensock/gsap-skills — official GSAP instruction modules
  (gsap-core/timeline/scrolltrigger/plugins/react/performance/utils/
  frameworks). All GSAP plugins incl. SplitText/MorphSVG/DrawSVG are
  free since the Webflow acquisition. Easing/timeline recipe source;
  evaluate overlap with the motion-video skill before wrapping.
- LottieFiles/motion-design-skill — universal motion-design principles
  for agents (12 Disney principles for UI, duration/easing tables).
  Philosophy layer; overlaps our motion-design wrapper (haidrrrry).
- systembuiltbyaj/motion-director — kinetic-typography system +
  deterministic GSAP helpers + local SFX; motion grammar: 8-frame snap
  entrances, an event every ~0.5s, 60fps, jump-scan QA for frame pops.
  Grammar matches our director discipline; jump-scan is a QA idea for
  the render pipeline, not a primitive.
- ouerf-man/product-launch-motion-skill — launch-video skill,
  HyperFrames+GSAP.
- frankxai/awesome-motion-design-agent-skills — curated map of motion
  agent skills (GSAP/Motion/Remotion/Lottie/Rive).
- iart-ai/motion-design-skills, whaleyxbt/claude-motion,
  howseen-ai/claude-motion-design, charlie947/motion-graphics-skills,
  Barty-Bart/motion-graphics, Sunwood-ai-labs/hyperframes-motion-reel-skill
  — listed in the trinhstudio roundup
  https://trinhstudio.com/inside/claude-motion-graphics-repos-2026;
  candidates for future evaluation.
