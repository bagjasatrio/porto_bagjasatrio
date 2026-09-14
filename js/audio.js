/* ==========================================================================
   audio.js — chiptune SFX synthesis
   Portofolio Muhammad Bagja Satrio
   ==========================================================================
   Generates every sound at runtime with the Web Audio API. No audio files are
   shipped, which keeps the page weight down and sidesteps the browser autoplay
   policy: nothing is created until the user's first interaction.

   Public surface (window.Chiptune):
     init()            create or resume the AudioContext; call on a gesture
     tone(f, d, type)  one-shot oscillator beep
     coin()            two-note pickup jingle
     confirm()         short rising acknowledgement
     error()           descending buzz for rejected input
     openSting()       modal open
     closeSting()      modal close
     toggle()          flip mute, persist, return the new state
     enabled           current mute state (getter)
   ========================================================================== */

(function (window, document) {
  "use strict";

  var STORAGE_KEY = "bagja.sfx";

  var ctx = null;
  var enabled = true;

  /* ---------------------------------------------------------------------
     Persistence. localStorage throws in some privacy modes, so every access
     is guarded rather than assumed.
     --------------------------------------------------------------------- */
  function readPref() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      if (v === "off") return false;
      if (v === "on") return true;
    } catch (e) {
      /* storage unavailable -- fall through to the default */
    }
    return true;
  }

  function writePref(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
    } catch (e) {
      /* non-fatal: the toggle still works for this session */
    }
  }

  /* ---------------------------------------------------------------------
     Context lifecycle
     --------------------------------------------------------------------- */
  function init() {
    if (ctx) {
      // Browsers start the context suspended until a user gesture resumes it.
      if (ctx.state === "suspended") {
        try { ctx.resume(); } catch (e) { /* ignore */ }
      }
      return ctx;
    }

    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null; // no Web Audio support: degrade to silence

    try {
      ctx = new Ctor();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  /* ---------------------------------------------------------------------
     Core tone generator.

     A short exponential ramp to near-zero avoids the click an abrupt stop
     produces on a square wave.
     --------------------------------------------------------------------- */
  function tone(freq, duration, type) {
    if (!enabled) return;

    var audio = init();
    if (!audio) return;

    try {
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      var now = audio.currentTime;
      var dur = duration || 0.08;

      osc.type = type || "square";
      osc.frequency.setValueAtTime(freq, now);

      // Quiet by design: this is UI feedback, not music.
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch (e) {
      /* Autoplay restriction or a closed context: silently skip. */
    }
  }

  /* Classic two-note coin: a high blip rising into a longer ring. */
  function coin() {
    if (!enabled) return;
    tone(987.77, 0.08, "square"); // B5
    window.setTimeout(function () {
      tone(1318.51, 0.25, "square"); // E6
    }, 80);
  }

  function confirm() {
    if (!enabled) return;
    tone(880, 0.07, "sine"); // A5
  }

  function error() {
    if (!enabled) return;
    tone(220, 0.12, "square");
    window.setTimeout(function () {
      tone(165, 0.16, "square");
    }, 110);
  }

  function openSting()  { tone(523.25, 0.10, "sawtooth"); } // C5
  function closeSting() { tone(392.00, 0.10, "square"); }   // G4

  /* ---------------------------------------------------------------------
     Toggle
     --------------------------------------------------------------------- */
  function toggle() {
    enabled = !enabled;
    writePref(enabled);
    if (enabled) {
      // Audible confirmation that sound is back on.
      tone(880, 0.09, "sine");
    }
    return enabled;
  }

  enabled = readPref();

  window.Chiptune = {
    init: init,
    tone: tone,
    coin: coin,
    confirm: confirm,
    error: error,
    openSting: openSting,
    closeSting: closeSting,
    toggle: toggle,
    get enabled() { return enabled; }
  };
})(window, document);

