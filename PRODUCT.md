# Procedural Isometric Worlds

This repository is a reusable skill and collection of browser previews for constructing miniature Three.js worlds and articulated assets from procedural geometry and canvas textures. Its current homepage opens **Aster**, a rocket launch experience at `assets/rocket/`. The original Roo robot and Sprout Yard previews remain separate examples.

The rocket work answers the request to use the existing project as a guide for a high-quality rocket with animation and liftoff. The experience lets a visitor inspect the vehicle and launch complex, act as flight director, and watch the transition from a five-second countdown to ascent. It also gives developers readable factories they can reuse in their own scenes. These are intended uses inferred from the implemented preview and source, not research findings about an established audience.

The existing miniature-world grammar is the visual authority: an orthographic composition, coordinated materials, geometric detail, a cutaway industrial island, and soft lighting. A compact sidebar groups mission progress and controls beside the scene. Product tone is playful and inviting while control labels remain concrete. **Experience mode** describes this guided interactive preview; it does not imply an asset export workflow.

## Implemented experience

- Inspect the model with drag-to-orbit, scroll-to-zoom, and a camera reset.
- Initiate launch to retract the service arms, ignite nine engines, accelerate upward, and follow the rocket with the camera. The timed sequence reaches its completion state at simulation time T + 22 seconds.
- Pause or resume the animation, choose 1× or 2× playback, reset a mission, or launch again.
- Switch between daylight and nightfall; optionally enable synthesized engine noise and countdown beeps. Sound starts disabled.
- Read mission time, altitude, velocity, thrust, and the five-step launch sequence. Telemetry is illustrative: altitude and velocity are derived from simple time formulas, not a validated flight model.
- Download the rocket JavaScript source from the footer and visit the original robot example.

Reduced-motion preference starts the idle animation paused and removes button transitions. An explicit launch resumes animation; it does not provide an alternate static launch sequence. Controls use native buttons, fieldsets, labels, pressed states, visible focus outlines, and a polite live status message. These source-level provisions are not a claim of a completed accessibility audit.

## Delivery and reuse

This is a static browser application with no build step or backend. `assets/rocket/index.html` imports matching Three.js **0.180.0** core and addon modules from jsDelivr. Google Fonts supplies Manrope and DM Sans; WebGL and external asset access are runtime dependencies. A loading message reports module/WebGL initialization failure and disables the controls.

`createRocket` and `createKit` live in `assets/rocket/rocket.js`; `createLaunchComplex` lives in `assets/rocket/world.js`. The reusable factories construct meshes, materials, textures, engine groups, and hinged service arms. `assets/rocket/main.js` owns launch transforms, camera following, exhaust shaders, smoke particles, audio, and interface state. Reuse requires caller-owned placement, animation, and lifecycle handling; the exposed disposal methods release resources according to those ownership boundaries.

There is **no rocket GLB export and no baked rocket animation clip**. The robot example's GLB/export capabilities do not apply to Aster.

## Evidence and limits

This product record is based on the rocket HTML, CSS, and JavaScript and the repository README. It does not establish user approvals, measured performance, or a final visual review pass. DESIGN.md records the implemented rocket system, not a retrospective restyling of the earlier examples.
