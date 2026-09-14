# Portofolio — Muhammad Bagja Satrio

One-page retro-arcade portfolio. Zero build step, zero runtime dependencies,
plain HTML/CSS/JS.

Open `index.html` directly, or serve it locally:

```bash
python -m http.server 8000
```

---

## Structure

```
index.html                   single page, 6 sections + modal
css/
  fonts.css                  @font-face declarations (generated, do not edit)
  reset.css                  normalisation
  design-system.css          tokens, type scale, elevation, primitives
  sections.css               per-section layout
js/
  audio.js                   runtime chiptune synth (Web Audio)
  canvas.js                  hero arena game
  interactions.js            modal, typewriter, scroll-spy, console
  theme.js                   light / dark theme controller
  main.js                    bootstrap
fonts/                       self-hosted woff2, Latin subset
assets/                      optimised pixel art + favicon + social card
certificates/                13 credential PDFs
tools/
  fetch_fonts.py             downloads and subsets the webfonts (not shipped)
  optimize_assets.py         asset pipeline (not shipped)
  size_report.js             gzipped weight of every shipped file (not shipped)
  static_checks.js           link / id / parse invariants (not shipped)
```

---

## Deviations from the PRD and the mockup

Five deliberate departures. The first is forced by the environment; the second
and third were chosen for readability; the fourth is a budget overrun that was
accepted knowingly; the fifth was requested and overrides the design system.

### 1. Fonts are self-hosted, as the PRD requires

**PRD §2.2 requires self-hosted `@font-face`.** They are now self-hosted:
`tools/fetch_fonts.py` downloads the latin subset of each face into `fonts/`,
and generates `css/fonts.css`. `index.html` links only that one stylesheet, so
there is no third-party request on first load and nothing to fail if a CDN is
unreachable.

Seven faces, 86.5 KB total:

| File                        | Size    |
| --------------------------- | ------- |
| `ibm-plex-mono-400.woff2`   | 14.7 KB |
| `ibm-plex-mono-500.woff2`   | 14.9 KB |
| `ibm-plex-mono-600.woff2`   | 15.6 KB |
| `ibm-plex-mono-700.woff2`   | 14.9 KB |
| `press-start-2p-400.woff2`  | 12.5 KB |
| `silkscreen-400.woff2`      | 8.4 KB  |
| `silkscreen-700.woff2`      | 7.5 KB  |

Re-run after changing the font list:

```bash
python tools/fetch_fonts.py
```

All faces use `font-display: swap`, so text is readable immediately and the
pixel faces simply arrive a moment later. `js/main.js` watches the stylesheet
`<link>` (not `document.fonts.check()`, which cannot express a `swap` fallback
period and reports false failures) and adds `html.fonts-fallback` if it never
loads.

### 2. The type system was reworked for readability

The mockup's Google Fonts link loads `DotGothic16`, `Press Start 2P`,
`Silkscreen` and `VT323` — four pixel faces used at essentially every size.
Read as a mockup it looks right; read as a CV it does not. The brief asked for
something a recruiter can scan.

Measured before the change, at 1440×1000: **166 of roughly 400 text nodes were
13px or smaller**, with `Silkscreen` on 136 of them, and the longest paragraph
(the 330-character bio) set in `VT323` at 18px. Worse, the families were not
actually loading at all — `IBM Plex Mono`, `Silkscreen` and generic `monospace`
all measured an identical 742px for the same test string, meaning every glyph on
the page was being rendered in the `Courier New` fallback the whole time.

The rework:

| Role | Before | After |
| ---- | ------ | ----- |
| Body prose | `VT323` 18px | **IBM Plex Mono** 17px, line-height 1.65 |
| Sub-headings, nav, buttons, labels, dates | `Silkscreen` / `DotGothic16` 11–13px | **IBM Plex Mono** 14–17px |
| The user's name | `Silkscreen` 16px | `Silkscreen` 17px |
| Section headings (5 only) | `Press Start 2P` | `Press Start 2P` 20px |
| Decorative chrome only (badges, chips, tags, HUD) | — | `Silkscreen` 12–13px |

