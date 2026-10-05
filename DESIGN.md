---
name: Procedural Isometric Worlds — Homepage and Aster
description: An open green object catalog alongside a separately scoped warm launch demo.
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
  homepage-paper: "#f7f9f5"
  homepage-ink: "#20382a"
  homepage-muted: "#5b6b5d"
  homepage-green: "#2c5138"
  homepage-green-hover: "#1e3c29"
  homepage-line: "#d6dfd1"
  homepage-deep: "#233f2e"
  homepage-light: "#f0f5e8"
  homepage-light-muted: "#c0cfb7"
  homepage-highlight: "#507b40"
  homepage-focus: "#bd642b"
  homepage-copy: "#d0dfbd"
  homepage-copy-hover: "#e0ebd2"
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
  homepage-display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(54px, 6.25vw, 92px)"
    fontWeight: 500
    lineHeight: 1.055
    letterSpacing: "-0.04em"
  homepage-headline:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(34px, 3.9vw, 54px)"
    fontWeight: 450
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  homepage-world-title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "29px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  homepage-body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  homepage-action:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  homepage-code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  speed: "5px"
  segment: "6px"
  control: "8px"
  segment-track: "9px"
  circle: "50%"
  homepage-object: "0"
  homepage-picker: "7px"
  homepage-button: "9px"
  homepage-code: "10px"
  homepage-circle: "50%"
spacing:
  compact: "4px"
  icon-gap: "8px"
  action-gap: "10px"
  action-block: "12px"
  action-inline: "16px"
  panel-inline: "25px"
  page-inline: "36px"
  homepage-icon-gap: "8px"
  homepage-control-inline: "12px"
  homepage-action-inline: "20px"
  homepage-mobile-inline: "24px"
  homepage-column-gap: "32px"
  homepage-gutter: "clamp(24px, 5vw, 76px)"
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
  homepage-button-primary:
    backgroundColor: "{colors.homepage-green}"
    textColor: "{colors.homepage-paper}"
    typography: "{typography.homepage-action}"
    rounded: "{rounded.homepage-button}"
    padding: "14px 20px"
  homepage-button-primary-hover:
    backgroundColor: "{colors.homepage-green-hover}"
  homepage-scene-control:
    backgroundColor: "#f7f9f5cc"
    textColor: "{colors.homepage-ink}"
    rounded: "{rounded.homepage-circle}"
    size: "44px"
  homepage-world-option:
    backgroundColor: "transparent"
    textColor: "{colors.homepage-ink}"
    rounded: "{rounded.homepage-picker}"
    padding: "9px 12px"
  homepage-world-option-selected:
    backgroundColor: "{colors.homepage-green}"
    textColor: "{colors.homepage-paper}"
  homepage-object-item:
    backgroundColor: "transparent"
    textColor: "{colors.homepage-ink}"
    rounded: "{rounded.homepage-object}"
  homepage-button-copy:
    backgroundColor: "{colors.homepage-copy}"
    textColor: "#213b29"
    rounded: "{rounded.homepage-picker}"
    padding: "10px 15px"
  homepage-button-copy-hover:
    backgroundColor: "{colors.homepage-copy-hover}"
---

# Design System: Procedural Isometric Worlds

## Overview

**Homepage scope: `index.html` and `assets/landing/`.**

**Creative North Star: "The kinetic object catalog"**

The homepage gives procedural models room to stand on a light green ground. Rounded Outfit headlines and quiet DM Sans descriptions introduce the objects; green actions and a deep green installation section guide exploration and reuse. Transparent renders and real 3D cast shadows supply the visual material, with generous separation in place of decorative framing.

The user's rejection of boxes and overlapping outlines applies to this homepage. Native focus outlines and small functional controls remain. This is a descriptive record of the implemented direction, not a claim of separate brand approval.

**Key Characteristics:**
- Open object presentation with transparent backgrounds.
- Green typography and actions on a light neutral ground.
- Restrained controls around real procedural geometry.
- A deep green section for installation and reuse.

