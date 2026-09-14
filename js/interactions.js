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
    "cvkita": {
      quest: "PROJECTS 2 // FULL-STACK PRODUCT & DOCUMENT ENGINEERING",
      title: "CVKita — Career Profile & ATS Resume Engine",
      desc: "Platform yang menyatukan profil karir dalam satu sumber data, lalu menurunkannya menjadi PDF deterministik, pencocokan lowongan real-time, dan cover letter. Tantangan utamanya bukan menampilkan data, melainkan menjamin keluaran dokumen selalu identik untuk masukan yang sama — sehingga hasilnya konsisten dibaca mesin ATS dan tidak pernah mengarang isi CV pengguna.",
      tags: ["NEXT_JS", "TAILWIND", "ATS_ENGINE", "PDF_GEN", "VERCEL"],
      liveUrl: "https://cv-kita.vercel.app/"
    },
    "damkar": {
      quest: "PROJECTS 1 // WEB ARCHITECTURE & CITIZEN PORTAL",
      title: "Portal Dinas Pemadam Kebakaran Kota Semarang",
      desc: "Portal resmi Dinas Pemadam Kebakaran Kota Semarang sebagai kanal informasi dan pelaporan darurat bagi warga. Antarmuka dibangun ulang dengan React dan transisi Framer Motion, sedangkan data titik rawan serta rute evakuasi ditarik lewat REST API agar peta interaktif selalu mengikuti data terbaru.",
      tags: ["REACT", "REST_API", "TAILWIND", "GEOJSON", "CI_CD"]
    },
    "discord-ai": {
      quest: "PROJECTS 3 // NLP & CONVERSATIONAL AI",
      title: "AI Discord Agent",
      desc: "Mengimplementasikan parsing konteks teks secara dinamis (NLP) pada bot Discord, sehingga percakapan multi-giliran tetap nyambung dan relevan. Bot merangkum, menjawab pertanyaan spesifik, dan mempertahankan riwayat konteks antar pesan dalam sebuah channel.",
      tags: ["PYTHON", "NLP", "DISCORD_PY", "CONTEXT_PARSING", "ASYNC"]
    },
    "microservices": {
      quest: "PROJECTS 4 // DISTRIBUTED SYSTEMS & BACKEND",
      title: "Enterprise Cloud Microservice Hub",
      desc: "Implementasi arsitektur microservice terdistribusi dengan API Gateway sebagai titik masuk tunggal, komunikasi antar layanan via message queue, serta pipeline CI/CD untuk otomatisasi build, test, dan deploy. Setiap layanan memiliki database dan siklus rilis yang independen.",
      tags: ["DOCKER", "API_GATEWAY", "MESSAGE_QUEUE", "CI_CD", "MICROSERVICES"]
    },
    "ml-classifier": {
      quest: "PROJECTS 5 // MACHINE LEARNING & TELEMETRY",
      title: "ML Predictive Classifier Dashboard",
      desc: "Pipeline machine learning end-to-end untuk klasifikasi prediktif, mulai dari exploratory data analysis, feature engineering, pelatihan dan evaluasi model, hingga penyajian hasil prediksi pada dashboard interaktif yang dapat dibaca tim non-teknis.",
      tags: ["PYTHON", "SCIKIT_LEARN", "PANDAS", "FLASK", "DATA_VIS"]
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
      desc: "Merancang dan membangun antarmuka web yang cepat, modular, dan mudah dipakai. Fokus pada struktur komponen yang rapi, responsif di semua ukuran layar, serta animasi yang halus tanpa mengorbankan performa.",
      tags: ["REACT.JS", "TYPESCRIPT", "JAVASCRIPT", "TAILWIND_CSS", "BOOTSTRAP",
             "FRAMER_MOTION", "GSAP", "HTML", "CSS"]
    },
    "backend": {
      quest: "ATTRIBUTE // BACKEND & API INTEGRATION",
      title: "Backend & API Integration",
      desc: "Membangun layanan backend dan menghubungkan sistem lewat API. Berpengalaman mengintegrasikan layanan pihak ketiga, menangani autentikasi, serta menyambungkan payment gateway dan bot ke dalam alur aplikasi.",
      tags: ["NODE.JS", "REST_API", "API_INTEGRATION", "LARAVEL", "PHP",
             "PAYMENT_GATEWAYS", "LUA", "DISCORD_BOT_DEV"]
    },
    "ai": {
      quest: "ATTRIBUTE // AI & AGENT ENGINEERING",
      title: "AI & Agent Engineering",
      desc: "Membangun agen AI dan memanfaatkan model bahasa untuk menyelesaikan tugas nyata, mulai dari parsing konteks percakapan sampai otomatisasi alur kerja.",
      tags: ["AI", "AI_AGENT_DEVELOPMENT", "PYTHON"]
    },
    "database": {
      quest: "ATTRIBUTE // DATABASE & BACKEND SERVICES",
      title: "Database & Backend Services",
      desc: "Merancang skema data dan memilih layanan backend yang tepat sesuai kebutuhan aplikasi, dari basis data relasional sampai layanan terkelola untuk autentikasi dan penyimpanan realtime.",
      tags: ["MYSQL", "FIREBASE", "SUPABASE"]
    },
    "devops": {
      quest: "ATTRIBUTE // DEVOPS & TOOLING",
      title: "DevOps & Tooling",
      desc: "Menjaga alur kerja pengembangan tetap rapi dan dapat direproduksi, dari kontrol versi dan kontainerisasi sampai desain antarmuka dan alat bantu harian.",
      tags: ["DOCKER", "GITHUB", "VS_CODE", "GOOGLE_ANTIGRAVITY", "FIGMA", "CANVA"]
    },
    "productivity": {
      quest: "ATTRIBUTE // PRODUCTIVITY & DOCUMENTATION",
      title: "Productivity & Documentation",
      desc: "Menyusun dokumentasi teknis dan materi presentasi yang jelas, sehingga hasil kerja dapat dipahami dan ditindaklanjuti oleh tim maupun pemangku kepentingan non-teknis.",
      tags: ["WORD", "POWERPOINT", "EXCEL"]
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
