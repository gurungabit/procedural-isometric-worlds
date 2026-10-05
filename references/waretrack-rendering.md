# WareTrack rendering reference

Repository: https://github.com/siddik-web/waretrack

Snapshot: `f2bd7329e95629bb09e761929c7ddbf3abfa6183` (cloned 2026-10-05). Source links are pinned to that commit. No LICENSE file is present at this snapshot; the bundled starter is newly written and contains no copied WareTrack code or media.

Everything executable is in `index.html`, with no build step or backend. It loads Three.js r128 from cdnjs, falls back to jsDelivr, and uses Google Fonts. The JPEG/GIF files under `docs/media/` illustrate the README; the runtime world does not load them. The XLSX documents game mechanics.

## Rendering map

| Layer | index.html line | What happens |
| --- | --- | --- |
| Engine loading | 710 | Load global `THREE` r128. |
| Renderer/lights | 1118 | Antialiased WebGL canvas, capped DPR, PCF soft shadows, hemisphere + directional + ambient lights, pale fog/background. |
| Primitive toolkit | 1142 | Cached MeshStandardMaterial, box/cylinder/sphere geometry; helpers add positioned meshes. |
| Generated artwork | 1160 | CanvasTexture signs, floor text, glyph badges; plane decals and camera-facing sprites. |
| Warehouse | 1186 | Thin box floors/walls, rack posts/beams, line strips, chargers, separate transparent shell. |
| Roads | 1376 | Tile adjacency chooses markings; same-size/color box parts batched with InstancedMesh. |
| Buildings | 1412 | Boxes for bodies/windows/doors; four-sided cone house roofs; awnings; seeded color/height variants. |
| Repeated greenery | 1559 | Instanced cylinder trunks and sphere crowns, per-instance transforms/colors; instanced lamps too. |
| Pallets | 2158 | Four boxes: wooden base, SKU-colored load, tape strip, white side label. |
| Trucks | 2177 | Box trailer/cab/chassis/windows; cylinder tires/hubs; generated carrier artwork on two trailer-side planes. |
| Forklifts | 2202 | Box body/counterweight/cage/mast; cylinder/sphere driver and hemisphere hat; cylinder wheels. Separate child group lifts forks. |
| Movement | 2245 | Entity steps run move/turn/lift/wait/actions; position/yaw and forkY copied onto groups. |
| Roof types | 2606 | Custom triangular prism BufferGeometry; repeated prisms for sawtooth roofs; primitive solar panels/silos/vents. |
| Camera | 3355 | Orthographic, initial 45° azimuth, 0.6155 radians elevation (~35.265°), lerped pan/zoom/rotation. |
| Picking | 3415 | Recursive raycasts, parent traversal to userData.sel; bracket geometry and routes show selection. |
| Main loop | 3911 | requestAnimationFrame → clamped delta → simulation → visual transforms → renderer.render; HUD throttled to ~0.4 seconds or dirty state. |

Source: [primitive helpers](https://github.com/siddik-web/waretrack/blob/f2bd7329e95629bb09e761929c7ddbf3abfa6183/index.html#L1142), [pallet/truck/forklift factories](https://github.com/siddik-web/waretrack/blob/f2bd7329e95629bb09e761929c7ddbf3abfa6183/index.html#L2158), [camera](https://github.com/siddik-web/waretrack/blob/f2bd7329e95629bb09e761929c7ddbf3abfa6183/index.html#L3355), [frame loop](https://github.com/siddik-web/waretrack/blob/f2bd7329e95629bb09e761929c7ddbf3abfa6183/index.html#L3911).

## Why the look works

The camera removes perspective size changes, producing a board-model view. Pale ground/fog holds the image together; saturated roofs, racks, cargo, and vehicles distinguish functions. Directional shadows provide ground contact/depth; high roughness avoids shiny surfaces. Small silhouette details make primitives recognizable at a distance. No imported 3D models or skeletal animation clips are involved.

The roof/front shell fades out at close zoom (target opacity 0 when zoom >= 0.8 unless town mode); zooming out restores it. Back/left walls toggle with view direction. Selection combines 3D brackets/routes with an HTML label projected from world coordinates. Panels and controls are HTML/CSS with inline SVG icons. Confetti has a separate 2D canvas.

## Carry forward and improve

Carry forward group factories, coherent scale, canvas signage, seeded variants, instancing, and simulation-driven transforms. Separate rendering/factories/state/UI for larger apps rather than preserving the monolithic file. Caches reuse allocation but individual meshes still generate draw calls; instance repeated racks if measured scale warrants it. Rebuild/removal code shows no explicit GPU disposal, so new code should manage ownership. Source pointer coordinates use window dimensions; embedded apps need the renderer's rectangle. Preserve font readiness. Pin dependencies and handle modern color spaces/lighting rather than copying r128 brightness settings.