Token scope: `homepage-*` primitives and components describe the homepage. Unprefixed tokens and the Aster prose below retain the existing system for `assets/rocket/`; they are not homepage defaults. Other demos retain their own visual systems.


**Aster demo scope: `assets/rocket/`.**

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

The homepage combines a light green paper ground with forest green actions and dark green ink. `homepage-highlight` accents headline text; `homepage-muted` carries descriptions. The installation section uses `homepage-deep`, `homepage-light`, and `homepage-light-muted`, with the pale `homepage-copy` button. `homepage-line` is a quiet structural separator where retained. `homepage-focus` identifies keyboard focus on the light surface; the installation section uses the copy color for focus.

**The Homepage Object Ground Rule.** Keep the scene and catalog image surfaces transparent; do not restore framing backgrounds or decorative outlines around the models.

**Aster demo scope: `assets/rocket/`.**

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

Outfit supplies the homepage headings and brand; DM Sans supplies body copy and controls. Both variable Latin fonts are self-hosted in `assets/landing/fonts/` with their license/source records. Frontmatter captures the desktop heading, collection heading, item title, base body, action, and code roles. Hero copy is wider and more relaxed (17px, line-height 1.65, maximum 37ch); catalog descriptions are compact (14px, line-height 1.65, maximum 54ch).

Responsive headline sizes follow the stylesheet: 66px through 1100px, a 54–78px clamp through 800px, and a 46–65px clamp through 520px. Subordinate labels currently use 12px; this is an observed treatment, not a general minimum-size rule.

**Aster demo scope: `assets/rocket/`.**

**Display Font:** Manrope (sans-serif fallback). **Body Font:** DM Sans (sans-serif fallback). Both are loaded through Google Fonts; canvas signage waits for document fonts before construction.

The frontmatter `display` describes the desktop introduction, `title` the mission heading, `body` the mission description, and `control` the launch action. These are observed component roles, not a global body-size reset. Section titles use the recorded `section-title` role. The brand uses Manrope at weight 800 and a compact size (28px). The large countdown uses Manrope at weight 500 (70px) with tabular numerals. Flight telemetry also uses tabular numerals, avoiding shifting digits.

On mobile the introduction is fixed at 38px, then 32px below the narrow breakpoint; the countdown reduces to 55px. Many subordinate controls and labels currently use 11px. That density is an implementation observation requiring legibility review, not a default for new screens. Do not propagate it as a minimum-size policy.

## Layout

The homepage shell has a maximum width (1440px) and fluid inline gutter recorded in frontmatter. A two-column hero pairs introduction with the object view; the collection is a two-column open list with a horizontal gap (32px) and vertical gap (50px). The scene is 440px high by default, 490px at wide sizes, 390px through 1100px, 460px when stacked through 800px, and 325px through 520px.

At 800px the hero and installation section stack, main header navigation hides, and the footer stacks. At 520px the collection becomes one column and the gutter is fixed at the recorded mobile inset. Headings, text, controls, and images remain in document flow; interface labels sit within their scene or image region rather than overlapping another item.

**Aster demo scope: `assets/rocket/`.**

The desktop shell fills the viewport with a minimum height (790px): header (76px), scene plus sidebar, and footer. The main grid uses a flexible scene and a fixed mission panel (314px). At the wide breakpoint the panel grows (350px). The panel scrolls independently on desktop; short desktop viewports reduce spacing, hide the duplicate vehicle badge, and keep the launch actions sticky.

At 800px and below the layout stacks scene, two-column mission information, and footer. The scene has a fixed height (640px), reducing to 575px at 390px and below. The final mobile stage rule reserves 145px above and 55px below the canvas for interface copy. The mission heading, environment controls, playback, and launch action span both columns. Footer links wrap into a vertical arrangement.

Observed spacing uses compact icon gaps, modest action padding, and wider page insets; there is no universal spacing multiplier declared in the source. The frontmatter records repeated values, not an invented eight-point grid. The desktop short-height override applies through 900px; its exact values take precedence over base panel padding.

**The Scene and Mission Rule.** Keep scene inspection and mission controls legible as distinct regions, preserving their stacked order on small screens.

