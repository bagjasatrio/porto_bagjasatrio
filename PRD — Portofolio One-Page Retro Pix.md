PRD — Portofolio One-Page Retro Pixel
Muhammad Bagja Satrio · Full-Stack Web Developer & AI Enthusiast
Versi 1.0 · Draft Final

1. Overview
1.1 Tujuan
Membangun website portofolio pribadi satu halaman dengan estetika retro pixel / arcade yang interaktif, ringan, dan mudah diakses rekruter. Website ini berfungsi sebagai bukti keahlian teknis sekaligus personal branding yang membedakan dari portofolio generik.

1.2 Target Audiens
Rekruter tech & hiring manager (prioritas utama)

Sesama developer / komunitas

Klien freelance potensial

1.3 Prinsip Desain
Anti-AI Slop: Tidak ada gradasi pastel, ilustrasi 3D blob, atau font Inter/Poppins/Roboto/Montserrat

Retro Pixel: Palet NES, border tajam, efek CRT, animasi stepped

Performance First: Target Lighthouse ≥ 95 desktop, ≥ 90 mobile

Zero Dependencies: Tidak ada framework CSS/JS eksternal

Instant Access: Rekruter bisa melihat semua konten penting dalam < 10 detik tanpa klik

2. Design System
2.1 Palet Warna
Nama	Hex	Penggunaan
Background Dark	#0a0a12	Background utama
Background Alt	#1a1a2e	Card, modal, section alt
Neon Cyan	#00ffcc	Aksen utama, link, tombol
Neon Green	#39ff14	Highlight, hover state
Magenta	#ff00aa	Aksen sekunder, alert
Kuning	#ffdd00	Badge, trophy
Teks Utama	#e0e0e0	Body text
Teks Muted	#888888	Secondary text
Outline	#0d0d17	Border, garis
2.2 Tipografi
Peran	Font	Ukuran	Weight
Header/Judul	Press Start 2P	14–24px	400
Sub-header	Silkscreen	12–16px	400/700
Body/Terminal	VT323	16–20px	400
Kode/Label kecil	DotGothic16	12–14px	400
Aturan:

Semua font di-self-host via @font-face (hindari Google Fonts request)

Jangan pakai font pixel untuk paragraf panjang (> 3 baris)

Minimal body text: 16px (VT323 terbaca jelas di ukuran ini)

2.3 Elemen UI
Border: 2–4px solid, tanpa border-radius (kotak tajam)

Shadow: Hard shadow tanpa blur (box-shadow: 4px 4px 0 #000)

Hover: Inversi warna atau glitch effect

Kursor: Custom pixel cursor (cursor: url('cursor.png'), auto)

Efek CRT: Overlay scanlines via repeating-linear-gradient (hanya desktop)

Animasi: Semua transisi pakai steps(N) untuk efek choppy

2.4 Efek CRT (Desktop Only)
css
.crt-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.15) 0px,
    rgba(0,0,0,0.15) 1px,
    transparent 1px,
    transparent 3px
  );
  z-index: 9999;
}
@media (max-width: 768px) {
  .crt-overlay { display: none; }
}
3. Arsitektur Informasi (One-Page)
Urutan section dari atas ke bawah:

text
┌─────────────────────────────────────┐
│  1. HERO / BOOT SEQUENCE            │
│     - Terminal typing effect         │
│     - Karakter pixel (canvas)        │
│     - Tombol [ PRESS START ]         │
│     - Link GitHub + LinkedIn         │
├─────────────────────────────────────┤
│  2. PLAYER STATS (About + Skills)   │
│     - Bio singkat                    │
│     - Skill bars bergaya RPG         │
├─────────────────────────────────────┤
│  3. QUEST LOG (Experience)          │
│     - Dinas Kominfo Semarang         │
├─────────────────────────────────────┤
│  4. PROJECTS                        │
│     - 3 Website + 1 AI Agent         │
│     - Screenshot + deskripsi         │
│     - Modal detail                   │
├─────────────────────────────────────┤
│  5. TROPHY ROOM (Certifications)    │
│     - IBM certificates as badges     │
│     - Link ke PDF asli               │
├─────────────────────────────────────┤
│  6. SAVE POINT (Contact)            │
│     - Email, LinkedIn, GitHub        │
│     - Terminal prompt style          │
└─────────────────────────────────────┘
Floating Menu: Fixed di kanan (desktop) / bottom (mobile), berisi ikon navigasi ke tiap section + tombol MUTE.

