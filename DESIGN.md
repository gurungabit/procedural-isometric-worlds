---
name: Aster — Procedural Isometric Worlds
description: A warm miniature launch world with compact mission controls.
colors:
  bg: "#f3f0e8"
  paper: "#faf8f2"
  ink: "#2b352f"
  muted: "#62675c"
  line: "#dadbd0"
  accent: "#ba4729"
  accent-hover: "#a63b20"
  launch-text: "#fff9ed"
  green: "#50734d"
  segmented-bg: "#eeece2"
  selected-speed: "#e8e9dc"
  scene-night: "#172a32"
  scene-night-ink: "#f4f0df"
  scene-night-muted: "#ccd4c7"
  scene-night-line: "#41545a"
  scene-night-paper: "#243940"
  ivory: "#f7f3e8"
  white: "#e6e7df"
  dark: "#2a393b"
  steel: "#718382"
  orange: "#c95634"
  copper: "#a85a36"
  gold: "#ceac71"
  concrete: "#bfc8b5"
  sage: "#7f9670"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(32px, 3.65vw, 54px)"
    fontWeight: 750
    lineHeight: 1.11
    letterSpacing: "-0.038em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "23px"
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  control:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  section-title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 650
rounded:
  speed: "5px"
  segment: "6px"
  control: "8px"
  segment-track: "9px"
  circle: "50%"
spacing:
  compact: "4px"
  icon-gap: "8px"
  action-gap: "10px"
  action-block: "12px"
  action-inline: "16px"
  panel-inline: "25px"
  page-inline: "36px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.launch-text}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-camera:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    rounded: "{rounded.circle}"
    size: "38px"
  button-segment:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.segment}"
  button-segment-selected:
    backgroundColor: "{colors.paper}"
  button-speed-selected:
    backgroundColor: "{colors.selected-speed}"
    rounded: "{rounded.speed}"
    padding: "5px 8px"
  mission-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "30px 25px 23px"
---

# Design System: Aster — Procedural Isometric Worlds

## Overview

**Creative North Star: "The miniature launch world"**

Aster extends the repository's procedural miniature-world grammar into a launch complex. Warm surfaces, an ivory vehicle, orange and copper detailing, and visible industrial structure make the scene feel tangible. Orthographic framing presents the model as a small constructed world that can be inspected from multiple angles.

The interface pairs a spacious scene with a compact mission panel. Manrope gives headlines a rounded, confident presence; DM Sans keeps the operational information quiet. Motion expresses machinery and progression: hinged service arms, ignition, accelerating ascent, camera following, and changing mission state.

This name is a descriptive record of the implementation, not a separately approved brand metaphor. Tokens are extracted from `assets/rocket/style.css` and the exported palette in `rocket.js`. This system describes Aster; it does not claim that the earlier robot and garden previews share every token.

**Key Characteristics:**
- Warm paper interface beside a procedural industrial diorama.
- Ivory vehicle with orange markings and steel detail.
- Orthographic inspection with soft cast shadows.
- Compact semantic mission controls and explicit animation state.

## Colors

The palette combines warm neutral interface surfaces with earthy industrial materials. Frontmatter is the normative value record; CSS variables keep their original names, and scene palette keys retain their source names.

### Primary
- **Launch rust** (`accent`, `accent-hover`): primary mission action, current sequence dot, and focus outline. `launch-text` supplies the warm light text on that action.
- **Vehicle orange** (`orange`): hull bands, fins, tower braces, service equipment, and other model markings. It is distinct from the UI action color.
- **Copper** (`copper`): utility crates and selected ground detail.

### Secondary
- **Readiness green** (`green`): ready indicators, completed steps, and the vehicle badge.
- **Sage** (`sage`): shrubs and storage-tank detail in the scene.
- **Gold** (`gold`): engine fittings, ladder rungs, and safety markings.

### Neutral
- **Warm ground** (`bg`): page and daylight scene background; the scene's `ground` key has this same value.
- **Paper** (`paper`): mission panel and resting camera buttons.
- **Deep ink** (`ink`), **olive gray** (`muted`), and **soft divider** (`line`): primary information, supporting information, and panel structure.
- **Segment track** (`segmented-bg`) and **speed selection** (`selected-speed`): small tonal state surfaces.
- **Ivory** (`ivory`), **soft white** (`white`), **dark steel** (`dark`), **steel** (`steel`), and **concrete** (`concrete`): vehicle shells, structural parts, island base, and ground services.
- **Night scene family** (`scene-night`, `scene-night-ink`, `scene-night-muted`, `scene-night-line`, `scene-night-paper`): scene and overlay overrides; the header and mission panel keep their daylight surface colors.

**The Scene Scope Rule.** Nightfall changes the scene and its overlays; it does not recolor the entire mission interface.

## Typography

**Display Font:** Manrope (sans-serif fallback). **Body Font:** DM Sans (sans-serif fallback). Both are loaded through Google Fonts; canvas signage waits for document fonts before construction.

