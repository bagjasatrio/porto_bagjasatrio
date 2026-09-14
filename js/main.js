/* ==========================================================================
   main.js — bootstrap
   Portofolio Muhammad Bagja Satrio
   ==========================================================================
   Deliberately thin. Each behaviour module self-initialises on load, so this
   file exists to handle the few cross-cutting concerns that belong to no
   single module:
     - the pre-paint theme/JS flag
     - a no-JS / failed-CDN safety net
     - soft error reporting
   ========================================================================== */

(function (window, document) {
  "use strict";

  // Mark that scripting is available. styles.css uses this to decide whether
  // to hide the .reveal elements up front -- without JS they must stay visible.
  document.documentElement.classList.add("js");

  /* ---------------------------------------------------------------------
     Safety net for the webfonts.

     css/fonts.css is self-hosted, but it still might not arrive -- a bad
     deploy, a truncated upload, a 404 on fonts/. If it fails, Press Start 2P
     and Silkscreen fall back to Courier New, which is narrower, so the
     display headings would reflow. We detect that and apply a compensating
     class.

     Only the two display faces need compensating: the text faces are IBM Plex
     Mono, and Courier New is metrically close enough that body copy is fine.

     Note the earlier approach -- document.fonts.check('16px "Press Start 2P"')
     -- is unreliable here: the check() API has no way to express a
     font-display fallback period, so it reports false for display:swap faces
     even when they would render correctly. It produced a false failure.
     --------------------------------------------------------------------- */
  function watchFonts() {
    var link = document.getElementById("font-stylesheet");
    if (!link) return; // nothing declared: nothing to verify

    if (link.sheet) return; // already resolved

    link.addEventListener("load", function () { /* ok */ });
    link.addEventListener("error", function () {
      document.documentElement.classList.add("fonts-fallback");
    });

    // Backstop for a request that never settles.
    window.setTimeout(function () {
      if (!link.sheet) document.documentElement.classList.add("fonts-fallback");
    }, 6000);
  }

  /* ---------------------------------------------------------------------
     Surface hard failures instead of dying silently.

     Modules guard their own DOM lookups, so an error here means something
     genuinely unexpected happened.
     --------------------------------------------------------------------- */
  window.addEventListener("error", function (e) {
    if (!e || !e.message) return;
    // Keep it quiet in production but traceable when a developer looks.
    if (window.console && window.console.warn) {
      window.console.warn("[portfolio] runtime error:", e.message);
    }
  });

  function boot() {
    watchFonts();

    // The hero canvas is the heaviest module; if it threw for any reason the
    // rest of the page must still be usable.
    if (!window.Arena && window.console && window.console.warn) {
      window.console.warn("[portfolio] hero arena unavailable");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window, document);