4. Detail Section
4.1 HERO — Boot Sequence
Visual:

Background hitam dengan grid pixel halus

Teks terminal yang mengetik sendiri (typewriter):

text
> INITIALIZING SYSTEM...
> LOADING PROFILE: MUHAMMAD BAGJA SATRIO
> CLASS: FULL-STACK WEB DEVELOPER
> STATUS: READY_
Karakter pixel di canvas (32×32, idle animation, tap-reactive)

Tombol arcade [ PRESS START ] — memicu unlock audio + scroll ke Stats

Interaksi:

Desktop: karakter bisa digerakkan dengan WASD/arrow keys (opsional), klik untuk reaksi

Mobile: tap karakter → lompat/emote (Opsi B)

SFX: blip saat hover tombol, coin sound saat klik PRESS START

Data:

Nama: Muhammad Bagja Satrio

Title: Full-Stack Web Developer & AI Enthusiast

Links: GitHub, LinkedIn

4.2 PLAYER STATS — About & Skills
Bio (Bio text):

Fresh graduate Teknik Informatika Universitas Dian Nuswantoro. Fokus pada pengembangan web, Artificial Intelligence, dan DevOps. Antusias mempelajari teknologi baru dan membangun solusi yang scalable.

Skill Bars (format RPG):

Skill	Level
Frontend Web Development	80%
Backend & API Integration	70%
AI & Data Science	75%
DevOps & CI/CD	60%
Database & Backend	70%
Interaksi: Hover pada skill → tooltip muncul dengan daftar teknologi spesifik (misal: "Frontend: HTML, CSS, JavaScript, React").

4.3 QUEST LOG — Experience
Konten:

text
[ MAIN QUEST ]
Frontend Website Developer
Dinas Komunikasi, Informatika, Statistik dan Persandian Kota Semarang
2025-07 — 2025-08

> Mengembangkan antarmuka website Dinas Pemadam Kebakaran Kota Semarang
> Mengintegrasikan REST API
> Memastikan responsivitas UI
Pendidikan (Side Quest):

S1 Teknik Informatika — Universitas Dian Nuswantoro (2022–2026) · GPA 3.29

SMA MIPA — SMAN 2 Brebes (2019–2022) · GPA 81.43

4.4 PROJECTS — Main Quest
Struktur tiap project card:

Judul

Kategori (Web Dev / AI / DevOps)

Status badge ([ LIVE ] / [ LOCAL BUILD ] / [ COMING SOON ])

Thumbnail screenshot

Deskripsi singkat (2–3 baris)

Tombol [ VIEW SOURCE ] → GitHub

Tombol [ DETAILS ] → modal pop-up

Daftar Project:

#	Judul	Kategori	Status
1	Website Dinas Pemadam Kebakaran Kota Semarang	Web Dev	LIVE
2	Project Web #2	Web Dev	LOCAL BUILD
3	Project Web #3	Web Dev	LOCAL BUILD
4	Personal AI Agent (Discord)	AI/Automation	LOCAL BUILD
Modal content per project:

Screenshot besar

Deskripsi lengkap

Tech stack (tag)

Tantangan & solusi

Link GitHub

4.5 TROPHY ROOM — Certifications
Format: Grid badge pixel art, masing-masing menampilkan:

Nama sertifikat

Issuer (IBM)

Tanggal

Tombol [ VIEW PDF ] → file PDF asli

Kategori:

AI & Machine Learning:

Developing AI Applications with Python and Flask (Mei 2026)

Python for Data Science, AI & Development (Apr 2026)

Supervised Machine Learning: Classification (Nov 2025)

Unsupervised Machine Learning (Nov 2025)

Exploratory Data Analysis for Machine Learning (Nov 2025)

Pembelajaran Mesin Terawasi: Regresi (Nov 2025)

DevOps & Software Engineering:

DevOps Capstone Project (Mei 2026)

Continuous Integration and Continuous Delivery (CI/CD) (Mei 2026)

