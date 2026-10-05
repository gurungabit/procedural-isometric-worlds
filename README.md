# Procedural Isometric Worlds

A reusable Codex skill for building miniature Three.js worlds and articulated assets from code. Includes **Aster**, an animated rocket launch complex, **Roo**, an articulated robot, and **Sprout Yard**, an interactive garden center.

[**Launch Aster →**](https://gurungabit.github.io/procedural-isometric-worlds/) · [Robot example](https://gurungabit.github.io/procedural-isometric-worlds/assets/robot/) · [Garden example](https://gurungabit.github.io/procedural-isometric-worlds/assets/starter/) · [Animated robot GLB](models/roo-robot.glb) · [Skill ZIP](procedural-isometric-worlds.zip)

## What it builds

Assets are assembled from boxes, cylinders, spheres, custom geometry, and canvas textures. The skill covers orthographic framing, coordinated materials, lighting/shadows, reusable factories, articulated joints, simulation-driven transforms, selection, batching, and GPU resource ownership.

Roo supports **idle, wave, walk in place, and dance**, with accent colors, pause/resume, orbit controls, wireframe inspection, and GLB export. The supplied GLB includes all four joint-animation clips. Canvas face blinking remains in the JavaScript preview; the exported face texture is a snapshot.

## Install the skill

Clone this repository into your personal Codex skills directory:

```sh
git clone https://github.com/gurungabit/procedural-isometric-worlds.git ~/.codex/skills/procedural-isometric-worlds
```

If that directory already exists, update the existing checkout or install the ZIP contents into it rather than cloning over it. The skill entrypoint is [SKILL.md](SKILL.md).

Example request:

> Use $procedural-isometric-worlds to create an animated robot with waving, walking, and GLB export.

Or ask for a factory, farm, recycling depot, transport hub, or another miniature world.

## Run the examples locally

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/` for Aster, `http://127.0.0.1:8000/assets/robot/` for Roo or `http://127.0.0.1:8000/assets/starter/` for Sprout Yard. No build step or backend is required. The previews load matching Three.js **0.180.0** core/addon modules from jsDelivr; a CDN connection is required.

## Launch Aster

Aster is an original procedural heavy-lift rocket with a smooth payload fairing, ribbed interstage, paired boosters, fins, feed lines, curved hull lettering, and nine engine bells. The launch island includes a steel truss tower with hinged service arms, a flame trench, storage tanks, mission control, a service vehicle, pipework, and apron lights.

Select **Initiate launch** for a five-second countdown, service-arm retraction, ignition, and an accelerating ascent with camera tracking. Pause/resume, 1×/2× speed, reset/replay, orbit/zoom, day/night lighting, and optional synthesized launch audio work in the preview. Telemetry is illustrative simulation data. Reduced motion starts the idle scene paused; an explicit launch starts playback.

```js
import {createKit, createRocket} from './assets/rocket/rocket.js';
const kit = createKit();
const rocket = createRocket({kit, accent:'#c95634'});
scene.add(rocket.group);
// Apply placement and flight transforms to rocket.group.
// Dispose owned resources on teardown:
rocket.dispose();
kit.dispose();
```

The reusable rocket factory is independent of the preview. Launch animation, exhaust shaders, particle effects, and sound run in `assets/rocket/main.js`; they are not baked animation clips or a downloadable animated GLB. The preview uses Three.js 0.180.0 from jsDelivr and DM Sans / Manrope from Google Fonts. No build step is needed.

## Reuse the robot

```js
import {createRobot} from './assets/robot/robot.js';
const robot=createRobot({accent:'#388f89',scale:1});
scene.add(robot.group);
// In your existing animation loop, using elapsed and delta seconds:
robot.update(elapsed,dt,'wave');
```

Use an outer placement group for movement through the world. `robot.createAnimationClips()` bakes four joint motions for AnimationMixer or glTF export. Call `robot.dispose()` during teardown. See [articulated animation guidance](references/articulated-animation.md).

## Repository layout

- `SKILL.md`, `agents/`, `references/`: skill instructions and supporting guidance.
- `assets/rocket/`: reusable rocket factory, detailed launch complex, and interactive launch simulation.
- `assets/robot/`: original robot factory and interactive preview.
- `assets/starter/`: original garden-center example.
- `models/roo-robot.glb`: reusable model with four animation clips.
- `procedural-isometric-worlds.zip`: portable skill bundle.
- `index.html`, `.nojekyll`: GitHub Pages entrypoint and static publishing configuration.

GitHub Pages publishes `main` from the repository root. The homepage opens the rocket launch; relative asset paths also work on project Pages URLs.

## Reference and verification

The construction approach was studied in [siddik-web/waretrack](https://github.com/siddik-web/waretrack), pinned in the [rendering analysis](references/waretrack-rendering.md). The included examples are newly written; WareTrack source and media are not included.

Verified locally for Aster: complete launch/ascent/replay, countdown and arm retraction, camera tracking, pause/resume, speed and atmosphere controls, audio toggle, real drag/zoom/reset, reduced-motion behavior, 360px and 390px mobile layouts, no console errors, and stable GPU resource counts over repeated resets.

Original robot verification: skill metadata, JavaScript syntax, desktop/mobile framing, articulated motion, pause/resume, recoloring, GLB structure, and Wave playback after GLTFLoader/AnimationMixer import.
