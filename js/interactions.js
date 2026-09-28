/* ==========================================================================
   interactions.js — page behaviour
   Portofolio Muhammad Bagja Satrio
   ==========================================================================
   Owns everything that is not the hero canvas or the audio engine:
     - boot log typewriter
     - scroll-spy for the HUD rail / mobile tab bar
     - reveal-on-scroll
     - skill bar fill on entry
     - project intel modal (with focus trap)
     - SFX toggle
     - contact "telemetry ping" console
     - back-to-top
   ========================================================================== */

(function (window, document) {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var Chiptune = window.Chiptune;

  /* =====================================================================
     1. PROJECT DATABASE

     Keyed by the value passed to openProjectModal() from each card.
     All copy is UTF-8 with proper typographic characters.
     ===================================================================== */
  var projectDatabase = {
    "clipmax": {
      quest: "PROJECTS 1 // AUTONOMOUS AI & DESKTOP MULTIMEDIA",
      title: "ClipMax — Autonomous Desktop AI Video Clipper",
      desc: "Aplikasi desktop Python yang mengonversi video panjang menjadi klip vertikal 9:16 otomatis menggunakan AI. Dilengkapi Universal LLM Provider Gateway (9Router, OpenRouter, Groq, Gemini) untuk kurasi segmen viral, transkripsi Faster-Whisper terakselerasi CUDA, face-tracking otomatis MediaPipe, dan rendering FFmpeg NVENC dengan 85 automated test.",
      tags: ["PYTHON", "CUDA", "FASTER_WHISPER", "MEDIAPIPE", "FFMPEG_NVENC", "LLM_GATEWAY", "PYTEST"],
      liveUrl: "https://github.com/bagjasatrio/clipmax",
      liveLabel: "[ Buka Repositori GitHub ]"
    },
    "clipmax-mobile": {
      quest: "PROJECTS 2 // ON-DEVICE AI & MOBILE MULTIMEDIA",
      title: "ClipMax Mobile — On-Device AI Video Studio",
      desc: "Aplikasi mobile Flutter/Dart yang mengubah video panjang menjadi klip pendek langsung di perangkat (on-device). Mengintegrasikan Universal AI Router multi-provider (Gemini, Groq, OpenAI, OpenRouter), transkripsi audio Whisper.cpp native via Dart FFI, serta editor video multi-layer teks dan stiker berkinerja tinggi 120 FPS.",
      tags: ["FLUTTER", "DART", "WHISPER_CPP", "DART_FFI", "ON_DEVICE_AI", "MULTI_LAYER_EDITOR"],
      liveUrl: "https://github.com/bagjasatrio/clipmax-mobile",
      liveLabel: "[ Buka Repositori GitHub ]"
    },
    "job-automation": {
      quest: "PROJECTS 3 // AUTONOMOUS AGENT & BROWSER RPA",
      title: "Job Application Automation & AI Career Co-Pilot",
      desc: "Sistem otomasi pelamaran kerja end-to-end berbasis Python, Google Gemini, dan Playwright. Menjalankan pelamaran hybrid (cold email HRD dan portal LinkedIn, Glints, Jobstreet) dengan screening kualifikasi ATS (skor minimal 75%), filter anti-scam, serta pembuatan cover letter dan CV tailored otomatis. Dilengkapi remote control via Telegram Bot, sinkronisasi tracker Google Sheets, auto follow-up, dan 53 unit test.",
      tags: ["PYTHON", "PLAYWRIGHT", "GEMINI_API", "TELEGRAM_BOT", "GOOGLE_SHEETS", "ATS_FILTER", "PYTEST"],
      liveUrl: "https://github.com/bagjasatrio/job-apply-automation",
      liveLabel: "[ Buka Repositori GitHub ]"
    },
    "cvkita": {
      quest: "PROJECTS 4 // FULL-STACK PRODUCT & DOCUMENT ENGINEERING",
      title: "CVKita — AI-Powered Career Profile & Resume Platform",
      desc: "Platform AI presisi tinggi untuk manajemen profil karier dan pembuatan resume yang disesuaikan dengan kualifikasi pekerjaan target (Job Matching & ATS Optimization). Menggunakan satu profil data tunggal untuk menghasilkan PDF deterministik bebas halusinasi, pencocokan lowongan real-time, dan cover letter generator.",
      tags: ["NEXT_JS", "TAILWIND", "ATS_ENGINE", "PDF_GEN", "JOB_MATCHING", "VERCEL"],
      liveUrl: "https://cv-kita.vercel.app/",
      liveLabel: "[ Buka Live Demo ]"
    },
    "losari-jaya": {
      quest: "PROJECTS 5 // FULL-STACK ERP & INVENTORY",
      title: "Pengelolaan Gudang TB.Losari-Jaya-2",
      desc: "Aplikasi web fullstack untuk sistem manajemen gudang, pelacakan inventaris bahan bangunan, dan sistem kasir (POS) di TB.Losari Jaya 2. Dirancang dengan manajemen stok otomatis, pencatatan transaksi real-time, serta pelaporan keluar-masuk barang yang akurat dan terstruktur.",
      tags: ["FULLSTACK", "MYSQL", "REST_API", "INVENTORY_MANAGEMENT", "POS_SYSTEM"],
      liveUrl: "https://github.com/bagjasatrio/TB.Losari-Jaya-2",
      liveLabel: "[ Buka Repositori GitHub ]"
    },
    "starfall": {
      quest: "PROJECTS 6 // E-COMMERCE & PAYMENT GATEWAY",
      title: "Website TopUp Game Online dan Token Listrik",
      desc: "Platform e-commerce layanan digital untuk top-up game online dan pembelian token listrik secara instan. Mengintegrasikan API aggregator produk dan payment gateway otomatis agar setiap transaksi diproses dan diselesaikan secara real-time tanpa intervensi manual.",
      tags: ["PHP", "PAYMENT_GATEWAY", "API_INTEGRATION", "MYSQL", "E_COMMERCE"],
      liveUrl: "https://github.com/bagjasatrio/starfallstore",
      liveLabel: "[ Buka Repositori GitHub ]"
    },
    "damkar": {
      quest: "PROJECTS 7 // WEB ARCHITECTURE & CITIZEN PORTAL",
      title: "Portal Dinas Pemadam Kebakaran Kota Semarang",
      desc: "Portal resmi Dinas Pemadam Kebakaran Kota Semarang sebagai kanal informasi dan pelaporan darurat bagi warga. Antarmuka dibangun secara modular dan responsif 100% pada perangkat mobile warga dan desktop ruang komando, dengan transisi Framer Motion dan data titik rawan yang terhubung via REST API.",
      tags: ["REACT", "REST_API", "TAILWIND", "GEOJSON", "CI_CD", "KOMINFO_SEMARANG"]
    }
  };

  /* =====================================================================
     1b. SKILL DATABASE

     Keyed by the value passed to openSkillModal() from each matrix row.
     The Attribute Matrix only shows a category; the full stack lives here so
     the rows stay scannable.
     ===================================================================== */
  var skillDatabase = {
    "frontend": {
      quest: "ATTRIBUTE // FRONTEND ARCHITECTURE",
      title: "Frontend Architecture",
      desc: "Merancang dan membangun antarmuka web modern yang cepat, modular, dan responsif 100% di semua perangkat. Berfokus pada arsitektur komponen yang bersih, performa rendering optimal, dan interaksi yang halus.",
      tags: ["REACT.JS", "NEXT.JS", "TYPESCRIPT", "JAVASCRIPT", "TAILWIND_CSS",
             "BOOTSTRAP", "FRAMER_MOTION", "HTML5", "CSS3"]
    },
    "backend": {
      quest: "ATTRIBUTE // BACKEND & API INTEGRATION",
      title: "Backend & API Integration",
      desc: "Membangun RESTful API yang andal, aman, dan berkinerja tinggi. Berpengalaman menghubungkan sistem ke pihak ketiga, menangani alur autentikasi, serta mengintegrasikan payment gateway otomatis.",
      tags: ["PYTHON", "FASTAPI", "NODE.JS", "PHP", "LARAVEL",
             "REST_API", "PAYMENT_GATEWAYS", "API_INTEGRATION"]
    },
    "ai": {
      quest: "ATTRIBUTE // LLM INTEGRATION & API GATEWAY",
      title: "LLM Integration & API Gateway",
      desc: "Mengintegrasikan Large Language Models ke sistem produksi multi-provider melalui API gateway/proxy (OpenAI-compatible endpoints seperti 9Router, OpenRouter, Groq, dan Gemini API). Merancang prompt engineering presisi untuk mencegah halusinasi data.",
      tags: ["UNIVERSAL_LLM_GATEWAY", "9ROUTER", "OPENROUTER", "GEMINI_API",
             "GROQ", "PROMPT_ENGINEERING", "AI_AGENT_DEVELOPMENT"]
    },
    "mobile": {
      quest: "ATTRIBUTE // MOBILE DEVELOPMENT",
      title: "Mobile Development",
      desc: "Mengembangkan aplikasi mobile performa tinggi dengan Flutter dan Dart. Mampu menjalankan inferensi AI on-device secara native menggunakan Dart FFI tanpa ketergantungan konstan pada koneksi server.",
      tags: ["FLUTTER", "DART", "ON_DEVICE_AI", "WHISPER_CPP",
             "DART_FFI", "120FPS_UI"]
    },
    "automation": {
      quest: "ATTRIBUTE // AI & MEDIA AUTOMATION",
      title: "AI & Media Automation",
      desc: "Membangun sistem otomasi alur kerja cerdas dan pemrosesan multimedia: transkripsi audio terakselerasi CUDA (Faster-Whisper), pelacakan wajah (MediaPipe), GPU video rendering (FFmpeg NVENC), browser RPA (Playwright), bot Telegram, serta automated testing.",
      tags: ["PLAYWRIGHT", "TELEGRAM_BOT_API", "FASTER_WHISPER", "CUDA",
             "MEDIAPIPE", "FFMPEG_NVENC", "PYTEST"]
    },
    "devops": {
      quest: "ATTRIBUTE // DEVOPS & DATABASE SERVICES",
      title: "DevOps & Database Services",
      desc: "Menerapkan pipeline CI/CD modern, orkestrasi kontainer Docker, serta pengelolaan basis data relasional maupun cloud services untuk menjamin stabilitas dan skalabilitas deployment.",
      tags: ["DOCKER", "CI_CD", "GIT_GITHUB", "MYSQL", "POSTGRESQL",
             "FIREBASE", "SUPABASE", "VERCEL"]
    }
  };

  /* =====================================================================
     2. BOOT LOG TYPEWRITER

     The four boot lines are revealed one character at a time, with a
     per-character variance so it does not sound like a metronome.
     ===================================================================== */
  function typewriter() {
    var lines = document.querySelectorAll("[data-typewriter]");
    if (!lines.length) return;

    // Respect the user's motion preference: just show everything.
    if (reducedMotion) return;

    // Snapshot each line's markup before touching it. Lines that contain
    // inline emphasis (the name is wrapped in a <span>) must keep those
    // element boundaries, so we build a flat character map that remembers
    // which child node and offset each character came from, then replay it.
    var plans = [];

    lines.forEach(function (line) {
      var chars = []; // { node, text } where node is the text node to extend

      function walk(node) {
        var kids = node.childNodes;
        for (var i = 0; i < kids.length; i++) {
          var kid = kids[i];
          if (kid.nodeType === 3) { // text node
            var raw = kid.textContent;
            for (var c = 0; c < raw.length; c++) {
              chars.push({ node: kid, text: raw.charAt(c) });
            }
          } else if (kid.nodeType === 1) {
            walk(kid);
          }
        }
      }
      walk(line);

      plans.push({ line: line, chars: chars, original: line.innerHTML });
    });

    // Blank every line but keep the element structure in place. The nodes
    // stay attached to the document, so we can grow them back character
    // by character without rebuilding anything.
    plans.forEach(function (plan) {
      plan.chars.forEach(function (ch) { ch.node.textContent = ""; });
      // Remember the original markup so a completed line can be restored
      // verbatim, which also cleans up any now-empty wrapper elements.
      plan.line.setAttribute("data-original", plan.original);
    });

    var planIndex = 0;
    var charIndex = 0;

    function step() {
      if (planIndex >= plans.length) {
        // Restore exact markup on the way out so no stray empty nodes remain.
        plans.forEach(function (plan) {
          plan.line.innerHTML = plan.line.getAttribute("data-original");
          plan.line.removeAttribute("data-original");
        });
        return;
      }

      var plan = plans[planIndex];
      var ch = plan.chars[charIndex];

      ch.node.textContent += ch.text;
      charIndex++;

      if (charIndex >= plan.chars.length) {
        planIndex++;
        charIndex = 0;
        // Pause between lines before starting the next one.
        window.setTimeout(step, 210);
        return;
      }

      // 18-42ms per character reads as a fast terminal without being instant.
      window.setTimeout(step, 18 + Math.random() * 24);
    }

    // Small delay so the hero paints first.
    window.setTimeout(step, 420);
  }

  /* =====================================================================
     3. SCROLL-SPY

     Highlights the nav entry for whichever section owns the viewport. Uses
     scroll position rather than IntersectionObserver ratios because the
     sections vary wildly in height.
     ===================================================================== */
  function scrollSpy() {
    var links = document.querySelectorAll("[data-spy]");
    if (!links.length) return;

    var sections = [];
    links.forEach(function (link) {
      var id = link.getAttribute("data-spy");
      var section = document.getElementById(id);
      if (section) sections.push({ id: id, el: section });
    });
    if (!sections.length) return;

    var current = null;

    function update() {
      // The header occupies the top of the viewport, so the "active" section
      // is the last one whose top has passed just beneath it.
      var probe = window.scrollY + window.innerHeight * 0.32;
      var activeId = sections[0].id;

      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.offsetTop <= probe) activeId = sections[i].id;
      }

      // Pin the last section when scrolled to the very bottom.
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        activeId = sections[sections.length - 1].id;
      }

      if (activeId === current) return;
      current = activeId;

      links.forEach(function (link) {
        var on = link.getAttribute("data-spy") === activeId;
        if (on) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    // Throttle to one update per frame, but never let the flag latch. If rAF
    // is not serviced the highlight would freeze on the first section, so a
    // timer clears the flag as a fallback. Measured before this fix: the
    // active section stayed pinned to "boot" at every scroll position.
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;

      var done = false;
      function run() {
        if (done) return;
        done = true;
        ticking = false;
        update();
      }

      window.requestAnimationFrame(run);
      window.setTimeout(run, 120);
    }, { passive: true });

    update();
  }

  /* =====================================================================
     4. REVEAL ON SCROLL
     ===================================================================== */
  function revealOnScroll() {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    targets.forEach(function (el) { io.observe(el); });

    // Belt and braces. Anything already on screen is revealed straight away
    // rather than waiting on the observer's first delivery, and a one-shot
    // timer clears the rest if the observer never reports. Leaving content
    // permanently invisible is far worse than firing an animation early.
    function revealVisibleNow() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      targets.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }

    revealVisibleNow();
    window.addEventListener("load", revealVisibleNow);
    window.setTimeout(function () {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, 3000);
  }

  /* =====================================================================
     5. PROJECT MODAL
     ===================================================================== */
  var modal = null;
  var lastFocused = null;

  function buildTag(text) {
    var span = document.createElement("span");
    span.className = "tag";
    span.textContent = text;
    return span;
  }

  /* Shared by projects and skills: both render through the same dialog so
     there is only ever one focus trap, one Escape handler and one scroll
     lock. Payload shape: { quest, title, desc, tags }. */
  function openModal(payload) {
    if (!payload || !modal) return;

    document.getElementById("modal-title").textContent = payload.title;
    document.getElementById("modal-category").textContent = payload.quest;
    document.getElementById("modal-desc").textContent = payload.desc;

    var tags = document.getElementById("modal-tags");
    tags.textContent = "";
    payload.tags.forEach(function (t) { tags.appendChild(buildTag(t)); });

    /* Optional live deployment. Most entries in the database describe work with
       no public URL, so the link defaults to hidden and the stack label keeps
       its original wording. */
    var live = document.getElementById("modal-live");
    if (live) {
      if (payload.liveUrl) {
        live.href = payload.liveUrl;
        live.textContent = payload.liveLabel || "[ Buka Live Demo ]";
        live.style.display = "";
      } else {
        live.removeAttribute("href");
        live.style.display = "none";
      }
    }

    var stackLabel = document.getElementById("modal-stack-label");
    if (stackLabel) {
      stackLabel.textContent = payload.liveUrl
        ? "> TECH STACK DEPLOYED:"
        : "> TECH STACK:";
    }

    // Remember where focus came from so it can be restored on close.
    lastFocused = document.activeElement;

    modal.hidden = false;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    if (Chiptune) Chiptune.openSting();

    // Move focus into the dialog for keyboard and screen-reader users.
    var closeBtn = document.getElementById("modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function openProjectModal(key) {
    openModal(projectDatabase[key]);
  }

  function openSkillModal(key) {
    openModal(skillDatabase[key]);
  }

  function closeProjectModal() {
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";

    if (Chiptune) Chiptune.closeSting();

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  /* Keep Tab inside the dialog while it is open. */
  function trapFocus(e) {
    if (e.key !== "Tab" || !modal || modal.hidden) return;

    var focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function initModal() {
    modal = document.getElementById("project-modal");
    if (!modal) return;

    // Click the backdrop (but not the panel) to dismiss.
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeProjectModal();
    });

    var closeBtn = document.getElementById("modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeProjectModal);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeProjectModal();
      else trapFocus(e);
    });

    // Any element carrying data-project opens the modal, and any element
    // carrying data-skill opens it with that skill's stack.
    document.addEventListener("click", function (e) {
      if (!e.target.closest) return;

      var project = e.target.closest("[data-project]");
      if (project) {
        e.preventDefault();
        openProjectModal(project.getAttribute("data-project"));
        return;
      }

      var skill = e.target.closest("[data-skill]");
      if (skill) {
        e.preventDefault();
        openSkillModal(skill.getAttribute("data-skill"));
      }
    });
  }

  /* =====================================================================
     7. SFX TOGGLE
     ===================================================================== */
  function initSfxToggle() {
    var btn = document.getElementById("sfx-toggle");
    if (!btn) return;

    var label = document.getElementById("sfx-label");
    var iconOn = document.getElementById("sfx-icon-on");
    var iconOff = document.getElementById("sfx-icon-off");

    function paint(on) {
      if (label) label.textContent = on ? "SFX: ON" : "SFX: OFF";
      if (iconOn) iconOn.hidden = !on;
      if (iconOff) iconOff.hidden = on;
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      btn.setAttribute(
        "aria-label",
        on ? "Matikan efek suara" : "Nyalakan efek suara"
      );
    }

    paint(Chiptune ? Chiptune.enabled : true);

    btn.addEventListener("click", function () {
      if (!Chiptune) return;
      paint(Chiptune.toggle());
    });
  }

  /* =====================================================================
     8. TELEMETRY PING CONSOLE
     ===================================================================== */
  /* International format, no plus sign or spaces. Change it here only. */
  var WHATSAPP_NUMBER = "6281220684832";

  function sendQuickPing() {
    var input = document.getElementById("console-msg");
    var status = document.getElementById("ping-status");
    if (!input || !status) return;

    var value = input.value.trim();

    if (!value) {
      // Reject empty input with the error buzz and a visible message.
      if (Chiptune) Chiptune.error();
      status.hidden = false;
      status.textContent = "[SYSTEM]: INPUT KOSONG \u2014 TULIS PESAN DULU.";
      status.style.color = "var(--magenta)";

      window.clearTimeout(status._timer);
      status._timer = window.setTimeout(function () {
        status.hidden = true;
        status.style.color = "";
      }, 4000);
      return;
    }

    if (Chiptune) Chiptune.coin();

    // Hand the text to WhatsApp. encodeURIComponent is required: the message
    // is user input and would otherwise break the query string on &, #, +, etc.
    var text = "Halo Bagja! Saya kirim telemetry ping dari portfolio kamu:\n\n\"" + value + "\"";
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);

    window.open(url, "_blank", "noopener");

    status.hidden = false;
    status.style.color = "";
    status.textContent =
      "[SYSTEM]: MEMBUKA WHATSAPP \u2014 PESAN BELUM TERKIRIM SAMPAI KAMU TEKAN SEND.";

    input.value = "";

    window.clearTimeout(status._timer);
    status._timer = window.setTimeout(function () {
      status.hidden = true;
    }, 5000);
  }

  function initConsole() {
    var form = document.getElementById("ping-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendQuickPing();
    });
  }

  /* =====================================================================
     9. BACK TO TOP
     ===================================================================== */
  function initToTop() {
    var btn = document.getElementById("to-top");
    if (!btn) return;

    // The gated work is one boolean comparison with no layout read, so this
    // runs directly on scroll rather than through requestAnimationFrame.
    // Batching it through rAF made the button's visibility depend on the
    // animation frame loop being serviced, which it is not in every
    // environment -- and bought nothing measurable here.
    function update() {
      btn.hidden = window.scrollY < 600;
    }

    window.addEventListener("scroll", update, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });

    update();
  }

  /* =====================================================================
     10. FOOTER YEAR + UNLOCK AUDIO ON FIRST GESTURE
     ===================================================================== */
  function initMisc() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    // Browsers require a gesture before audio can play. Attach a one-shot
    // listener so the context is ready by the time the user clicks anything.
    var unlock = function () {
      if (Chiptune) Chiptune.init();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }

  /* =====================================================================
     11. GLOBAL BUTTON SFX
     ===================================================================== */
  function globalSfx() {
    if (!Chiptune) return;

    // Hover feedback is meaningless without a real pointer, and on touch it
    // would fire on tap and double up with the click sound.
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    var SELECTOR = "button, .btn, a[href], [role='button']";

    function target(el) {
      if (!el || !el.closest) return null;
      var hit = el.closest(SELECTOR);
      if (!hit || hit.disabled) return null;
      // The SFX toggle has its own on/off sound; a coin on top would be noise.
      if (hit.id === "sfx-toggle") return null;
      return hit;
    }

    if (canHover) {
      // Throttle so sweeping the pointer across a row of buttons does not
      // machine-gun the synth.
      var last = 0;
      document.addEventListener("mouseover", function (e) {
        var hit = target(e.target);
        if (!hit) return;
        // Ignore moves within the same element.
        var from = e.relatedTarget;
        if (from && from.closest && from.closest(SELECTOR) === hit) return;

        var now = Date.now();
        if (now - last < 60) return;
        last = now;
        Chiptune.tone(880, 0.03, "square");
      }, { passive: true });
    }

    document.addEventListener("click", function (e) {
      if (target(e.target)) Chiptune.coin();
    }, { passive: true });
  }

  /* =====================================================================
     BOOT
     ===================================================================== */
  function boot() {
    initModal();
    initSfxToggle();
    initConsole();
    initToTop();
    initMisc();
    globalSfx();

    typewriter();
    scrollSpy();
    revealOnScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window, document);