The frontmatter `display` describes the desktop introduction, `title` the mission heading, `body` the mission description, and `control` the launch action. These are observed component roles, not a global body-size reset. Section titles use the recorded `section-title` role. The brand uses Manrope at weight 800 and a compact size (28px). The large countdown uses Manrope at weight 500 (70px) with tabular numerals. Flight telemetry also uses tabular numerals, avoiding shifting digits.

On mobile the introduction is fixed at 38px, then 32px below the narrow breakpoint; the countdown reduces to 55px. Many subordinate controls and labels currently use 11px. That density is an implementation observation requiring legibility review, not a default for new screens. Do not propagate it as a minimum-size policy.

## Layout

The desktop shell fills the viewport with a minimum height (790px): header (76px), scene plus sidebar, and footer. The main grid uses a flexible scene and a fixed mission panel (314px). At the wide breakpoint the panel grows (350px). The panel scrolls independently on desktop; short desktop viewports reduce spacing, hide the duplicate vehicle badge, and keep the launch actions sticky.

At 800px and below the layout stacks scene, two-column mission information, and footer. The scene has a fixed height (640px), reducing to 575px at 390px and below. The final mobile stage rule reserves 145px above and 55px below the canvas for interface copy. The mission heading, environment controls, playback, and launch action span both columns. Footer links wrap into a vertical arrangement.

Observed spacing uses compact icon gaps, modest action padding, and wider page insets; there is no universal spacing multiplier declared in the source. The frontmatter records repeated values, not an invented eight-point grid. The desktop short-height override applies through 900px; its exact values take precedence over base panel padding.

**The Scene and Mission Rule.** Keep scene inspection and mission controls legible as distinct regions, preserving their stacked order on small screens.

## Elevation & Depth

The interface is mostly flat: tonal surfaces and one-pixel dividers separate regions. Selected atmosphere buttons use a small ambient shadow (`0 2px 5px #353a2810`). Buttons and panels do not share an invented card-shadow scale.

The diorama supplies most of the depth. MeshStandardMaterial surfaces distinguish shell, metal, and ground by roughness and metalness. An orthographic camera, hemisphere light, directional sun and fill light, and PCF soft shadow mapping establish volume. The renderer uses ACES filmic tone mapping and caps pixel ratio at two. Camera-facing shader exhaust and translucent smoke support the launch.

## Shapes

Small UI controls use gently rounded rectangles, while camera and sound controls are circular. The frontmatter radius roles retain the observed range. Native inline SVG strokes provide consistent icons. Mission telemetry is an open list rather than a stack of boxed cards.

Scene silhouettes come from cylinders, boxes, spheres, a lathed ogive fairing, extruded fins, and open trusses. Curved hull text follows the cylinder; small surface panels, pipes, rings, wheels, rails, and ladder rungs supply detail. The tower is a dark steel assembly with conspicuous orange braces, rather than a uniformly dark silhouette.

## Components

### Mission action

A full-width rust button carries one explicit action, with a rocket icon and right arrow. Its hover darkens and shifts upward (1px) over a brief transition (0.2s). Disabled controls retain their label and reduce opacity (0.55). The action reads “Initiate launch,” becomes disabled during launch, and changes to “Launch again” after completion. A separate underlined reset action appears during the sequence.

### Atmosphere and playback

Atmosphere options sit within a rounded tonal track. The selected option uses paper and the small shadow; `aria-pressed` communicates selection. Playback pairs pause/resume with 1× and 2× options, and selection uses a soft filled background. These are native buttons and fieldsets, not decorative tabs or text inputs.

### Camera and sound controls

Circular bordered buttons contain stroke SVG icons. Sound is off initially and shows a diagonal line; pressed state and an updated accessible label accompany the visual change. Camera reset restores the orbit view around the current flight position.

### Mission panel and telemetry

The paper panel uses a vertical divider on desktop and a horizontal divider when stacked. Supporting descriptions use muted text; definition-list rows align names and tabular values to opposite sides. There are no generic card or text-field components in this preview.

### Launch sequence

Five compact ordered steps use connected dots. Current is rust, completed is green, and upcoming remains outlined. Status color accompanies text and layout changes; the polite launch-note message announces phase updates.

### Focus and motion

Buttons and links receive the same visible outline (3px, offset 4px). Reduced motion removes button transitions and starts the idle scene paused. Explicit launch starts animation even under reduced motion. Pause also freezes simulation progression, particle updates, and synthesized engine gain; orbit inspection remains available. The mission follows a five-second countdown, gradual arm retraction and thrust ramp, accelerating ascent, and camera follow. See the sidecar for motion values; these are simulation behavior, not reusable page-transition durations.

## Do's and Don'ts

### Do:
- **Do** reuse the exported procedural material palette for related rocket and launch-complex geometry.
- **Do** pair mission status with text and semantic pressed or disabled state.
- **Do** keep orthographic inspection and soft cast shadows central to the miniature-world presentation.
- **Do** retain visible focus outlines and the reduced-motion paused start.

### Don't:
- **Don't** infer a whole-page dark theme from the scene-scoped nightfall treatment.
- **Don't** describe the illustrative telemetry as a physically validated flight simulation.
- **Don't** substitute hard opaque geometry for the camera-facing translucent exhaust and smoke treatment.
- **Don't** turn observed 11px supporting text into a required size for new surfaces.
