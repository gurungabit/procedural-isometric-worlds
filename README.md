# Procedural Isometric Worlds

A reusable Codex skill for building miniature Three.js worlds and articulated assets from code. Includes **Roo**, an animated robot, and **Sprout Yard**, an interactive garden center.

[**Play with Roo →**](https://gurungabit.github.io/procedural-isometric-worlds/) · [Garden example](https://gurungabit.github.io/procedural-isometric-worlds/assets/starter/) · [Animated robot GLB](models/roo-robot.glb) · [Skill ZIP](procedural-isometric-worlds.zip)

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

Open `http://127.0.0.1:8000/assets/robot/` for Roo or `http://127.0.0.1:8000/assets/starter/` for Sprout Yard. No build step or backend is required. The previews load matching Three.js **0.180.0** core/addon modules from jsDelivr; a CDN connection is required.

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
- `assets/robot/`: original robot factory and interactive preview.
- `assets/starter/`: original garden-center example.
- `models/roo-robot.glb`: reusable model with four animation clips.
- `procedural-isometric-worlds.zip`: portable skill bundle.
- `index.html`, `.nojekyll`: GitHub Pages entrypoint and static publishing configuration.

GitHub Pages publishes `main` from the repository root. The homepage opens the robot preview; relative asset paths also work on project Pages URLs.

## Reference and verification

The construction approach was studied in [siddik-web/waretrack](https://github.com/siddik-web/waretrack), pinned in the [rendering analysis](references/waretrack-rendering.md). The included examples are newly written; WareTrack source and media are not included.

Verified locally: skill metadata, JavaScript syntax, desktop/mobile framing, articulated motion, pause/resume, recoloring, GLB structure, and Wave playback after GLTFLoader/AnimationMixer import.
