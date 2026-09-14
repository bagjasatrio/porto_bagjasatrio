/* ==========================================================================
   canvas.js — hero arcade arena
   Portofolio Muhammad Bagja Satrio
   ==========================================================================
   A small collection game drawn on a single <canvas> that fills the hero.
   The player moves a pixel sorcerer around an arena and collects coins;
   score and credit counters in the header and hero HUD update live.

   Ported from the design mockup, with these additions:
     - devicePixelRatio-aware sizing so it is not blurry on HiDPI screens
     - keyboard, pointer-drag and D-pad input all routed through one state
     - pauses on tab hide so it does not burn battery in a background tab
     - static, non-animated render under prefers-reduced-motion
   ========================================================================== */

(function (window, document) {
  "use strict";

  var canvas = document.getElementById("arena-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Foreground layer. Everything else still draws to `ctx`; only the
  // character uses this one, so it can stack above the profile card.
  // If the layer is missing or unsupported, drawing falls back to `ctx`.
  var fgCanvas = document.getElementById("arena-canvas-fg");
  var fg = fgCanvas ? fgCanvas.getContext("2d") : null;
  if (!fg) fgCanvas = null;

  /* ---------------------------------------------------------------------
     Tunables
     --------------------------------------------------------------------- */
  var COIN_VALUE = 100;
  var COIN_COUNT = 6;
  var PLAYER_SPEED = 3.1;
  var TILE = 32;
  var COIN_RADIUS = 9;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Palette

     The arena's floor, grid, markers and sprite outline come from CSS custom
     properties so the dark theme can reach them; the character's own colours
     (cloth, skin, trim, coin) stay literal, because a character does not
     change colour when the lights go down.

     Values are read with getComputedStyle and refreshed by refreshTheme()
     whenever the theme attribute flips. The literals in the fallbacks are
     the light-palette values, so a stripped stylesheet degrades to the
     original look instead of drawing an invisible arena.
     --------------------------------------------------------------------- */
  function cssVar(name, fallback) {
    var v = window.getComputedStyle(document.documentElement).getPropertyValue(name);
    v = v ? v.trim() : "";
    return v || fallback;
  }

  var palette = {};

  function readPalette() {
    palette = {
      floor: cssVar("--arena-floor", "#f0f2ea"),
      grid: cssVar("--arena-grid", "#dcdfd5"),
      marker: cssVar("--arena-marker", "#008a7a"),
      spriteInk: cssVar("--sprite-ink", "#1a1a24"),
      cloth: cssVar("--sprite-cloth", "#008a7a"),
      gold: cssVar("--gold", "#b36b00"),
      scanline: cssVar("--scanline", "rgba(0,0,0,0.025)")
    };
  }

  readPalette();

  // Called by js/theme.js after it swaps the theme attribute. Re-reads the
  // tokens and repaints immediately; without the explicit render() the change
  // would not show until the next animation frame, and a reduced-motion
  // visitor has no frame loop running at all.
  function refreshTheme() {
    readPalette();
    render();
  }

  /* ---------------------------------------------------------------------
     State
     --------------------------------------------------------------------- */
  var W = 0;                 // logical (CSS px) width
  var H = 0;                 // logical height
  var dpr = 1;

  var frame = 0;
  var running = true;
  var score = 0;
  var coinsCollected = 0;

  var coins = [];
  var floaters = [];

  // Profile card bounds in canvas-local coordinates, refreshed on resize.
  // The sentinel of -1 means "not measured yet".
  var card = { left: -1, right: -1, top: -1, bottom: -1 };

  // Card bottom as of the last time coin placement was reconciled.
  //
  // The card's height is not fixed at boot: the hero boot log is typed out
  // character by character, which grows the card and moves its bottom edge
  // downwards. Coins seeded before that finishes would be sitting behind the
  // card by the time the typing stops, so update() compares this sentinel
  // against the live measurement and rescues anything that got covered.
  var placedCardBottom = -1;

  // Once the player has been moved by the user, the opening position is no
  // longer reapplied on resize.
  var hasMoved = false;

  var player = {
    x: 0,
    y: 0,
    w: 40,
    h: 48,
    facing: 1,
    moving: false,
    bob: 0
  };

  // Directional input, set by keyboard / pointer / D-pad.
  var input = { up: false, down: false, left: false, right: false };

  /* ---------------------------------------------------------------------
     Mobile mode

     Below 768px the arena is not played: the card is wide enough that there
     is no gutter to walk in and no room to place reachable coins. Rather
     than leave a broken game on a phone, the character and the coins become
     decoration -- the sorcerer stands still beside the profile photo and the
     coins frame the card.

     768px matches the breakpoint the stylesheet already uses for this
     section, so the JS and CSS modes switch at the same width.
     --------------------------------------------------------------------- */
  var MOBILE_MAX = 768;

  function isMobile() {
    return W < MOBILE_MAX;
  }

  // Profile photo bounds, canvas-local. Sentinels of -1 mean "not measured".
  // The sprite is parked against this on a phone, so it needs the same
  // measurement treatment the card gets.
  var avatarRect = { left: -1, right: -1, top: -1, bottom: -1 };

  /* ---------------------------------------------------------------------
     DOM readouts
     --------------------------------------------------------------------- */
  var elScore  = document.getElementById("game-score-val");
  var elCoins  = document.getElementById("game-coin-counter");
  var elCredit = document.getElementById("header-credit");

  function pad(n, len) {
    var s = String(n);
    while (s.length < len) s = "0" + s;
    return s;
  }

  /* Push the current numbers into the DOM.

     Writes are guarded so we never touch the DOM when nothing changed, which
     keeps this off the critical path of the animation loop. */
  var lastWritten = {};
  function syncReadouts() {
    if (elScore && lastWritten.score !== score) {
      elScore.textContent = pad(score, 4);
      lastWritten.score = score;
    }
    if (elCoins && lastWritten.coins !== coinsCollected) {
      elCoins.textContent = "COINS: " + pad(coinsCollected, 2);
      lastWritten.coins = coinsCollected;
    }
    // Credit is a classic arcade conceit: every 3 coins buys a "continue".
    if (elCredit) {
      var credit = pad(1 + Math.floor(coinsCollected / 3), 2);
      if (lastWritten.credit !== credit) {
        elCredit.textContent = credit;
        lastWritten.credit = credit;
      }
    }
  }

  /* ---------------------------------------------------------------------
     Sizing. The canvas backing store is scaled by devicePixelRatio so the
     pixel art stays crisp on HiDPI displays, but all game logic works in
     CSS pixels.
     --------------------------------------------------------------------- */
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var cssW = Math.max(320, Math.round(rect.width));
    var cssH = Math.max(240, Math.round(rect.height));

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    W = cssW;
    H = cssH;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (fgCanvas && fg !== ctx) {
      fgCanvas.width = Math.round(cssW * dpr);
      fgCanvas.height = Math.round(cssH * dpr);
      fg.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    measureCard();

    // Re-place the character beside the card when the layout reflows, but only
    // while it is still standing where it spawned — otherwise a resize mid-play
    // would teleport a character the user is steering.
    if (!hasMoved) placePlayer();

    // Keep the player inside the new bounds after a resize.
    player.x = Math.min(Math.max(player.x, 0), W - player.w);
    player.y = Math.min(Math.max(player.y, 0), H - player.h);

    seedCoins();

    // Coins were just placed against the card as measured above.
    placedCardBottom = card.bottom;

    // On a phone the desktop clear-area placement above is meaningless -- the
    // card covers the arena -- so the coins are re-laid along the card border
    // instead. Runs after seedCoins so it has coins to move.
    if (isMobile()) decorateCoins();
  }

  /* ---------------------------------------------------------------------
     Profile card geometry

     The character walks in front of the card, so its bounds are used to keep
     the sprite out of the card's interior and to place its opening position
     in the gutter beside the card.

     Both boxes are measured in viewport space and the canvas origin is
     subtracted, which yields canvas-local coordinates regardless of where the
     section sits on the page.
     --------------------------------------------------------------------- */
  function measureCard() {
    card.left = -1;
    card.right = -1;
    card.top = -1;
    card.bottom = -1;

    var el = document.querySelector(".hero__card");
    if (!el) return;

    var w = el.offsetWidth;
    var h = el.offsetHeight;
    if (!w || !h) return;

    var canvasRect = canvas.getBoundingClientRect();
    var cardRect = el.getBoundingClientRect();

    card.left = cardRect.left - canvasRect.left;
    card.right = cardRect.right - canvasRect.left;
    card.top = cardRect.top - canvasRect.top;
    card.bottom = cardRect.bottom - canvasRect.top;

    measureAvatar(canvasRect);
  }

  /* The photo's box, in the same coordinate space as the card's.

     On a phone the card's avatar is centred inside the card's padding box, so
     a 192px photo inside a 358px card leaves a strip of empty card on either
     side of it. That strip -- not the 16px arena gutter -- is where the
     decorative sprite stands. */
  function measureAvatar(canvasRect) {
    avatarRect.left = -1;
    avatarRect.right = -1;
    avatarRect.top = -1;
    avatarRect.bottom = -1;

    var el = document.querySelector(".hero__avatar");
    if (!el) return;

    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    avatarRect.left = rect.left - canvasRect.left;
    avatarRect.right = rect.right - canvasRect.left;
    avatarRect.top = rect.top - canvasRect.top;
    avatarRect.bottom = rect.bottom - canvasRect.top;
  }

  /* ---------------------------------------------------------------------
     Coins

     Coins are drawn on the background canvas, but the profile card is stacked
     in front of that canvas. A coin behind the card is invisible and
     unreachable -- the arena just looks short of coins -- so placement is
     restricted to the parts of the arena the card does not cover.

     The clear area is enumerated as rectangles rather than probed with a
     "pick a point, try again if it is covered" loop. On a phone the card
     covers almost the entire arena, so such a loop would exhaust its attempts
     on every single coin and have to fall back to a position behind the card
     -- exactly what we are trying to avoid. Enumerating the regions means the
     narrow case still produces a real, visible answer: the strip of arena
     below the card.
     --------------------------------------------------------------------- */
  var COIN_PAD = 12;      // coin half-size plus its outline, so it never clips the card
  var COIN_MARGIN = 44;   // preferred keep-off from the arena border
  var COIN_EDGE = 12;     // relaxed margin, used when the preferred one leaves no room
  var COIN_TOP = 56;      // keeps coins clear of the telemetry strip along the top

  /* Rectangles of the arena a coin may occupy without being covered by the
     card, for a given border margin. Empty when the card leaves no room. */
  function clearCoinRects(margin) {
    var x0 = margin;
    var x1 = W - margin;
    var y0 = margin + COIN_TOP;
    var y1 = H - margin;

    if (x1 - x0 <= 0 || y1 - y0 <= 0) return [];

    if (card.left < 0) {
      // Card not measured yet: the whole band is fair game.
      return [{ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }];
    }

    var pl = card.left - COIN_PAD;
    var pr = card.right + COIN_PAD;
    var pt = card.top - COIN_PAD;
    var pb = card.bottom + COIN_PAD;

    var rects = [];

    function push(rx0, ry0, rx1, ry1) {
      if (rx1 - rx0 > 0 && ry1 - ry0 > 0) {
        rects.push({ x: rx0, y: ry0, w: rx1 - rx0, h: ry1 - ry0 });
      }
    }

    // Full-height gutters either side of the card.
    push(x0, y0, Math.min(pl, x1), y1);
    push(Math.max(pr, x0), y0, x1, y1);

    // Strips above and below, spanning only the card's own width.
    var sx0 = Math.max(pl, x0);
    var sx1 = Math.min(pr, x1);
    push(sx0, y0, sx1, Math.min(pt, y1));
    push(sx0, Math.max(pb, y0), sx1, y1);

    return rects;
  }

  /* Clear rectangles, relaxing the border margin if the preferred one leaves
     nothing. A phone-sized arena needs the relaxed pass to find the strip
     below the card. */
  function coinRects() {
    var rects = clearCoinRects(COIN_MARGIN);
    if (rects.length) return rects;
    return clearCoinRects(COIN_EDGE);
  }

  /* Pick a position from the clear rectangles, weighted by area so the wide
     open gutters get used far more often than the thin edge strips. */
  function randomCoinPos() {
    var rects = coinRects();

    if (!rects.length) {
      // Degenerate layout: the card covers the arena outright. Take the taller
      // of the two visible strips rather than hiding the coin behind the card.
      var below = card.bottom > 0 ? H - card.bottom : 0;
      var above = card.top > 0 ? card.top : 0;
      return {
        x: W / 2,
        y: below >= above
          ? Math.max(0, H - COIN_PAD - 4)
          : Math.min(H, COIN_PAD + 4)
      };
    }

    var total = 0;
    var i;
    for (i = 0; i < rects.length; i++) total += rects[i].w * rects[i].h;

    var t = Math.random() * total;
    var chosen = rects[0];
    for (i = 0; i < rects.length; i++) {
      t -= rects[i].w * rects[i].h;
      if (t <= 0) { chosen = rects[i]; break; }
    }

    return {
      x: chosen.x + Math.random() * chosen.w,
      y: chosen.y + Math.random() * chosen.h
    };
  }

  /* True when a coin centred at (x, y) would be clear of the profile card. */
  function coinIsClear(x, y) {
    if (card.left < 0) return true; // not measured yet: nothing to avoid

    return !(x > card.left - COIN_PAD &&
             x < card.right + COIN_PAD &&
             y > card.top - COIN_PAD &&
             y < card.bottom + COIN_PAD);
  }

  function makeCoin() {
    var pos = randomCoinPos();
    return {
      x: pos.x,
      y: pos.y,
      phase: Math.random() * Math.PI * 2,
      born: frame
    };
  }

  function seedCoins() {
    coins = [];
    for (var i = 0; i < COIN_COUNT; i++) coins.push(makeCoin());
  }

  /* Keep a steady population: one in, one out. */
  function respawnCoin() {
    coins.push(makeCoin());
  }

  /* Decorative coin frame for touch layouts.

     Nothing on a phone is reachable -- the character does not move and the
     card covers the arena -- so instead of trying to hide coins from the card
     the way the desktop path does, the coins are arranged along the card's
     own border. They read as a rim around the terminal, which is the intent:
     furniture rather than something to chase.

     The layout is an explicit table rather than modulo arithmetic. An
     interleaved index gave both side slots to the left edge (2 left, 1 right,
     2 top, 1 bottom), which reads as a lopsided frame; the table below is
     symmetrical and can be checked at a glance.

     Each entry is [edge, fraction along that edge]. The card's box is the
     border box, so sitting on card.left/card.right puts the coin on the
     border line itself rather than floating outside it. */
  var COIN_FRAME = [
    ["left",   1 / 3],
    ["left",   2 / 3],
    ["right",  1 / 3],
    ["right",  2 / 3],
    ["top",    1 / 2],
    ["bottom", 1 / 2]
  ];

  function decorateCoins() {
    if (card.left < 0) return; // not measured yet: nothing to frame

    var spanX = card.right - card.left;
    var spanY = card.bottom - card.top;

    for (var i = 0; i < coins.length; i++) {
      var slot = COIN_FRAME[i % COIN_FRAME.length];
      var edge = slot[0];
      var f = slot[1];

      if (edge === "left" || edge === "right") {
        coins[i].x = edge === "left" ? card.left : card.right;
        coins[i].y = card.top + spanY * f;
      } else {
        coins[i].x = card.left + spanX * f;
        coins[i].y = edge === "top" ? card.top : card.bottom;
      }

      // Nudge off the exact border so the row does not read as a machine.
      coins[i].x += (i % 2 ? 1 : -1) * 3;
      coins[i].y += (i % 2 ? -1 : 1) * 3;

      // Clamp back onto the card's own edges. COIN_PAD is a canvas-edge
      // margin, but card.left can be as tight as 16px on a 360px phone, so
      // using it here pushed a coin's centre off the card it frames.
      coins[i].x = Math.min(Math.max(coins[i].x, card.left), card.right);
      coins[i].y = Math.min(Math.max(coins[i].y, card.top), card.bottom);
    }
  }

  /* The decorative opening position: standing beside the photo.

     The photo is centred in the card, so the empty card interior either side
     of it is the only place the sprite can stand without covering the boot
     log. The right-hand side is preferred; the left is used when the right
     would run past the card (and then past the canvas).

     Vertically the sprite is centred on the photo, so it stays balanced beside
     it once the typing animation settles. */
  function placeDecorMobile() {
    if (avatarRect.top < 0) {
      // Not measured yet (first paint, or the photo is hidden): fall back to
      // the old centred rest so the sprite is never missing outright.
      player.x = W / 2 - player.w / 2;
      player.y = H * 0.62;
      return;
    }

    var gap = 8;
    var rightX = avatarRect.right + gap;
    var leftX = avatarRect.left - gap - player.w;

    // Stay inside the card when possible so the sprite reads as part of the
    // terminal frame rather than sticking out of it.
    if (rightX + player.w <= card.right - 4) {
      player.x = rightX;
    } else if (leftX >= card.left + 4) {
      player.x = leftX;
    } else {
      // Narrower than the sprite needs on either side. Sit it on the right
      // edge and let it overhang evenly rather than hiding it.
      player.x = avatarRect.right - player.w / 2;
    }

    player.x = Math.min(Math.max(player.x, 0), W - player.w);

    player.y = avatarRect.top + (avatarRect.bottom - avatarRect.top) / 2 - player.h / 2;
    player.y = Math.min(Math.max(player.y, 0), H - player.h);

    player.facing = -1;
    player.moving = false;
    player.bob = 0;
  }

  /* ---------------------------------------------------------------------
     Player spawn
     --------------------------------------------------------------------- */
  /* Place the character in the gutter beside the profile card so it is visible
     the moment the page opens, rather than centred behind the card.

     Both side gutters are measured and the wider one is used, since the card
     is centred and a viewport can leave more room on one side. When neither
     gutter can hold the sprite the old centred spawn is kept as a fallback. */
  function placePlayer() {
    // On a phone the sprite is furniture, not a player: park it beside the
    // photo and skip the gutter search entirely.
    if (isMobile()) {
      placeDecorMobile();
      return;
    }

    var groundY = H * 0.62;

    if (card.left < 0) {
      player.x = W / 2 - player.w / 2;
      player.y = groundY;
      return;
    }

    var gap = 28;            // clear space between the sprite and the card edge
    var margin = 24;         // keep the sprite off the arena border

    var leftSpace = card.left;
    var rightSpace = W - card.right;

    if (rightSpace >= leftSpace && rightSpace >= player.w + gap + margin) {
      player.x = card.right + gap;
    } else if (leftSpace >= player.w + gap + margin) {
      player.x = card.left - gap - player.w;
    } else {
      player.x = W / 2 - player.w / 2;
    }

    player.x = Math.min(Math.max(player.x, margin), W - player.w - margin);
    player.y = Math.min(groundY, H - player.h);
  }

  /* ---------------------------------------------------------------------
     Update
     --------------------------------------------------------------------- */

  /* Rescue coins the card has since grown over.

     The card's bottom edge moves while the boot log types itself out, so a coin
     that was clear when it was placed can end up behind the card a moment
     later. Re-measuring on a slow cadence and nudging only the affected coins
     keeps the arena honest without a full reseed, which would visibly teleport
     every coin at once. */
  function reconcileCard() {
    measureCard();

    // Nothing is collectable on a phone, so there is no "covered coin" to
    // rescue -- the coins are meant to sit on the card's border. Refresh the
    // decoration instead, which matters because the card is still growing
    // while the boot log types itself out.
    if (isMobile()) {
      placeDecorMobile();
      decorateCoins();
      placedCardBottom = card.bottom;
      return;
    }

    // Only a card that grew can have covered a coin that used to be clear.
    if (card.bottom <= placedCardBottom + 1) return;

    for (var i = 0; i < coins.length; i++) {
      if (!coinIsClear(coins[i].x, coins[i].y)) {
        var spot = randomCoinPos();
        coins[i].x = spot.x;
        coins[i].y = spot.y;
      }
    }

    placedCardBottom = card.bottom;
  }

  function update() {
    frame++;

    // The card grows while the boot log types, so re-check on a slow cadence.
    // Every 20 frames is frequent enough to catch the typing and rare enough
    // that the measurement never shows up in a profile.
    if (frame % 20 === 0) reconcileCard();

    // On a phone there is no game loop: the sprite is decoration, so skip
    // movement, coin pickup and the score floaters. The frame counter above
    // still advances so the coin spin keeps animating.
    if (isMobile()) return;

    var dx = 0;
    var dy = 0;

    if (input.left)  dx -= 1;
    if (input.right) dx += 1;
    if (input.up)    dy -= 1;
    if (input.down)  dy += 1;

    // Normalise diagonals so they are not faster than straight lines.
    if (dx !== 0 && dy !== 0) {
      var inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }

    player.moving = dx !== 0 || dy !== 0;

    if (player.moving) {
      player.x += dx * PLAYER_SPEED;
      player.y += dy * PLAYER_SPEED;
      if (dx !== 0) player.facing = dx > 0 ? 1 : -1;

      // The opening position is only reasserted while the character is still
      // untouched, so a later resize will not teleport it.
      hasMoved = true;
    }

    // Clamp to the arena.
    player.x = Math.min(Math.max(player.x, 0), W - player.w);
    player.y = Math.min(Math.max(player.y, 0), H - player.h);

    // A 2px bob while walking, a 1px idle breathe. Both are frame-stepped
    // rather than eased so the motion reads as sprite animation.
    player.bob = player.moving
      ? (Math.floor(frame / 4) % 2) * 2
      : (Math.floor(frame / 14) % 2);

    // --- Coin pickup: circle-vs-rect against the player's centre ---
    var pcx = player.x + player.w / 2;
    var pcy = player.y + player.h / 2;

    for (var i = coins.length - 1; i >= 0; i--) {
      var c = coins[i];
      var hitR = COIN_RADIUS + 22;
      var ddx = c.x - pcx;
      var ddy = c.y - pcy;

      if (ddx * ddx + ddy * ddy < hitR * hitR) {
        coins.splice(i, 1);
        coinsCollected++;
        score += COIN_VALUE;

        floaters.push({ x: c.x, y: c.y, life: 46, text: "+" + COIN_VALUE });
        if (window.Chiptune) window.Chiptune.coin();

        respawnCoin();
        syncReadouts();
      }
    }

    // --- Floating score text ---
    for (var j = floaters.length - 1; j >= 0; j--) {
      floaters[j].y -= 0.9;
      floaters[j].life--;
      if (floaters[j].life <= 0) floaters.splice(j, 1);
    }
  }

  /* ---------------------------------------------------------------------
     Render
     --------------------------------------------------------------------- */

  /* Flat arena fill + a subtle tile grid. */
  function drawArena() {
    ctx.fillStyle = palette.floor;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = 0; x <= W; x += TILE) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (var y = 0; y <= H; y += TILE) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();

    // Sparse "+" map markers, clipped so they stay faint.
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = palette.marker;
    ctx.lineWidth = 2;
    for (var mx = 192; mx < W; mx += 192) {
      for (var my = 160; my < H; my += 160) {
        ctx.beginPath();
        ctx.moveTo(mx - 5, my);
        ctx.lineTo(mx + 5, my);
        ctx.moveTo(mx, my - 5);
        ctx.lineTo(mx, my + 5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* Spinning coin: the width cycles through 4 frames to fake a Y-axis spin. */
  function drawCoin(c) {
    var cycle = [16, 12, 6, 12];
    var shine = Math.floor((frame + c.phase * 10) / 6) % 4;
    var w = cycle[shine];
    var h = 18;
    var x = c.x - w / 2;
    var y = c.y - h / 2;

    // Ink outline
    ctx.fillStyle = palette.spriteInk;
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

    // Gold body
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(x, y, w, h);

    // Inner highlight
    ctx.fillStyle = "#fde68a";
    ctx.fillRect(x + 1, y + 2, Math.max(1, w - 4), h - 8);

    // Sparkle on the two "face-on" frames
    if (shine === 0 || shine === 1) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + w / 2 - 1, y + 3, 3, 3);
    }
  }

  /* The pixel sorcerer.

     Drawn procedurally from rects rather than a sprite sheet so there is no
     image request and no blurry scaling. Origin is the player's top-left. */
  function drawPlayer() {
    var px = Math.round(player.x);
    var py = Math.round(player.y + player.bob);
    var w = player.w;

    // The sprite goes on the foreground layer so the profile card, which sits
    // between the two canvases, can never cover it.
    var g = fg || ctx;

    g.save();

    // Mirror horizontally when walking left.
    if (player.facing === -1) {
      g.translate(px + w, 0);
      g.scale(-1, 1);
      g.translate(-px, 0);
    }

    function box(x, y, bw, bh, color) {
      g.fillStyle = palette.spriteInk;
      g.fillRect(x - 1, y - 1, bw + 2, bh + 2);
      g.fillStyle = color;
      g.fillRect(x, y, bw, bh);
    }

    var cx = px + w / 2;

    // --- Staff (behind the body) ---
    box(cx + 12, py - 4, 4, 46, "#b36b00");
    box(cx + 10, py - 12, 8, 8, palette.cloth);        // crystal
    if (Math.floor(frame / 6) % 2 === 0) {
      box(cx + 11, py - 11, 6, 6, "#f59e0b");          // blinking orb
    }

    // --- Body / robe ---
    box(cx - 9, py + 20, 18, 20, "#c2185b");
    box(cx - 4, py + 24, 8, 8, palette.cloth);         // crest

    // --- Hat ---
    box(cx - 13, py + 6, 26, 5, palette.cloth);        // brim
    box(cx - 8, py - 2, 16, 10, palette.cloth);        // cone
    box(cx - 3, py + 8, 6, 4, "#b36b00");              // buckle

    // --- Face ---
    box(cx - 8, py + 11, 16, 10, "#ffe0bd");
    box(cx - 6, py + 14, 4, 3, palette.spriteInk);  // eye
    box(cx + 1, py + 14, 4, 3, palette.spriteInk);  // eye

    // Glowing eye tint
    g.fillStyle = "#fde68a";
    g.fillRect(cx - 5, py + 14, 2, 2);
    g.fillRect(cx + 2, py + 14, 2, 2);

    // --- Legs: alternate two positions to suggest a walk cycle ---
    var step = player.moving ? (Math.floor(frame / 6) % 2) : 0;
    box(cx - 8, py + 40, 6, step ? 8 : 6, palette.spriteInk);
    box(cx + 2, py + 40, 6, step ? 6 : 8, palette.spriteInk);

    g.restore();
  }

  /* Drifting "+100" text. */
  function drawFloaters() {
    var g = fg || ctx;

    g.font = "bold 14px monospace";
    g.textAlign = "center";
    for (var i = 0; i < floaters.length; i++) {
      var f = floaters[i];
      var alpha = Math.min(1, f.life / 30);
      g.globalAlpha = alpha;

      g.fillStyle = palette.spriteInk;
      g.fillText(f.text, f.x + 1, f.y + 1);
      g.fillStyle = palette.gold;
      g.fillText(f.text, f.x, f.y);
    }
    g.globalAlpha = 1;
    g.textAlign = "left";
  }

  /* Very light scanline pass to tie the canvas into the CRT styling. */
  function drawScanlines() {
    ctx.fillStyle = palette.scanline;
    for (var y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, W, 1);
    }
  }

  function render() {
    // --- Background layer: arena floor, coins, scanlines ---
    ctx.clearRect(0, 0, W, H);
    drawArena();

    for (var i = 0; i < coins.length; i++) drawCoin(coins[i]);

    if (!reducedMotion) drawScanlines();

    // --- Foreground layer: the character ---
    // Cleared and redrawn every frame. It sits above the profile card in the
    // stacking order, so the sprite is never covered by the card.
    if (fgCanvas) fg.clearRect(0, 0, W, H);

    drawPlayer();
    drawFloaters();
  }

  /* ---------------------------------------------------------------------
     Loop
     --------------------------------------------------------------------- */
  var rafId = null;

  function loop() {
    if (!running) return;
    update();
    render();
    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (rafId !== null) return;
    running = true;
    rafId = window.requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /* ---------------------------------------------------------------------
     Input
     --------------------------------------------------------------------- */

  var KEYMAP = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right"
  };

  function onKeyDown(e) {
    var dir = KEYMAP[e.key];
    if (!dir) return;

    // Arrow keys scroll the page on a phone-sized layout; never let the
    // decorative sprite swallow them.
    if (isMobile()) return;

    // Only hijack the arrows while the hero is actually on screen, otherwise
    // the user cannot scroll the page with the keyboard.
    var rect = canvas.getBoundingClientRect();
    var visible = rect.bottom > 0 && rect.top < window.innerHeight;
    if (!visible) return;

    // Do not steal keys from form fields.
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    input[dir] = true;
    e.preventDefault();
    if (window.Chiptune) window.Chiptune.init();
  }

  function onKeyUp(e) {
    var dir = KEYMAP[e.key];
    if (!dir) return;
    input[dir] = false;
  }

  // Clear all held directions when focus leaves, otherwise the player keeps
  // walking after an alt-tab.
  function clearInput() {
    input.up = input.down = input.left = input.right = false;
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", clearInput);

  /* --- Pointer: click/tap the arena to walk toward that point --- */
  var pointerTarget = null;

  canvas.addEventListener("pointerdown", function (e) {
    // No walk-to-tap on a phone: the sprite is decoration and would otherwise
    // wander off the photo and across the boot log.
    if (isMobile()) return;

    if (window.Chiptune) window.Chiptune.init();
    var rect = canvas.getBoundingClientRect();
    pointerTarget = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", function (e) {
    if (!pointerTarget) return;
    var rect = canvas.getBoundingClientRect();
    pointerTarget = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  });

  function endPointer(e) {
    pointerTarget = null;
    // Without this the flags stay latched and the player walks forever.
    clearInput();
    if (e && e.pointerId !== undefined && canvas.hasPointerCapture &&
        canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointerleave", endPointer);

  /* Steer toward the pointer target inside the main update. Kept separate
     from keyboard input so the two can coexist. */
  var baseUpdate = update;
  update = function () {
    if (pointerTarget) {
      var pcx = player.x + player.w / 2;
      var pcy = player.y + player.h / 2;
      var dx = pointerTarget.x - pcx;
      var dy = pointerTarget.y - pcy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 6) {
        pointerTarget = null;
      } else {
        input.left  = dx < -2;
        input.right = dx > 2;
        input.up    = dy < -2;
        input.down  = dy > 2;
      }
    }
    baseUpdate();
  };

  /* --- D-pad buttons --- */
  var dpadMap = {
    "dpad-up": "up",
    "dpad-down": "down",
    "dpad-left": "left",
    "dpad-right": "right"
  };

  Object.keys(dpadMap).forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    var dir = dpadMap[id];

    // The D-pad is hidden by CSS on a phone; skip binding so no stray
    // listener can move the decorative sprite.
    if (isMobile()) return;

    function press(e) {
      e.preventDefault();
      input[dir] = true;
      if (window.Chiptune) window.Chiptune.init();
    }
    function release(e) {
      if (e) e.preventDefault();
      input[dir] = false;
    }

    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointerleave", release);
    btn.addEventListener("pointercancel", release);
  });

  /* --- Add-coin button --- */
  var spawnBtn = document.getElementById("spawn-coin-btn");
  if (spawnBtn) {
    spawnBtn.addEventListener("click", function () {
      // Drop a coin where the player can actually see and reach it. Rather than
      // retrying random offsets until one happens to be clear -- which fails on
      // a phone, where the card covers nearly everything -- pick the clear
      // position closest to the player.
      // The cached card box can be stale while the boot log is still typing,
      // which would place the coin behind the card it was measured against.
      measureCard();

      var pcx = player.x + player.w / 2;
      var pcy = player.y + player.h / 2;

      var rects = coinRects();
      var cx;
      var cy;

      if (!rects.length) {
        var fallback = randomCoinPos();
        cx = fallback.x;
        cy = fallback.y;
      } else {
        var bestDist = Infinity;
        cx = pcx;
        cy = pcy;

        for (var r = 0; r < rects.length; r++) {
          var box = rects[r];

          // Clamp the player's centre into this rectangle: that is the nearest
          // point of the region to the player.
          var nx = Math.min(Math.max(pcx, box.x), box.x + box.w);
          var ny = Math.min(Math.max(pcy, box.y), box.y + box.h);

          var d = (nx - pcx) * (nx - pcx) + (ny - pcy) * (ny - pcy);

          if (d < bestDist) {
            bestDist = d;
            cx = nx;
            cy = ny;
          }
        }
      }

      coins.push({ x: cx, y: cy, phase: 0, born: frame });
    });
  }

  /* ---------------------------------------------------------------------
     Visibility + resize
     --------------------------------------------------------------------- */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      resize();
      render();
    }, 150);
  });

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  resize();
  placePlayer();
  syncReadouts();

  if (reducedMotion) {
    // Draw a single static frame: still informative, but no motion.
    frame = 20;
    render();
  } else {
    start();
  }

  // The boot log types itself out and the web fonts swap in, either of which
  // changes the card's height. The loop catches both, but a reduced-motion
  // visitor never runs the loop, so reconcile explicitly once the typing has
  // had time to finish and once more after it should certainly be done.
  window.setTimeout(function () { reconcileCard(); render(); }, 900);
  window.setTimeout(function () { reconcileCard(); render(); }, 2600);

  // Expose a tiny handle for debugging / future extensions.
  window.Arena = {
    get score() { return score; },
    get coins() { return coinsCollected; },
    start: start,
    stop: stop,
    refreshTheme: refreshTheme
  };
})(window, document);
