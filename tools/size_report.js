#!/usr/bin/env node
/* ==========================================================================
   size_report.js -- gzipped size of every shipped asset
   Not shipped to the browser. Run from the project root:

     node tools/size_report.js

   The README quotes these numbers, so they need to be reproducible rather
   than hand-measured. Gzip level 9 is used because that is what a CDN will
   serve after precompression; the default (level 6) reads a little larger.

   Images and woff2 are reported as-is. They are already compressed, so
   gzipping them would only add framing overhead and overstate the transfer
   size. `og-preview.png` is listed separately because it is fetched by social
   scrapers, not by a visiting browser, so it is not part of first load.
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.resolve(__dirname, "..");
const KB = 1024;
const kb = (n) => Math.round((n / KB) * 10) / 10;

const GROUPS = {
  "JS": { firstLoad: true, files: [
    "js/canvas.js",
    "js/interactions.js",
    "js/theme.js",
    "js/audio.js",
    "js/main.js",
  ]},
  "HTML + CSS": { firstLoad: true, files: [
    "index.html",
    "css/reset.css",
    "css/design-system.css",
    "css/sections.css",
    "css/fonts.css",
    "assets/favicon.svg",
  ]},
  "Fonts (woff2, already compressed)": { firstLoad: true, files: [
    "fonts/press-start-2p-400.woff2",
    "fonts/silkscreen-400.woff2",
    "fonts/silkscreen-700.woff2",
    "fonts/ibm-plex-mono-400.woff2",
    "fonts/ibm-plex-mono-500.woff2",
    "fonts/ibm-plex-mono-600.woff2",
    "fonts/ibm-plex-mono-700.woff2",
  ]},
  "Images (already compressed)": { firstLoad: true, files: [
    "assets/avatar.png",
    "assets/project-cvkita.png",
    "assets/project-damkar.png",
    "assets/project-discord-ai.png",
    "assets/project-microservices.png",
    "assets/project-ml-classifier.png",
  ]},
  "Social card (scrapers only, not first load)": { firstLoad: false, files: [
    "assets/og-preview.png",
  ]},
};

// Text formats compress; binary ones do not.
const ALREADY_COMPRESSED = /\.(png|jpe?g|webp|avif|gif|woff2?|ico)$/i;

let firstLoadTotal = 0;
let scraperTotal = 0;
const missing = [];

for (const [group, { firstLoad, files }] of Object.entries(GROUPS)) {
  console.log(`\n${group}`);
  console.log("-".repeat(60));

  let groupTotal = 0;

  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      missing.push(rel);
      console.log(`  ${rel.padEnd(40)} MISSING`);
      continue;
    }

    const raw = fs.readFileSync(abs).length;
    const compressible = !ALREADY_COMPRESSED.test(rel);
    const shipped = compressible
      ? zlib.gzipSync(fs.readFileSync(abs), { level: 9 }).length
      : raw;

    groupTotal += shipped;
    console.log(
      `  ${rel.padEnd(40)} ${String(raw).padStart(8)} B -> ` +
      `${String(shipped).padStart(8)} B ${compressible ? "gz " : "raw"}  (${kb(shipped)} KB)`
    );
  }

  console.log("-".repeat(60));
  console.log(`  ${"TOTAL".padEnd(40)} ${" ".repeat(24)}${kb(groupTotal)} KB`);

  if (firstLoad) firstLoadTotal += groupTotal;
  else scraperTotal += groupTotal;
}

console.log("\n=== Summary ===");
console.log(`  First load, total          ${kb(firstLoadTotal)} KB`);
console.log(`  Social card (on demand)    ${kb(scraperTotal)} KB`);

if (missing.length) {
  console.log(`\n  ${missing.length} file(s) referenced here but not found on disk:`);
  for (const m of missing) console.log(`    ${m}`);
  console.log("  Update the GROUPS list above if a file was renamed or removed.");
  process.exitCode = 1;
}

