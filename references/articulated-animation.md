# Articulated assets and portable animation

Use for robots, mechanical characters, gates, cranes, and other assets whose motion comes from parts rotating or translating around joints. A mesh hierarchy can do this without a skinned skeletal mesh. Soft/deforming characters may need a proper skeleton and skinning instead.

## Build the rig

Create a root Group with a documented ground origin, Y-up, and forward axis. Add pivots at physical joints; build the limb geometry in that pivot's local space. An elbow is a child of its shoulder, a knee a child of its hip. Rotation then carries all downstream parts naturally. Use unique node names and return a `joints` object so animation can address pivots directly.

In [../assets/robot/robot.js](../assets/robot/robot.js), `createRobot({accent, scale})` returns:

- `group`: the mesh hierarchy, facing +Z with feet at ground level.
- `joints`: torso/head, two shoulder/elbow/gripper chains, two hip/knee chains.
- `update(time, dt, mode)`: procedural `idle`, `wave`, `walk`, or `dance` pose updates.
- `setAccent(color)`: shared accent recoloring without rebuilding geometry.
- `createAnimationClips({fps=30})`: four portable transform clips, sampled from the same motion functions.
- `dispose()`: owned mesh/material/texture cleanup.

Use an outer placement Group if the asset's motion driver changes the root position. The example walks in place; moving through the world requires a separate route/placement driver.

## Author motion

Design a distinct action around recognizable joints. Idle can tilt the head gently; a wave raises one shoulder and flexes the elbow/wrist; a walk alternates hips and opposing shoulders; a dance shifts arm poses and torso rhythm. Keep angles bounded and check the extremes for self-intersection and ground contact. Plant feet deliberately for accurate locomotion; sine-wave walking is suitable for a stylized in-place preview, not accurate navigation/foot IK.

Use `1-exp(-rate*dt)` for frame-rate-independent transition damping. Keep animation time independent of the wall clock and stop advancing it while paused or hidden. For mode switches, blend toward the new pose; do not leave stale joint rotations from the previous action. Let reduced-motion preference choose an initially paused preview while retaining manual controls.

Animate face textures only on expression/blink changes, not on every rendered frame. Canvas graphics are useful for a robot screen; mesh eyeballs/mouth parts or morph targets are more portable if facial animation must export.

## Runtime usage

```js
import {createRobot} from './robot.js';
const robot=createRobot({accent:'#388f89'});
scene.add(robot.group);
// Inside the existing renderer loop, with clamped delta seconds:
if (!paused) { animationTime += dt; robot.update(animationTime,dt,'wave'); }
// On teardown, stop callers from updating it before disposal.
robot.dispose();
```

The included preview loads Three.js 0.180.0, matching OrbitControls, RoundedBoxGeometry, and GLTFExporter through an import map. Integrations should use their existing version rather than duplicating Three.js.

## Exporting motion

A glTF export of the current scene is a static pose unless animation clips are passed to the exporter. Sample joint transforms at a suitable rate (30 fps is enough for this small example). Use VectorKeyframeTrack for translation and QuaternionKeyframeTrack for rotation; preserve base scale and restore the live pose after baking. Copy first samples to last samples for intentional repeating clips; for one-shot actions, author a useful final pose instead. Do not change world placement accidentally while baking.

Pass the clips to `GLTFExporter.parseAsync(root, {binary:true, animations:clips})`. The example exports Idle, Wave, Walk, and Dance joint animations. Canvas face blinking remains part of the live JavaScript version; the exported face is a texture snapshot.

Imported GLB clips are played with AnimationMixer, for example:

```js
const gltf=await loader.loadAsync('roo-robot.glb');
scene.add(gltf.scene);
const mixer=new THREE.AnimationMixer(gltf.scene);
const clip=THREE.AnimationClip.findByName(gltf.animations,'Wave');
if (clip) mixer.clipAction(clip).play();
// In the animation loop: mixer.update(dt).
```

Use the imported clips OR the procedural pose driver on a given rig, not both simultaneously. Stop/uncache the mixer on teardown. The native hierarchy supports articulated animation; it is not a weighted skinning rig.

## Verify

Test action switching, actual joint changes, pause/resume, recoloring, extreme poses, and desktop/mobile framing. For portable export, check GLB structure and clip/channel presence, then reload the binary with GLTFLoader and play a clip through AnimationMixer. Confirm the motion changes joint transforms, rather than merely checking that an animation name exists. Keep static-pose exports distinct from animated exports and mention any effects that remain runtime-only.