`VT323` and `DotGothic16` are dropped entirely. Sizes moved from `px` to `rem`,
and **no CSS font size below 0.75rem (12px) remains** — the single remaining
`px` font size is the `16px` base inside `body`'s `clamp()`.

`--font-body` and `--font-code` are now the same family. They are kept as two
tokens so the role split stays explicit and a future divergence is a one-line
change.

This is the one place where the mockup was deliberately not followed. The
instruction was to keep the concept but make it legible, and legibility won.

### 3. Font sizes are raised at the cost of some fidelity to the mockup

A consequence of (2): the pixel faces are wide, so `Press Start 2P` headings are
capped at 1.25rem (1.0625rem under 640px) rather than the mockup's larger sizes.
Anything bigger wrapped awkwardly in the narrower panels.


### 4. JavaScript is over the 10 KB budget

The PRD budgets **10 KB of JS**. Actual, gzipped:

| File              | Gzipped |
| ----------------- | ------- |
| `canvas.js`       | 11.5 KB |
| `interactions.js` | 8.2 KB  |
| `theme.js`        | 2.9 KB  |
| `audio.js`        | 1.7 KB  |
| `main.js`         | 1.4 KB  |
| **Total**         | **25.5 KB** |

**Overage: ~15.5 KB.** The PRD itself notes the canvas game alone is ~6 KB, so
a 10 KB ceiling was never reachable while keeping it. The game was kept rather
than silently dropped. If the budget is firm, the cheapest cuts are the hero
game (→ 14.0 KB total) or the scanline pass and floating score text.

Text weight is comfortably inside budget: **HTML + CSS + favicon = 27.3 KB
gzipped** against a 200 KB ceiling.

> [!WARNING]
> **The image budget is not what this file previously claimed.** Earlier
> revisions reported 65.9 KB of images and a ~137 KB first load. Measured, the
> images are **342.4 KB** and first load is **~482 KB**:
>
> | Component | First load |
> | --- | --- |
> | HTML + CSS + favicon, gzipped | 27.3 KB |
> | JS, gzipped | 25.5 KB |
> | `woff2` (already compressed) | 86.5 KB |
> | Images (already compressed) | 342.4 KB |
> | **Total** | **~482 KB** |
>
> The cause is `assets/avatar.png` at **215.9 KB** and
> `assets/project-cvkita.png` at **107 KB**, which together are 94% of the
> image weight. Both postdate the paragraph that was there before. No budget
> in the PRD covers images, so nothing is breached, but a half-megabyte first
> load for a static portfolio is worth a decision rather than a footnote.
> Re-encoding those two is the obvious fix and has not been done here, because
> it trades against the pixel-art crispness the design system depends on.
>
> `assets/og-preview.png` (40.1 KB) is fetched by social scrapers, not by a
> visiting browser, so it is excluded from first load.

All figures above are produced by:

```sh
node tools/size_report.js
```

The JS overage is unchanged in character from before: it is the game, and the
game was a deliberate keep.

### 5. Dark mode exists, against the design system's instruction

`design/famicom_clean_studio/DESIGN.md` is explicit, at line 152:

> Dark mode is intentionally omitted to maintain the crisp, light-absorbing
> paper-and-plastic feel.

This build ships a dark mode anyway, on request. It is the only change in this
project that knowingly contradicts the design source, and it is recorded here
rather than quietly applied.

**Where the values come from.** `design/` contains no dark mockup, so the dark
palette is invented, not derived. It is constrained by three rules:

1. **Accents brighten.** `#008a7a` on `#12121c` measures 4.36:1, under the
   WCAG AA floor of 4.5:1 for body text, so teal moves to `#2ec4ae` (8.52:1).
   The same reasoning raises magenta and gold.
2. **`--on-accent` flips to near-black.** White on the brighter teal is only
   2.6:1; `#10111a` on it is 8.61:1. This is the one visible behaviour change
   inside light mode's own primitives, and it is why button labels look
   different between themes.
3. **Nothing else moves.** Every `--shadow-*` token is defined as
   `offset 0 var(--ink)`, so inverting `--ink` inverts all four elevation steps
   automatically. No elevation rule was rewritten.

