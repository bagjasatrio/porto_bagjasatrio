---
name: Famicom Clean Studio
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd8e7'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#efecfb'
  surface-container-high: '#e9e6f5'
  surface-container-highest: '#e3e1ef'
  on-surface: '#1b1b25'
  on-surface-variant: '#3d4946'
  inverse-surface: '#302f3a'
  inverse-on-surface: '#f2effd'
  outline: '#6d7a76'
  outline-variant: '#bcc9c5'
  surface-tint: '#006b5e'
  primary: '#00685c'
  on-primary: '#ffffff'
  primary-container: '#008375'
  on-primary-container: '#f4fffb'
  inverse-primary: '#65d9c6'
  secondary: '#b5005c'
  on-secondary: '#ffffff'
  secondary-container: '#e01475'
  on-secondary-container: '#fffbff'
  tertiary: '#7f5300'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f6900'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#83f6e2'
  primary-fixed-dim: '#65d9c6'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#ffb1c6'
  on-secondary-fixed: '#3f001c'
  on-secondary-fixed-variant: '#8e0047'
  tertiary-fixed: '#ffddb3'
  tertiary-fixed-dim: '#ffb950'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#fcf8ff'
  on-background: '#1b1b25'
  surface-variant: '#e3e1ef'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Space Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  code-data:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system channels the tactile precision, mechanical clarity, and physical cartridge charm of 1980s-90s Japanese handheld consoles and arcade operating machines. Instead of leaning into a dark, gritty CRT arcade basement aesthetic, it takes inspiration from the pristine, museum-grade industrial design of the Game Boy Pocket, Nintendo Famicom Classic, and vintage Japanese microcomputer user manuals.

The brand voice is playful yet exceptionally disciplined, nostalgic yet modern, utilitarian yet full of electric personality. The UI must feel like crisp, screen-printed cardstock placed beneath a sharp-pixel LCD display. 

The primary design movement is **Retro Brutalism / Neo-Tokyo Arcade**:
- Absolute geometric rigor with hard zero-radius boundaries (`0px`).
- Deep tactile hard-drop shadows (`box-shadow: 4px 4px 0px #1a1a24`) that physically depress on user interaction (`2px 2px 0px` on hover, `0px 0px 0px` on active).
- Crisp off-white and warm matte gray chassis tones accented by razor-sharp CRT hues: arcade cyan, laser magenta, cobalt, and cartridge-shell gold.
- Strict rejection of blur, translucency, or soft gradients.

## Colors

The palette is rooted in vintage consumer electronics hardware: matte plastic housings, pristine screen-printed manuals, and punchy CRT indicator lamps. Dark mode is intentionally omitted to maintain the crisp, light-absorbing paper-and-plastic feel.

### Key Palettes
- **Chassis Neutrals**:
  - `Surface Crisp`: `#ffffff` — clean display backplate.
  - `Surface Neutral`: `#f4f4f0` — main application canvas, reminiscent of matte handheld console casing.
  - `Surface Muted / Bay`: `#e8e8e2` — inset panels, sub-drawers, and secondary slots.
  - `Border & Ink Base`: `#1a1a24` — high-contrast industrial charcoal used for all borders, line art, and high-impact text.
  - `Ink Muted`: `#585868` — secondary metadata, inactive labels, and peripheral stats.

- **Arcade Primary Accents**:
  - `Primary Teal`: `#009988` — main interactive focal points, success confirmations, active cartridge states.
  - `Primary Cobalt`: `#2233aa` — structural actions, deep system alerts, active selection highlights.

- **Arcade Secondary & Tertiary Accents**:
  - `Laser Magenta`: `#d6006e` — primary action calls, error triggers, boss-level priority badges.
  - `Arcade Amber`: `#cc8800` — high scores, warnings, coin/credit tallies, active modifiers.

### Application Rules
- Use solid color blocking exclusively; avoid visual gradients unless rendering a pixel-dither pattern.
- High-saturation accents (`#009988`, `#d6006e`) must always be framed by `#1a1a24` strokes when placed alongside container backgrounds to maintain strict graphic delineation.

## Typography

The typographical identity merges two distinct functional forms: **Space Grotesk** provides an assertive, geometric, neo-grotesque structure for headings and narrative body copy, while **Space Mono** delivers the authentic, machine-read, ROM-diagnostic ledger look for technical labels, scores, counters, and metadata.

### Typography Rules
- **Casing**: Key action items, badges, system statuses, and headers can utilize `text-transform: uppercase` to evoke arcade cabinet marquee typography.
- **Numbers and Metrology**: Always render score counters, currencies, level indicators, and numeric readouts in `Space Mono` to guarantee monospaced tabular alignment.
- **Weights**: Restrict weights strictly to 400 (Regular), 600 (Semi-Bold), and 700 (Bold). Avoid featherweights or ultra-thin variants to prevent anti-aliasing degradation.

## Layout & Spacing

The layout model uses a rigid grid structure derived from mosaic architectural tile layouts and technical console PCB boards.

### Grid & Canvas Structure
- **Desktop (1024px and up)**: 12-column symmetrical layout with an outer canvas margin of `2rem` (`margin`), column gutters of `1.5rem` (`gutter`), and a capped maximum content container width of `1280px`.
- **Tablet (640px - 1023px)**: 8-column layout with `1.5rem` margins and `1rem` gutters.
- **Mobile (up to 639px)**: 4-column layout with `1rem` margins (`margin-mobile`) and `0.75rem` gutters (`gutter-mobile`). Panels stack vertically; horizontal scroll strips are utilized exclusively for status chips and tool ribbons.

