// Static consistency checks for the shipped site. Run from project root:
//   node tools/static_checks.js
// Reports rather than asserts, so it is safe to run at any time.
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const problems = [];
const notes = [];

// ---- 1. Every JS file parses ---------------------------------------------
const jsFiles = ["canvas.js", "interactions.js", "theme.js", "audio.js", "main.js"]
  .map((f) => `js/${f}`)
  .filter(exists);

for (const rel of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", path.join(ROOT, rel)], { stdio: "pipe" });
  } catch (e) {
    problems.push(`${rel} fails node --check`);
  }
}
notes.push(`${jsFiles.length} JS files parse`);

// ---- 2. index.html is pure ASCII, no BOM ---------------------------------
const html = fs.readFileSync(path.join(ROOT, "index.html"));
const bom = html[0] === 0xef && html[1] === 0xbb && html[2] === 0xbf;
const nonAscii = html.filter((b) => b > 127).length;
if (bom) problems.push("index.html has a UTF-8 BOM");
if (nonAscii > 0) problems.push(`index.html has ${nonAscii} non-ASCII bytes`);
notes.push(`index.html first 3 bytes ${html[0]} ${html[1]} ${html[2]}, ${nonAscii} non-ASCII`);

// ---- 3. No duplicate ids --------------------------------------------------
const idRe = /id="([^"]+)"/g;
const ids = [];
let m;
const htmlStr = html.toString("utf8");
while ((m = idRe.exec(htmlStr))) ids.push(m[1]);
const counts = ids.reduce((a, id) => ((a[id] = (a[id] || 0) + 1), a), {});
const dupes = Object.keys(counts).filter((id) => counts[id] > 1);
if (dupes.length) problems.push(`duplicate ids: ${dupes.join(", ")}`);
notes.push(`${ids.length} ids, ${dupes.length} duplicated`);

// ---- 4. Every getElementById target exists -------------------------------
// Every getElementById target must now exist in the markup. The allowlist that
// used to exempt `header-hiscore` is gone: that element was never in the HTML,
// the readout was dropped, and the guarded lookup in canvas.js with it. A
// missing id is a defect again.

const getRe = /getElementById\("([^"]+)"\)/g;
const referenced = new Set();
for (const rel of jsFiles) {
  const src = read(rel);
  let g;
  while ((g = getRe.exec(src))) referenced.add(g[1]);
}
const missingIds = [...referenced].filter((id) => !ids.includes(id));
if (missingIds.length) problems.push(`getElementById targets absent from HTML: ${missingIds.join(", ")}`);
notes.push(`${referenced.size} ids referenced from JS, ${missingIds.length} missing`);

// ---- 5. Every local href/src resolves ------------------------------------
// Certificate links are percent-encoded (`%20`, `%2C`, `%28`), so decode
// before touching the filesystem or every path with a space reports missing.
const assetRe = /(?:href|src)="((?!https?:|#|mailto:|data:)[^"]+)"/g;
const assets = new Set();
let a;
while ((a = assetRe.exec(htmlStr))) {
  const raw = a[1].split("?")[0];
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch (e) {
    problems.push(`malformed percent-encoding in link: ${raw}`);
  }
  assets.add(decoded);
}
const missingAssets = [...assets].filter((rel) => !exists(rel));
if (missingAssets.length) problems.push(`referenced files absent: ${missingAssets.join(", ")}`);
notes.push(`${assets.size} local assets referenced, ${missingAssets.length} missing`);

// ---- 6. data-project keys have database entries --------------------------
const projectKeys = [...htmlStr.matchAll(/data-project="([^"]+)"/g)].map((x) => x[1]);
const interactions = read("js/interactions.js");
const missingProjects = projectKeys.filter(
  (k) => !new RegExp(`["']?${k}["']?\\s*:`).test(interactions)
);
if (missingProjects.length) problems.push(`data-project keys with no database entry: ${missingProjects.join(", ")}`);
notes.push(`${projectKeys.length} data-project keys, ${missingProjects.length} unbacked`);

// ---- 7. Theme storage key agrees across both files ----------------------
const themeKeyInJs = /STORAGE_KEY\s*=\s*"([^"]+)"/.exec(read("js/theme.js"));
const themeKeyInHtml = /bagja\.theme/.test(htmlStr);
if (!themeKeyInJs) problems.push("js/theme.js has no STORAGE_KEY");
else if (!themeKeyInHtml) problems.push("the pre-paint script in index.html does not mention the storage key");
else notes.push(`theme storage key "${themeKeyInJs[1]}" present in both files`);

// ---- 8. Theme-naming text agrees with the resolved theme ----------------
// The footer readout and the header label both spell the theme out in text, so
// both can drift from data-theme. This is the bug that shipped in the footer:
// it read LIGHT_MODE in dark mode because the string was hardcoded in markup
// and nothing updated it.
const mirrorIds = ["footer-theme-mode", "theme-label"];
const mirrorProblems = [];
for (const id of mirrorIds) {
  const el = new RegExp(`id="${id}"[^>]*>([^<]*)<`).exec(htmlStr);
  if (!el) { mirrorProblems.push(`${id} not found in index.html`); continue; }
  const text = el[1];
  if (/LIGHT/i.test(text) && /DARK/i.test(text)) {
    mirrorProblems.push(`${id} names both themes, so it cannot track either`);
  }
  const isDarkDefault = /DARK/i.test(text);
  if (isDarkDefault) {
    // A dark default would flash the wrong word for light-mode visitors.
    mirrorProblems.push(`${id} defaults to DARK, which flashes for light visitors`);
  }
}
if (mirrorProblems.length) problems.push(`theme readouts: ${mirrorProblems.join("; ")}`);
notes.push(`${mirrorIds.length} theme readouts, both keyed to data-theme`);

// ---- 9. Light-mode contrast caveat is real -------------------------------
// Recorded so the README's claim can be re-derived rather than trusted.
function lum(hex) {
  const c = hex.replace("#", "").match(/../g).map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(x, y) {
  const lx = lum(x), ly = lum(y);
  const hi = Math.max(lx, ly), lo = Math.min(lx, ly);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}
const ds = read("css/design-system.css");
function token(name, scope) {
  const re = scope
    ? new RegExp(`${scope}[^}]*?--${name}:\\s*(#[0-9a-fA-F]{6})`, "s")
    : new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`);
  const hit = re.exec(ds);
  return hit ? hit[1] : null;
}
const lightBg = token("bg");
const lightTeal = token("teal");
const lightGold = token("gold");
if (lightBg && lightTeal && lightGold) {
  notes.push(`light teal/bg ${ratio(lightTeal, lightBg)} (README says 3.90)`);
  notes.push(`light gold/bg ${ratio(lightGold, lightBg)} (README says 3.82)`);
}

// ---- Report --------------------------------------------------------------
console.log("Notes");
for (const n of notes) console.log(`  - ${n}`);

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  ! ${p}`);
  process.exitCode = 1;
} else {
  console.log("\nNo problems found.");
}