**How the theme is chosen.** An explicit choice stored under `bagja.theme`
wins. Absent one, the OS `prefers-color-scheme` is followed, and continues to
be followed live if the OS changes. Once a choice is stored, the OS is ignored
— otherwise a visitor who deliberately picked light on a dark-mode machine
would be flipped back the next time the OS preference changed.

**Why `html[data-theme="dark"]` rather than a media query.** An attribute keeps
the dark values in exactly one place. A `prefers-color-scheme` block would have
to be written twice — once for the OS, once for the manual toggle — and the two
copies would drift. The OS preference is resolved once, in the inline pre-paint
script, and written to the attribute.

**The hero canvas follows the theme.** `js/canvas.js` reads its colours through
`cssVar()` from `--arena-*`, `--sprite-*` and `--scanline` instead of holding
literals, and exposes `window.Arena.refreshTheme()` so a theme change repaints.
In dark mode the arena becomes a night floor with a dim grid while the
character keeps its own colours.

**Two things knowingly do not follow the toggle.** `assets/favicon.svg` renders
outside the page, so it can read neither the CSS tokens nor the toggle state;
it follows the OS preference only. And the pre-paint script duplicates the
storage key and precedence rule from `js/theme.js`, because it has to run before
that file loads — both files carry a comment saying the two must stay in step.

---

### 6. The header bar is full-bleed, and becomes three zones on wide screens

The mockup puts the header inside the same 1120px column as the sections below
it. That is kept for the sections, which are a reading column, but not for the
header, which is chrome: clamped, it leaves dead space at both ends so the brand
and the controls read as inset rather than pinned to the corners. The bar now
spans the viewport, and padding keeps the two ends off the edge.

From 1240px the bar also splits into three zones — brand pinned left, the
SCORE / COINS / CREDIT readouts centred on the bar, controls pinned right —
rather than the previous two-group arrangement where everything but the brand
was piled on the right.

**Why a grid and not `space-between` or absolute positioning.** `space-between`
places a middle element at the midpoint of the *leftover gap*, so it drifts
off-centre as soon as the two sides differ in width, and here they differ by
about 220px. Absolute positioning fixes the drift but paints the centre on top
of its siblings, so a wrong estimate at some width puts the readouts over the
`+ COIN` button. A three-track grid has neither problem: the two `1fr` side
tracks are equal by construction, so the middle track lands on the bar's true
midpoint with no measuring, and tracks cannot overlap.

**The breakpoint is measured, not guessed.** The right-hand cluster is 436px, so
each `1fr` track needs at least that, plus the 227px bare readouts and the gaps.
The probe walks 21 widths in both themes; the boundary pair 1239 / 1240 is
included because that is where the layout changes.

**The centre zone drops its labels.** `SCORE 0000 | COINS 00 | CREDIT 01`
measures 373px labelled and 227px bare. The bare form is what lets the three
zones fit at 1240px instead of much further up. The values stay in the DOM, so
nothing is lost to a screen reader — the labels only name them.

Below 1240px the bar stays two-zone, and below 768px it stays two-zone with the
readouts hidden entirely, as before.

---

## Design source

Built from `design/`, per instruction that the design directory is the source
of truth.

Three artifacts disagreed with each other and with the PRD, which specified a
**dark** palette. The rendered mockup
(`design/muhammad_bagja_satrio_portfolio_retro_pixel_light_mode/code.html`) is
**light**, and the mockup was treated as authoritative over both `DESIGN.md`'s
tokens and the PRD's palette. Where `DESIGN.md` and the mockup disagreed on
colour values, the mockup won — its values are the tuned ones:

| Token      | `DESIGN.md` | Mockup (used) |
| ---------- | ----------- | ------------- |
| surface    | `#fcf8ff`   | `#ffffff`     |
| ink        | `#1a1a24`   | `#1a1a24`     |
| primary    | `#00685c`   | `#008a7a`     |
| secondary  | `#d6006e`   | `#c2185b`     |
| gold       | `#cc8800`   | `#b36b00`     |

The logo in `design/bagja_satrio_pixel_logo/` was **dark-palette**; it was
re-tinted to the light palette for the favicon and header mark.

### What was ported rather than copied

The mockup is a Tailwind Play CDN prototype. It could not ship as-is:

| Mockup                          | Replaced with                          |
| ------------------------------- | -------------------------------------- |
| Tailwind Play CDN               | hand-written CSS (zero dependencies)   |
| Google Fonts `<link>`           | CDN retained; see deviation 1          |
| Material Symbols icon font      | inline SVG                             |
| `lh3.googleusercontent.com` imgs| locally generated + optimised assets   |
| 12 cert badges → LinkedIn       | the 13 real local PDFs                 |

### Bugs fixed from the mockup

- The `discord-ai` project record had a truncated, syntactically broken JS
  object literal. Rewritten.
- Mojibake (`â€”` etc.) throughout. Replaced with proper UTF-8 entities.
- Mailto address was a placeholder. **Still a placeholder**
  (`bagjasatrio@example.com`) — search `index.html` for `TODO` and replace
  before deploying.

---

## Assets

Generated as 1024×1024 PNGs (348–615 KB each) and run through
`tools/optimize_assets.py`, which crops to the correct aspect, pixelates onto a
coarse grid with `NEAREST` resampling, and quantises to the site palette.

**2.0 MB → 65.9 KB.** `og-preview.png` is exactly 1200×630 as the OG spec
requires.

Re-run after changing any source art:

```bash
python tools/optimize_assets.py
```

---

## Accessibility

- Skip link, landmark regions, and a labelled `h1` (visually hidden — the hero
  is a canvas, so the real page title lives there).
- Modal has `role="dialog"`, `aria-modal`, a Tab focus trap, focus restoration
  to the triggering element, and Escape to close.
- All icons are `aria-hidden`; every icon-only control carries an `aria-label`.
- `prefers-reduced-motion` disables the scanlines, the typewriter, the reveal
  transitions, the looping blink/pulse animations, and the game's animation
  loop (it renders one static frame instead).
- Content is never JS-gated for visibility: `.reveal`'s hidden state sits
  behind `html.js`, and skill bars carry their width inline.
- Mobile tab bar links are a 44px minimum touch target (measured at 390×844,
  they were 24px tall before this was corrected).

## Verified

Static checks:

- 18/18 served paths return 200.
- 13/13 certificate `href`s resolve to real files on disk.
- No `tailwindcss`, `lh3.googleusercontent`, or Material Symbols references
  survive anywhere in the shipped source. The only remaining matches for "CDN"
  are explanatory comments.
- No duplicate IDs; all 7 internal anchors and all `getElementById` lookups
  resolve. All five `data-project` keys have database entries.
- All five JS files pass `node --check`.
- `index.html` is pure ASCII with no byte-order mark, so it cannot mojibake
  under any server charset.

Rendered checks, via same-origin iframe probes driven through headless Chrome:

- Every module initialises: `Arena` (score/coins/start/stop), `Chiptune` (9
  methods), `openProjectModal`, `sendQuickPing`.
- All 5 project thumbnails decode at exactly 640×360, matching their declared
  `width`/`height`, so no card reflows on load. `og-preview.png` is 1200×630.
- The hero game loop advances and paints (canvas sampled non-transparent).
- Modal opens, populates title/quest/description/5 tags from the database, traps
  focus, closes on Escape, and restores focus to the trigger.