### Density & Rhythms
- Strict multiples of `4px` (`0.25rem`) govern all component spacing.
- Structural elements prefer chunkier groupings (`space-md` for standard card interiors, `space-lg` for section modular breaks).
- Dividers between components do not rely on whitespace alone; use structural solid rules (`2px solid #1a1a24`) to frame individual operational sectors.

## Elevation & Depth

This design system explicitly rejects Gaussian blur, light scattering, and soft ambient drop shadows. Elevation is conveyed through **mechanical offset layering** and **solid isometric drop projections**.

### Elevation Scale
1. **Level 0 (Chassis Ground)**:
   - Border: none.
   - Shadow: none.
   - Background: `#f4f4f0`.
2. **Level 1 (Docked / Flat Module)**:
   - Border: `2px solid #1a1a24`.
   - Shadow: none.
   - Background: `#ffffff` or `#e8e8e2`.
3. **Level 2 (Popped Cartridge / Interactive Standard)**:
   - Border: `2px solid #1a1a24`.
   - Shadow: `4px 4px 0px #1a1a24`.
   - Behavior: Used on default cards, static chips, and input fields.
4. **Level 3 (Tactile Actuator / Raised Interactive)**:
   - Border: `2px solid #1a1a24`.
   - Shadow: `6px 6px 0px #1a1a24`.
   - Hover Behavior: Shadow reduces to `3px 3px 0px #1a1a24`, element translates `translate(3px, 3px)`.
   - Active (Pressed) Behavior: Shadow reduces to `0px 0px 0px`, element translates `translate(6px, 6px)`.
5. **Level 4 (System Modal / Critical Overlay)**:
   - Border: `3px solid #1a1a24`.
   - Shadow: `8px 8px 0px #1a1a24`.
   - Backdrop: Solid `#1a1a24` at `50%` opacity or an alternating 1px diagonal pixel hatching pattern.

## Shapes

The shape profile is **0 (Sharp)** across the entire system.
- All elements have `border-radius: 0px` strictly applied to buttons, cards, modal windows, tags, avatar frames, checkboxes, and input fields.
- Decorative cutouts and corners can emulate 45-degree chamfered polygon edges (`clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)`) to mimic authentic microchip packages or arcade control panels.
- Inner elements must fit snugly against parent container borders without radial distortion.

## Components

### 1. Buttons
- **Primary Action**: Background `#009988`, text `#ffffff`, border `2px solid #1a1a24`, shadow `4px 4px 0px #1a1a24`. Font is `Space Mono` uppercase, bold.
- **Secondary Action (Special/Danger)**: Background `#d6006e`, text `#ffffff`, border `2px solid #1a1a24`, shadow `4px 4px 0px #1a1a24`.
- **Neutral / Chassis Action**: Background `#ffffff`, text `#1a1a24`, border `2px solid #1a1a24`, shadow `4px 4px 0px #1a1a24`.
- **States**: 
  - Hover: `transform: translate(2px, 2px)`, shadow `2px 2px 0px #1a1a24`.
  - Active: `transform: translate(4px, 4px)`, shadow `0px 0px 0px #1a1a24`.

### 2. Cards & Cartridge Modules
- **Structure**: Background `#ffffff`, border `2px solid #1a1a24`, shadow `4px 4px 0px #1a1a24`.
- **Header Bar**: Often topped with a dedicated sub-panel container (e.g., background `#e8e8e2`, bottom border `2px solid #1a1a24`) featuring a `label-md` category tracker and status dot indicator.

### 3. Input Fields & Form Controls
- **Text Inputs**: Background `#ffffff`, border `2px solid #1a1a24`, shadow `inset 2px 2px 0px rgba(26, 26, 36, 0.15)`. Text in `Space Grotesk`, placeholder in `Ink Muted` (`#585868`).
- **Focus**: Border `2px solid #009988`, outline none, shadow `inset 2px 2px 0px rgba(0, 153, 136, 0.2)`.

### 4. Checkboxes & Radio Buttons
- **Checkboxes**: Square box, `18px x 18px`, border `2px solid #1a1a24`, background `#ffffff`. When checked: background filled with `#009988`, marked with a sharp solid interior block (`8px x 8px` `#ffffff` square) rather than an organic vector checkmark.
- **Radio Buttons**: Retain sharp square-in-square geometry or a hard-bordered diamond layout (`transform: rotate(45deg)`).

### 5. Chips, Tags & Badges
- Built using `label-sm` or `label-md` in `Space Mono`.
- Border `1px solid #1a1a24` or `2px solid #1a1a24`.
- Background accents correspond to system tags: `#cc8800` for credits/currency, `#009988` for normal states, `#d6006e` for critical parameters. Zero border radius.

### 6. Lists & Data Tables
- Horizontal dividers: `1px solid #1a1a24`.
- Alternate row striping using `#ffffff` and `#f4f4f0`.
- Hover row state triggers a highlight using `#e8e8e2` with an arcade cursor indicator (`>` or solid block `■`) preceding the primary cell.

### 7. Custom Hardware Accents
- **Speaker Grille / Heat Vents**: Pattern composed of alternating `2px` horizontal rules or dotted pixel fields (`radial-gradient(#1a1a24 1px, transparent 1px)` with `4px` background size) used inside sidebars and panel headers.
- **D-Pad Directional Navigators**: Tactical button clusters with zero-radius contiguous borders forming directional controls for paginations and tab interfaces.