## Elevation & Depth

The homepage interface has no card-shadow vocabulary. A transparent WebGL renderer, orthographic camera, hemisphere and directional lighting, and soft mapped shadows give the models volume. Transparent preview PNGs retain their source shadows and use multiply blending against the page. Tonal fills belong to functional actions, the introductory strip, and the installation section, rather than the object containers.

**Aster demo scope: `assets/rocket/`.**

The interface is mostly flat: tonal surfaces and one-pixel dividers separate regions. Selected atmosphere buttons use a small ambient shadow (`0 2px 5px #353a2810`). Buttons and panels do not share an invented card-shadow scale.

The diorama supplies most of the depth. MeshStandardMaterial surfaces distinguish shell, metal, and ground by roughness and metalness. An orthographic camera, hemisphere light, directional sun and fill light, and PCF soft shadow mapping establish volume. The renderer uses ACES filmic tone mapping and caps pixel ratio at two. Camera-facing shader exhaust and translucent smoke support the launch.

## Shapes

Homepage objects and preview images are unboxed with square, transparent containers. Small actions retain gentle corners, and scene tools are circular. Stroke SVG icons provide the recurring interface vocabulary. Functional code and prompt regions remain rounded; the user's dislike of framing does not remove the boundaries needed to read and copy code.

**Aster demo scope: `assets/rocket/`.**

Small UI controls use gently rounded rectangles, while camera and sound controls are circular. The frontmatter radius roles retain the observed range. Native inline SVG strokes provide consistent icons. Mission telemetry is an open list rather than a stack of boxed cards.

Scene silhouettes come from cylinders, boxes, spheres, a lathed ogive fairing, extruded fins, and open trusses. Curved hull text follows the cylinder; small surface panels, pipes, rings, wheels, rails, and ladder rungs supply detail. The tower is a dark steel assembly with conspicuous orange braces, rather than a uniformly dark silhouette.

## Components

**Homepage actions and navigation.** The green primary action darkens on hover; secondary links underline. Navigation is text-based, with an unbordered source link. Links and buttons use a visible focus outline (3px, offset 5px). There are no homepage text inputs or generic boxed cards.

**Homepage live selector.** Four native pressed-state buttons switch Aster, Vela, Roo, and Sprout Yard. Selected is filled green; unselected is transparent with a light hover fill. The caption updates the name, description, and opening link. Circular pause/resume and camera-reset controls are 44px. Model viewing supports constrained orbit; zoom and pan are disabled. One-finger touch rotates the model and the canvas declares `touch-action: pan-y`.

**Homepage catalog items.** Each open image-and-description item is one demo link. Transparent renders show the actual procedural objects. Hover moves the render upward (4px) and changes the arrow color; model images are not framed by a background or outline.

**Homepage installation and copy.** A dark tonal code region contains the install command; a quieter outlined prompt region contains the example. Native copy buttons show success text/icons. When clipboard access fails, the text is selected for keyboard copying.

**Homepage motion and fallback.** Primary color changes use a brief transition (0.18s); catalog image changes use a spring-like ease (0.45s). Reduced motion removes CSS transitions and smooth scrolling and starts model animation paused. Orbit remains available while paused. Model simulation and rendering freeze outside the observed viewport region or while the document is hidden. WebGL/module failure keeps the selected transparent image, caption, demo navigation, and copy controls; scene tools stay disabled.

**Aster demo scope: `assets/rocket/`.**

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

### Homepage
- **Do** keep transparent models on the page ground with enough space to read their silhouettes.
- **Do** retain native pressed states, clear demo links, visible keyboard focus, and reduced-motion paused start.
- **Do** use homepage-prefixed tokens for the homepage and preserve each demo's scoped system.
- **Don't** restore framed gallery cards, drafting grids, or overlapping decorative outlines on the homepage.
- **Don't** remove functional control or code boundaries while applying the open object layout.
- **Don't** claim launch simulation, zoom, pan, or asset export controls for the homepage preview.


**Aster demo scope: `assets/rocket/`.**

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
