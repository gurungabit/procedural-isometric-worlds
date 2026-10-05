# Construction patterns

These are recipes, not a required asset inventory. The starter's `kit.js` implements helpers and factories; `main.js` composes a different theme.

## Asset recipes

Factories take style/dimensions/identity and return a grounded Group. Child coordinates stay local; place pivots at actual hinges/joints. Keep named references to animated parts instead of searching a hierarchy each frame.

| Asset | Primary forms | Recognizable details |
| --- | --- | --- |
| House/shop | Box body, cone or gabled roof | Entry, bright window slab, awning, sign |
| Industrial building | Large box + roof group | Door rhythm, loading canopy, vents, stripes |
| Vehicle | Chassis + cab + load boxes | Cylinder tires, dark window slabs, lights |
| Machine | Base + column + working group | Forks, arm, belt, bucket, hopper |
| Tree | Cylinder trunk + sphere/cone crown | Seeded scale and coordinated greens |
| Cargo | Low pallet + solid load | Straps, SKU colors, small label |
| Planting bed | Shallow soil box + rim | Crop crowns and growth colors |
| Road/path | Thin horizontal boxes | Curbs, dash strips, crossings, adjacency |

At overview zoom, subpixel details are expendable. Prefer silhouette variation to many invisible meshes. Dark box windows often convey glass without transparency sorting. Signs usually need textures, not letter geometry.

## Projection and lighting

For world-height `s` and canvas aspect `a`, set orthographic left/right = ±s*a/2 and top/bottom = ±s/2. Update the projection matrix after changing size/zoom. Camera target plus offset `(r*cos(el)*sin(az), r*sin(el), r*cos(el)*cos(az))` gives predictable framing. OrbitControls with equal min/max polar angles fixes elevation.

Modern color/lighting defaults differ from r128. The starter uses sRGB textures/output, no tone mapping, hemisphere intensity 2 and directional intensity 3: tunable initial settings, not r128 equivalents. Keep one casting sun with a shadow box fitted to the world. Thin paint/sign planes generally should not cast shadows. Watch acne, detached shadows, blown highlights, overlapping transparency, and hidden working areas.

## Canvas labels

Match canvas aspect ratio to the sign (512×128 for 4:1), leave padding, contrast text/background, and wait for font readiness. Reduce font size or wrap long labels. Cache identical signs; redraw on changes and mark needsUpdate. A default PlaneGeometry faces +Z; rotate 180° for the other side. Ground text rotates X by -π/2; inspect its reading direction from the camera.

Sprites face the camera automatically. Depth testing off keeps alerts readable through objects but can create clutter; reserve it for selected/urgent entities. Prefer HTML for large text/controls.

## Repetition and state

Key a seeded generator by stable entity/tile ID so rebuilding preserves appearance. Use discrete coordinated variants instead of unconstrained random colors. InstancedMesh repeats geometry/material with per-instance matrices. Use a scratch Object3D, updateMatrix, setMatrixAt, then flag instanceMatrix/instanceColor for update and recompute bounds after changes. Map instance indexes to entities for picking. Multipart trees need separate trunk/crown batches; partition batches spatially for large worlds.

Store routes, position, speed, phase, and inventory in state records with a reference to the Group. Movement consumes at most speed*dt and snaps exactly to reached waypoints. Wrap angle differences. Use fixed simulation steps when accurate accounting matters; cosmetic motion can use clamped frame delta. Pause stops simulation; hidden-tab return should not cause a giant jump. Reparented cargo needs converted coordinates or deliberately set local coordinates.

Shared cache resources belong to the kit; unique textures/materials belong to the asset/scene; instance meshes own extra buffers. Dispose once at teardown/replacement, never while another mesh uses a shared resource. Framework teardown releases controls, listeners, observers, and animation requests too. Frequent rebuilds should stabilize renderer.info memory counts after cleanup.

## Primary references

- [OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html): projection, frustum, zoom updates.
- [CanvasTexture](https://threejs.org/docs/pages/CanvasTexture.html): generated texture upload.
- [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html): batching, bounds, updates, disposal.
- [r180 source](https://github.com/mrdoob/three.js/tree/r180): pinned starter version; consult installed-version docs for integrations.
