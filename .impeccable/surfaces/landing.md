# Landing showcase redesign

Scope: root index.html and assets/landing/. Visitor mode: Experience.
Purpose: choose a world, see actual procedural 3D immediately, and open a full demo; provide skill installation afterward.

User direction: dislikes the boxes and overlapping outlines on the old landing page. Use an open composition, no decorative drafting grid, no framed gallery cards, generous separation, and live objects as the visual material. All four demos and installation/source/model links remain.

Concept: kinetic object catalog. A spacious introductory statement sits beside a live procedural world; a compact selector switches Aster, Vela, Roo, and Sprout Yard. The catalog below uses real transparent renders of each asset rather than framed screenshots. The footer section explains how to build another world.

FIRST VIEWPORT: light neutral ground; green type and controls; a large two-line headline; an unboxed, soft-shadowed 3D scene; explicit demo selector and opening link. No grid, overlapping outlines, eyebrow labels, or decorative frame. The scene is interactive and has a static fallback if WebGL/module loading fails.
Signature interaction: select a world and orbit the actual procedural model. Roo waves and garden carts move; reduced motion starts paused. Native links open the independent demos.

Grounded concepts considered: toy workshop, museum model gallery, digital model-making workbench, miniature atlas, kinetic object catalog, flipbook screening room, game cartridge selector. Seed 74375154 selected candidate five; the user's explicit open-layout direction controls the material expression. Foreign references were considered for environmental commitment, state clarity, and responsive density, rather than their literal motifs. This is a code-led 3D surface; no image-generated UI comp is an authority.

Quality bar: unmistakably different from the discarded boxed/grid layout; clear silhouettes and realistic soft shadows; meaningful working interaction in the first viewport; no clipped specimens; readable desktop/mobile; all navigation and copy controls work; no fabricated metrics or product claims.

Implemented behavior: one transparent renderer with lazy cached factories for all four choices; constrained orbit, pause/resume, and camera reset. Zoom and pan are disabled. One-finger touch rotates; the canvas declares pan-y. Reduced motion starts the model paused and removes CSS transitions/smooth scrolling. The preview freezes model updates and rendering outside its observed viewport region and while the document is hidden. Selected-image fallback preserves caption and full-demo navigation when WebGL/CDN/model loading fails; install and prompt copy retain keyboard-selection fallback.

Implemented visual scope: Outfit and DM Sans are self-hosted. The object scene and catalog images have transparent, unrounded containers with no decorative frame. Rounded controls and functional code/prompt regions remain. The installation section uses a deep green tonal surface. DESIGN.md and its sidecar record this homepage system with homepage-prefixed tokens and preserve Aster as a separately scoped demo. These records describe source behavior; they do not claim user approval, a completed accessibility audit, or measured performance.
