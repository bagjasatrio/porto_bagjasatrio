/* ==========================================================================
   theme.js — light / dark theme controller
   Portofolio Muhammad Bagja Satrio
   ==========================================================================
   Design note: DESIGN.md deliberately omits dark mode, to keep the
   paper-and-plastic feel of the light palette. This module exists because
   that omission was overridden by an explicit request. The dark values live
   in css/design-system.css under html[data-theme="dark"], not here -- this
   file only decides WHICH theme is active and tells the rest of the page.

   Responsibilities:
     - resolve the initial theme (manual choice > OS preference > light)
     - flip the attribute, the toggle's aria-pressed, and theme-color
     - keep the footer's SYSTEM STATUS readout in step with the theme
     - persist an explicit choice, so the OS cannot override it later
     - tell the hero canvas to re-read its tokens

   The INITIAL theme is NOT set here. main.js is deferred, so setting it in
   this file would paint the light theme first and then swap -- a white
   flash on every load for a dark-mode visitor. That job belongs to the
   synchronous pre-paint script in index.html, which runs before first
   paint. This module picks up from whatever that script decided.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var STORAGE_KEY = "bagja.theme";     // mirrors audio.js's "bagja.sfx"
  var THEME_COLOR = { light: "#f4f5f0", dark: "#12121c" };

  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  /* ---------------------------------------------------------------------
     Persistence.

     localStorage throws rather than returns in some privacy modes, so every
     access is guarded -- same approach, and same reasoning, as audio.js.
     A page that cannot remember your choice should still honour it for the
     session, so failures are swallowed rather than surfaced.
     --------------------------------------------------------------------- */

  function readStored() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      return v === "dark" || v === "light" ? v : null;
    } catch (err) {
      return null;
    }
  }

  function writeStored(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      /* Choice applies to this session only. */
    }
  }

  /* ---------------------------------------------------------------------
     State
     --------------------------------------------------------------------- */

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  /* Whether the visitor has made an explicit choice. While this is false the
     OS preference stays live; once true, it is ignored -- otherwise a
     visitor who deliberately picked light on a dark-OS machine would be
     flipped back the next time the OS preference changed. */
  function hasExplicitChoice() {
    return readStored() !== null;
  }

  /* ---------------------------------------------------------------------
     Apply

     `persist` is false when we are following the OS rather than a click, so
     that reacting to a system change does not silently become a manual
     choice that freezes the theme.
     --------------------------------------------------------------------- */

  function apply(theme, persist) {
    if (persist) writeStored(theme);

    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");

    // Swap the browser chrome colour. The two <meta> elements carry media
    // queries so the browser picks the right one on its own, but Safari
    // ignores that on some versions -- setting content directly is the
    // portable belt-and-braces. Both tags are updated so the media-query
    // path stays correct for the next system change.
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var m = metas[i];
      var wantsDark = m.getAttribute("media") === "(prefers-color-scheme: dark)";
      m.setAttribute("content", wantsDark ? THEME_COLOR.dark : THEME_COLOR.light);
    }

    syncButton(theme);

    // The hero canvas reads its colours from CSS custom properties, so it
    // needs a nudge to re-read them. Guarded because canvas.js bails out
    // early on a page with no arena, and because script order is not
    // guaranteed to have run it yet.
    if (window.Arena && window.Arena.refreshTheme) window.Arena.refreshTheme();
  }

  /* ---------------------------------------------------------------------
     Toggle button
     --------------------------------------------------------------------- */

  var button = document.getElementById("theme-toggle");
  var label = document.getElementById("theme-label");
  var iconSun = document.getElementById("theme-icon-sun");
  var iconMoon = document.getElementById("theme-icon-moon");
  var footerMode = document.getElementById("footer-theme-mode");

  function syncButton(theme) {
    if (footerMode) {
      footerMode.textContent = "ONLINE [" + (theme === "dark" ? "DARK" : "LIGHT") + "_MODE]";
    }

    if (!button) return;

    var isDark = theme === "dark";

    // aria-pressed describes the pressed state of the control. The button's
    // accessible name is the action ("Aktifkan mode gelap"), so the state
    // goes in aria-pressed rather than being baked into the label.
    button.setAttribute("aria-pressed", isDark ? "true" : "false");
    button.setAttribute(
      "aria-label",
      isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
    );

    if (label) label.textContent = isDark ? "MODE: DARK" : "MODE: LIGHT";

    // Show the icon of the CURRENT theme, matching the label text and the
    // SFX button's convention of showing state rather than action.
    if (iconSun) iconSun.hidden = isDark;
    if (iconMoon) iconMoon.hidden = !isDark;
  }

  function onToggle() {
    // Start from the rendered attribute rather than a cached variable: the
    // pre-paint script may have set it to something this module never saw.
    apply(current() === "dark" ? "light" : "dark", true);
  }

  /* ---------------------------------------------------------------------
     OS preference changes

     Only followed while the visitor has not chosen for themselves.
     --------------------------------------------------------------------- */

  function onSystemChange(e) {
    if (hasExplicitChoice()) return;
    apply(e.matches ? "dark" : "light", false);
  }

  if (media.addEventListener) media.addEventListener("change", onSystemChange);
  else if (media.addListener) media.addListener(onSystemChange);   // Safari < 14

  /* ---------------------------------------------------------------------
     Boot

     Adopt whatever the pre-paint script settled on, and wire the button.
     Deliberately NOT calling apply(..., true) here: that would persist the
     OS-derived theme as if the visitor had chosen it.
     --------------------------------------------------------------------- */

  syncButton(current());

  if (button) button.addEventListener("click", onToggle);

  /* ---------------------------------------------------------------------
     Cross-tab sync

     Another tab changing the theme should not leave this one stale. This is
     a nicety, not a requirement, hence the guard and the silent failure.
     --------------------------------------------------------------------- */

  window.addEventListener("storage", function (e) {
    if (!e || e.key !== STORAGE_KEY) return;
    var next = e.newValue === "dark" || e.newValue === "light"
      ? e.newValue
      : (media.matches ? "dark" : "light");
    apply(next, false);
  });

  /* Expose a small handle, in the same spirit as window.Arena and
     window.Chiptune. Useful for debugging and for the verification probe. */
  window.Theme = {
    get current() { return current(); },
    apply: function (theme) { apply(theme, true); },
    readStored: readStored
  };
})(window, document);
