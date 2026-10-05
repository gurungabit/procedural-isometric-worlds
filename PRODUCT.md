# Procedural Isometric Worlds

This repository is a reusable skill and collection of static browser previews for constructing miniature Three.js worlds and articulated assets from procedural geometry and canvas textures. The root homepage is an open interactive catalog for **Aster** (`assets/rocket/`), **Vela** (`assets/vela/`), **Roo** (`assets/robot/`), and **Sprout Yard** (`assets/starter/`). Each demo remains independently accessible.

## Homepage

The homepage offers a live, transparent 3D preview with four model choices. One renderer lazily imports and caches the reusable model factories as each world is selected. Aster shows its launch complex; Vela shows the deployed upper stage and satellite; Roo waves; garden carts circulate. The full launch, flight, character, and garden interactions live in the linked demos.

The homepage supports constrained drag-to-orbit, pause/resume, and camera reset. It has no zoom or pan; one-finger touch rotates and the canvas uses `touch-action: pan-y`. Reduced-motion preference starts animation paused and removes CSS transitions and smooth scrolling. Simulation and rendering stop while the preview is outside its observed viewport region or the document is hidden. Pause freezes model animation while retaining orbit inspection.

Transparent image previews provide the initial view and the selected-world fallback when WebGL, CDN modules, or model initialization fail. The selected caption and demo link continue to update; scene controls remain disabled on failure. Navigation, install-command copying, and example-prompt copying remain available. Failed clipboard access selects the relevant text for keyboard copying. Native links and buttons, pressed states, visible focus, a skip link, descriptive image text, and live status text are source-level provisions, not evidence of a completed accessibility audit.

The catalog keeps all four demo destinations plus `SKILL.md`, the GitHub source, the skill-install clone command, and `models/roo-robot.glb`. The GLB download belongs to Roo; the homepage does not offer model export or baked animation creation.

The homepage has no build step or backend. It loads local Outfit and DM Sans variable font files, with source and SIL Open Font License records in `assets/landing/fonts/`. Three.js **0.180.0** core and addons come from jsDelivr; live 3D requires WebGL and successful module access. Static images, text, and links do not depend on live 3D initialization.

## Aster demo scope

The rocket work answers the request to use the existing project as a guide for a high-quality rocket with animation and liftoff. The experience lets a visitor inspect the vehicle and launch complex, act as flight director, and watch the transition from a five-second countdown to ascent. It also gives developers readable factories they can reuse in their own scenes. These are intended uses inferred from the implemented preview and source, not research findings about an established audience.

The existing miniature-world grammar is the visual authority: an orthographic composition, coordinated materials, geometric detail, a cutaway industrial island, and soft lighting. A compact sidebar groups mission progress and controls beside the scene. Product tone is playful and inviting while control labels remain concrete.

### Implemented Aster experience

- Inspect the model with drag-to-orbit, scroll-to-zoom, and a camera reset.
- Initiate launch to retract the service arms, ignite nine engines, accelerate upward, and follow the rocket with the camera. The timed sequence reaches its completion state at simulation time T + 22 seconds.
- Pause or resume the animation, choose 1× or 2× playback, reset a mission, or launch again.
- Switch between daylight and nightfall; optionally enable synthesized engine noise and countdown beeps. Sound starts disabled.
- Read mission time, altitude, velocity, thrust, and the five-step launch sequence. Telemetry is illustrative: altitude and velocity are derived from simple time formulas, not a validated flight model.
- Download the rocket JavaScript source from the footer and visit the original robot example.

Reduced-motion preference starts the idle animation paused and removes button transitions. An explicit launch resumes animation; it does not provide an alternate static launch sequence. Controls use native buttons, fieldsets, labels, pressed states, visible focus outlines, and a polite live status message. These source-level provisions are not a claim of a completed accessibility audit.

### Aster delivery and reuse

The Aster demo is a static browser application with no build step or backend. `assets/rocket/index.html` imports matching Three.js **0.180.0** core and addon modules from jsDelivr. Google Fonts supplies Manrope and DM Sans; WebGL and external asset access are runtime dependencies. A loading message reports module/WebGL initialization failure and disables the controls.

`createRocket` and `createKit` live in `assets/rocket/rocket.js`; `createLaunchComplex` lives in `assets/rocket/world.js`. The reusable factories construct meshes, materials, textures, engine groups, and hinged service arms. `assets/rocket/main.js` owns launch transforms, camera following, exhaust shaders, smoke particles, audio, and interface state. Reuse requires caller-owned placement, animation, and lifecycle handling; the exposed disposal methods release resources according to those ownership boundaries.

There is **no rocket GLB export and no baked rocket animation clip**. The robot example's GLB/export capabilities do not apply to Aster.

## Evidence and limits

This product record is based on root `index.html`, `assets/landing/style.css`, `main.js`, `scene.js`, local font records, the rocket HTML/CSS/JavaScript, and the repository README. It does not establish user approvals, measured performance, or a completed accessibility audit. DESIGN.md records separate homepage and Aster systems; it does not restyle the other demos by implication.