Introduction to DevOps (Mar 2026)

Introduction to Software Engineering (Apr 2026)

Agile & Development:

Introduction to Agile Development and Scrum (Apr 2026)

Introduction to Test and Behavior Driven Development (Apr 2026)

Interaksi: Hover pada badge → sparkle effect + tooltip.

4.6 SAVE POINT — Contact
Visual: Terminal prompt style

text
> CONNECT TO PLAYER:
> EMAIL: [klik untuk kirim pesan]
> LINKEDIN: /in/muhammadbagjasatrio
> GITHUB: /bagjasatrio

> _ (cursor berkedip)
Interaksi:

Klik EMAIL → membuka mailto:

Klik LINKEDIN/GITHUB → membuka tab baru

Kolom input palsu yang berkedip sebagai dekorasi

5. Functional Requirements
5.1 Navigasi
Hybrid: Scroll bebas + floating menu untuk lompat antar section

Scroll spy: Menu aktif mengikuti section yang sedang dilihat (Intersection Observer)

Smooth scroll: scroll-behavior: smooth + scroll-margin-top

Back to top: Tombol muncul setelah scroll > 50% halaman

5.2 SFX (Web Audio API)
Hover tombol → blip (800Hz, 50ms, square wave)

Klik tombol → coin (dua nada naik, 100ms)

Scroll ke section baru → whoosh konfirmasi

Modal terbuka → power-up

Tombol MUTE di floating menu, state disimpan di localStorage

Audio hanya aktif setelah user klik [ PRESS START ] (kebijakan browser)

5.3 Animasi
Reveal on scroll: Intersection Observer + CSS steps(8)

Typewriter: Vanilla JS setInterval

Modal: CSS @keyframes + JS toggle class

Skill bar: Width transition dengan steps() saat masuk viewport

Hover glitch: CSS :hover + animation

Karakter pixel: Canvas requestAnimationFrame, target 60fps desktop / 24fps mobile

5.4 Karakter Pixel (Canvas)
Ukuran frame: 32×32 (atau sesuai aset final)

Animasi: idle (4 frame loop), blink, walk (opsional)

Desktop: WASD/arrow keys + spasi lompat

Mobile: tap → reaksi (lompat/emote)

Pause saat tab tidak aktif (visibilitychange)

Fallback: gambar statis saat prefers-reduced-motion

5.5 Responsivitas
Breakpoint	Behavior
≥ 1024px	Full experience, CRT effect, karakter interaktif penuh
768–1023px	CRT on, karakter tap-reactive, floating menu samping
< 768px	CRT off, karakter tap-reactive 24fps, floating menu bawah, font body 16px minimum
5.6 Aksesibilitas
prefers-reduced-motion → matikan semua animasi, tampilkan versi statis

Semua tombol punya aria-label

Kontras warna ≥ 4.5:1

Navigasi keyboard penuh (Tab, Enter, Esc untuk modal)

focus-visible outline yang jelas

6. SEO & Metadata
6.1 Root Metadata
html
<title>Muhammad Bagja Satrio — Full-Stack Web Developer & AI Enthusiast</title>
<meta name="description" content="Fresh graduate Teknik Informatika Universitas Dian Nuswantoro. Fokus pada Web Development, Artificial Intelligence, dan DevOps. Lihat portofolio dan sertifikasi IBM.">
<meta name="author" content="Muhammad Bagja Satrio">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://bagjasatrio.vercel.app">
6.2 Open Graph
html
<meta property="og:type" content="website">
<meta property="og:title" content="Muhammad Bagja Satrio — Full-Stack Web Developer & AI Enthusiast">
<meta property="og:description" content="Portofolio Web Dev, AI, dan DevOps. Sertifikasi IBM.">
<meta property="og:url" content="https://bagjasatrio.vercel.app">
<meta property="og:image" content="https://bagjasatrio.vercel.app/og-preview.png">
<meta name="twitter:card" content="summary_large_image">
6.3 JSON-LD
json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Muhammad Bagja Satrio",
  "jobTitle": "Full-Stack Web Developer",
  "url": "https://bagjasatrio.vercel.app",
  "sameAs": [
    "https://github.com/bagjasatrio",
    "https://linkedin.com/in/muhammadbagjasatrio"
  ],
  "knowsAbout": ["Web Development", "Artificial Intelligence", "DevOps", "Machine Learning"]
}
6.4 File Wajib
robots.txt — izinkan semua crawler