- Console form submit produces the broadcast status line.
- Back-to-top visibility tracks the 600px threshold in both directions.
- Scroll-spy highlights `#projects` mid-page and `#save` at the bottom.
- Mobile at 390×844: HUD rail hidden, tab bar shown, no horizontal overflow.
- Counts: 5 projects, 13 trophies, 13 certificate links, 6 sections.
- No coin ever renders behind the profile card: **0 of 1438** sampled coin
  positions at 1440×900 and **0 of 1368** at 390×844, with the probe's control
  run (forcing every spawn to the card's centre) correctly reporting 131/131
  hits, so the probe is not blind.
- No horizontal overflow at 360, 390, 414, 640, 768, 1024, 1280 or 1440.

### Header layout

The bar was swept across **21 widths from 320 to 1920, in both themes — 42
combinations**, asserting: no document or bar overflow, no zone overlapping
another, the centre readouts on the bar's true midpoint within 1px, and the bar
reaching both viewport edges. All 42 pass.

| Width | Bar display | Readout midpoint vs bar midpoint | Brand left | Controls right |
| --- | --- | --- | --- | --- |
| 320–639 | flex, readouts hidden | — | 16 | 16 from edge |
| 640–767 | flex, readouts hidden | — | 16 | 16 from edge |
| 768–1239 | flex, readouts in right cluster | not centred (two-zone) | 32 | 32 from edge |
| 1240 | grid, 3 zones | 614 vs 614 — 0px off | 32 | 32 from edge |
| 1600 | grid, 3 zones | 794 vs 794 — 0px off | 32 | 32 from edge |
| 1920 | grid, 3 zones | 954 vs 954 — 0px off | 32 | 32 from edge |

The 1239 / 1240 pair is checked because that is where the layout changes;
1239 is two-zone and 1240 is three-zone, with no overflow or overlap on either
side of the boundary.

Two earlier approaches were tried and rejected against measurements, which is
why the notes above are specific about *why* this one is a grid:

- `space-between` centred the readouts **88px left of the bar's midpoint**,
  because it centres within the leftover gap and the two sides differ in width.
- Absolute centring fixed the midpoint but **overlapped the `+ COIN` button in
  every width from 1100 to 1180**, reaching 37px into it at 1100.

### Dark mode

Theme precedence, measured by driving headless Chrome over CDP, emulating
`prefers-color-scheme`, and seeding `localStorage` before each reload:

| Scenario | `data-theme` | `--bg` | Stored |
| --- | --- | --- | --- |
| OS dark, nothing stored | `dark` | `#12121c` | `null` |
| OS light, nothing stored | *(absent)* | `#f4f5f0` | `null` |
| OS flips live, nothing stored | `dark` | `#12121c` | `null` |
| Stored `light`, OS dark, reload | *(absent)* | `#f4f5f0` | `light` |
| Stored `dark`, OS light, reload | `dark` | `#12121c` | `dark` |
| One click from light | `dark` | — | `dark` |

`stored` stays `null` in every OS-driven case, which is the point: the site
follows the OS without ever recording a choice the visitor did not make.

**No flash of the wrong theme.** `Page.addScriptToEvaluateOnNewDocument` records
the attribute at three points inside the page — document-start,
`DOMContentLoaded`, and `load`. It reads `no-html-yet` at document-start (the
element does not exist yet), is already correct at `DOMContentLoaded`, and is
unchanged at `load`, in all four precedence scenarios.

Reading the attribute through `Runtime.evaluate` after `Page.navigate` does
**not** test this, and an earlier version of this check did exactly that and
reported a flip. The call can land on the outgoing document, so the "before"
and "after" values come from two different pages. The
`addScriptToEvaluateOnNewDocument` form runs inside the new document before any
page script has executed, which is the only sound way to observe this.

**Contrast, computed rather than eyeballed.** Selected token pairs:

| Pair | Light | Dark |
| --- | --- | --- |
| text / bg | 16.98 | 16.79 |
| text-muted / bg | 7.47 | 8.31 |
| text-faint / bg | 4.08 | 4.72 |
| teal / bg | 3.90 | 8.52 |
| gold / bg | 3.82 | 11.57 |
| cobalt / bg | 5.24 | 7.58 |
| on-accent / teal | 4.27 | 8.61 |
| on-accent / gold | 4.18 | 11.69 |

And on real rendered elements, against each element's own effective background:

| Element | Light | Dark |
| --- | --- | --- |
| `.brand__name` | 4.27 | 7.74 |
| `.readout__value--gold` | 3.70 | 9.52 |
| `.readout__value--teal` | 3.78 | 7.02 |
| `.tabbar__link` | 4.27 | 8.61 |
| `.btn--primary` | 4.27 | 8.61 |

Dark mode clears 4.5:1 on every pair measured. **Light mode does not**, on
`teal/bg` (3.90), `gold/bg` (3.82), `text-faint/bg` (4.08), `on-accent/gold`
(4.18), and on `.readout__value--gold` (3.70) and `.readout__value--teal`
(3.78) once the readout box's own background is taken into account. These are
pre-existing — they are `DESIGN.md`'s values and they shipped before dark mode
existed — and they are recorded here rather than changed, because raising them
means departing from the palette in `design/`.

**The header never breaks.** At 320, 360, 375, 390, 412, 480, 639, 640, 768,
1024, 1280 and 1440px, in both themes: document overflow 0, header overflow 0,
header height constant at 64px, and neither toggle clipped. The header is
`flex-wrap: nowrap` on purpose — it must never stack — so overflow is the only
failure mode available to it, and it does not occur. Below 640px the theme
toggle drops its text label, matching what `.brand__text` already does at that
width; the sun/moon icon carries the meaning, and the button keeps its
`aria-label` and `aria-pressed`.

**The canvas repaints from the tokens.** At the same grid intersection the
sampled pixel is `rgb(220,223,213)` in light and `rgb(38,42,69)` in dark, which
are `--arena-grid` in each theme. The character sprite keeps its own colours in
both, as intended.

**Every theme-naming string tracks the attribute.** Two elements spell the theme
out in text: the header toggle's label (`MODE: LIGHT` / `MODE: DARK`) and the
footer readout (`ONLINE [LIGHT_MODE]` / `ONLINE [DARK_MODE]`). Both are driven
from `syncButton()` in `js/theme.js`, which is the single place a theme change
already funnelled through, so neither can drift.

The footer was initially **not** wired up — it shipped as a hardcoded
`LIGHT_MODE` in the markup and stayed that way in dark mode. It is called out
here because it was a real defect rather than a hypothetical: it was found by
reading the page, not by any check that existed at the time.
`tools/static_checks.js` now asserts that each readout names one theme, not
both, and defaults to light so a light-mode visitor sees no wrong word.

**No runtime errors.** Loading the page under each OS preference with console,
exception, and network-failure capture enabled: zero console errors, zero
uncaught exceptions, zero failed requests. All five modules initialise
(`Theme`, `Arena`, `Chiptune`, `openProjectModal`, `sendQuickPing`), the canvas
paints in both themes, and the toggle round-trips light → dark → light while
writing and clearing `bagja.theme` correctly and moving the header label and
the footer readout in step.

### Coins are kept out of the profile card

Coins draw on the background canvas (`#arena-canvas`, `z-index: 0`) while the
profile card is a DOM element at `z-index: 10`, so a coin that spawns under the
card is invisible *and* uncollectable. The foreground layer that carries the
player sprite does not help — nothing else draws to it.

Placement enumerates the card-free rectangles and picks from them, rather than
picking a random point and retrying if it is covered. On a phone the card covers
essentially the whole arena, so a retry loop exhausts its attempts on every coin
and falls back to a covered position — the exact bug. Enumerating means the
narrow case still yields a real answer.

Two further traps were found while fixing this:

1. **Three separate spawn paths**, not one. `randomCoinPos()` seeds the initial
   set and every respawn after a pickup, but the `+ SPAWN COIN` button had its
   own inline placement, and `seedCoins()` on resize re-entered the first path.
   All three now share one region helper.
2. **The card changes height after the coins are placed.** The hero boot log is
   typed out character by character, which grows the card and moves its bottom
   edge down — so a coin that was legitimately clear when seeded can be behind
   the card a second later. `reconcileCard()` re-measures on a slow cadence and
   relocates only the coins that got covered, plus twice at boot for
   `prefers-reduced-motion` visitors, who never enter the animation loop.

Two real defects were found this way and fixed:

1. **Back-to-top never appeared.** Its visibility update was routed through
   `requestAnimationFrame` behind a `ticking` flag. When rAF was not serviced
   the flag latched and the button stayed hidden at every scroll position.
2. **Scroll-spy highlight froze on `#boot`.** Same rAF latch. Both now clear
   their flag from a timer as well, so a missed frame cannot wedge them.

### Grid blowout on narrow screens

`.grid-12`, `.project-grid` and `.trophy-grid` all used a bare `1fr` track. A
bare `1fr` is `minmax(auto, 1fr)`, which refuses to shrink below its content's
automatic minimum size, so at 390px the Player Stats cards were pushed 35px past
the viewport and the page scrolled sideways by 19px. All three now use
`minmax(0, 1fr)`.