sitemap.xml — daftar URL

favicon.ico + apple-touch-icon.png — pixel art 32×32

og-preview.png — 1200×630, screenshot hero

7. Tech Stack
Layer	Teknologi	Alasan
Markup	HTML5	Zero overhead
Styling	CSS3 (Grid, Flexbox, Custom Properties)	Kontrol penuh
Interaktivitas	Vanilla JavaScript	Cukup untuk kebutuhan
Audio	Web Audio API	Zero dependency, ringan
Canvas	HTML5 Canvas 2D	Rendering sprite
Font	Self-hosted @font-face	Hindari request eksternal
Hosting	Vercel	Gratis, Edge Network, auto-deploy dari Git
Aturan:

Tidak ada React, Next.js, Vue, GSAP, Framer Motion, jQuery, Tailwind, Bootstrap

Semua animasi native (CSS + Intersection Observer)

Total JS < 10KB

Total halaman < 200KB (termasuk gambar)

8. Content Inventory
8.1 Teks
Bio singkat (~40 kata)

Deskripsi tiap project (3 × ~50 kata + 1 AI project ~80 kata)

Deskripsi experience (~40 kata)

12 judul sertifikat + tanggal

5 skill bars

8.2 Gambar
Screenshot tiap project (3 web + 1 AI agent) — PNG/JPG, max 100KB each

Sprite sheet karakter (nanti dari AI agent coding)

Favicon pixel art

OG preview image

8.3 PDF
12 sertifikat IBM (link dari Trophy Room)

9. Performance Budget
Metrik	Target
First Contentful Paint	< 1.0s
Largest Contentful Paint	< 1.5s
Total Blocking Time	< 100ms
Cumulative Layout Shift	< 0.05
Total Page Size	< 200KB
Total JS	< 10KB
Lighthouse Desktop	≥ 95
Lighthouse Mobile	≥ 90
10. Milestones
Fase	Deliverable	Estimasi
1	Setup project, HTML struktur, CSS design system	1 hari
2	Hero section + karakter canvas + SFX	2 hari
3	Stats, Quest Log, Projects section	2 hari
4	Trophy Room, Save Point, Modal	1 hari
5	Responsive, aksesibilitas, SEO	1 hari
6	Testing (Lighthouse, cross-browser), deploy	1 hari
Total		~8 hari kerja
11. Out of Scope (v1.0)
Multi-bahasa (i18n)

Blog / artikel

CMS

Form kontak backend (pakai mailto: dulu)

Analytics (bisa ditambah nanti)

Dark/light mode toggle (desain sudah dark by default)

12. Catatan untuk AI Coding Agent
Guardrails:

Jangan menambahkan dependensi eksternal tanpa persetujuan

Jangan mengganti font ke Inter/Poppins/Roboto

Jangan menambahkan border-radius besar atau soft shadow

Jangan pakai framework CSS/JS

Semua animasi harus pakai steps() untuk efek retro

CRT effect hanya desktop, off di mobile

Karakter sprite di-load dari PNG, bukan di-generate runtime

Total JS < 10KB — review sebelum commit

File structure yang direkomendasikan:

text
/
├── index.html
├── css/
│   ├── reset.css
│   ├── design-system.css
│   └── sections.css
├── js/
│   ├── main.js
│   ├── audio.js
│   ├── canvas.js
│   └── interactions.js
├── fonts/
│   ├── PressStart2P.woff2
│   ├── Silkscreen.woff2
│   ├── VT323.woff2
│   └── DotGothic16.woff2
├── assets/
│   ├── hero-sprite.png
│   ├── project-*.png
│   ├── og-preview.png
│   └── favicon.ico
├── certificates/
│   └── *.pdf
├── robots.txt
└── sitemap.xml
Status: PRD Final v1.0 — Siap dieksekusi
Owner: Muhammad Bagja Satrio
Next Step: Serahkan PRD ini ke AI coding agent untuk implementasi