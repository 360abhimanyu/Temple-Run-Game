(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const coinsEl = document.getElementById("coins");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const pauseLabel = document.getElementById("pauseLabel");

  const W = canvas.width, H = canvas.height;
  const LANES = [-1, 0, 1];
  const horizonY = 150;
  let running = false, paused = false, gameOver = false;
  let lane = 0, playerX = 0, jumpTime = 0, slideTime = 0;
  let distance = 0, coins = 0, speed = 0.34, spawnTimer = 0, coinTimer = 0;
  let obstacles = [], pickups = [], particles = [];
  let lastTime = 0, roadOffset = 0;
  let best = Number(localStorage.getItem("jungleDashBest") || 0);
  bestEl.textContent = best;

  function resetGame() {
    lane = 0; playerX = 0; jumpTime = 0; slideTime = 0;
    distance = 0; coins = 0; speed = 0.34; spawnTimer = 0.7; coinTimer = 0.5;
    obstacles = []; pickups = []; particles = []; roadOffset = 0;
    running = true; paused = false; gameOver = false;
    overlay.classList.add("hidden"); pauseLabel.classList.add("hidden");
    pauseBtn.textContent = "Ⅱ";
    updateHud();
  }
  function updateHud() {
    scoreEl.textContent = Math.floor(distance).toLocaleString();
    coinsEl.textContent = coins.toString();
    bestEl.textContent = best.toLocaleString();
  }
  function startGame() { resetGame(); lastTime = performance.now(); requestAnimationFrame(loop); }
  function endGame() {
    running = false; gameOver = true;
    const finalScore = Math.floor(distance);
    if (finalScore > best) {
      best = finalScore;
      localStorage.setItem("jungleDashBest", String(best));
    }
    updateHud();
    overlayTitle.textContent = "Run over!";
    overlayText.textContent = `You ran ${finalScore} metres and collected ${coins} coins. Try again and beat your best!`;
    startBtn.textContent = "Run again";
    overlay.classList.remove("hidden");
    pauseLabel.classList.add("hidden");
  }
  function togglePause() {
    if (!running && !paused) return;
    paused = !paused;
    pauseLabel.classList.toggle("hidden", !paused);
    pauseBtn.textContent = paused ? "▶" : "Ⅱ";
    if (!paused) { lastTime = performance.now(); requestAnimationFrame(loop); }
  }

  function moveLeft() { if (running && !paused) lane = Math.max(-1, lane - 1); }
  function moveRight() { if (running && !paused) lane = Math.min(1, lane + 1); }
  function jump() { if (running && !paused && jumpTime <= 0 && slideTime <= 0) jumpTime = 0.72; }
  function slide() { if (running && !paused && slideTime <= 0 && jumpTime <= 0) slideTime = 0.58; }
  function action(name) {
    if (name === "left") moveLeft();
    if (name === "right") moveRight();
    if (name === "jump") jump();
    if (name === "slide") slide();
  }
  document.addEventListener("keydown", e => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "p", "P"];
    if (keys.includes(e.key)) e.preventDefault();
    if (e.repeat && e.key.toLowerCase() !== "p") return;
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") moveLeft();
    else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") moveRight();
    else if (e.key === "ArrowUp" || e.key === " ") jump();
    else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") slide();
    else if (e.key.toLowerCase() === "p") togglePause();
    else if ((e.key === "Enter") && (!running || gameOver)) startGame();
  });
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("pointerdown", e => { e.preventDefault(); action(btn.dataset.action); });
  });
  startBtn.addEventListener("click", startGame);
  pauseBtn.addEventListener("click", togglePause);

  let touchStart = null;
  canvas.addEventListener("touchstart", e => {
    const t = e.changedTouches[0]; touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  canvas.addEventListener("touchend", e => {
    if (!touchStart) return;
    const t = e.changedTouches[0], dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 25) {
      if (Math.abs(dx) > Math.abs(dy)) action(dx < 0 ? "left" : "right");
      else action(dy < 0 ? "jump" : "slide");
    }
    touchStart = null;
  }, { passive: true });

  function roadAt(z) {
    const t = Math.max(0, Math.min(1, z));
    const y = horizonY + (H - horizonY) * t;
    const half = 34 + 340 * t;
    return { y, half, center: W / 2 };
  }
  function laneX(which, z) {
    const r = roadAt(z);
    return r.center + which * r.half * 0.59;
  }
  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#6bb8c5"); sky.addColorStop(.38, "#c1d69b"); sky.addColorStop(1, "#315b36");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // distant jungle ridges
    ctx.fillStyle = "#477f54";
    ctx.beginPath(); ctx.moveTo(0, horizonY + 35);
    for (let x = 0; x <= W; x += 45) ctx.lineTo(x, horizonY + 15 + Math.sin(x * .025) * 23);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    // foliage silhouettes
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < 13; i++) {
        const x = side === 0 ? i * 35 - 15 : W - i * 35 + 15;
        const y = 90 + ((i * 31) % 140);
        const r = 25 + ((i * 13) % 30);
        ctx.fillStyle = i % 2 ? "#174d35" : "#23663c";
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    // road perspective
    const topL = W / 2 - 35, topR = W / 2 + 35, botL = -30, botR = W + 30;
    ctx.fillStyle = "#6c6248";
    ctx.beginPath(); ctx.moveTo(topL, horizonY); ctx.lineTo(topR, horizonY); ctx.lineTo(botR, H); ctx.lineTo(botL, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#9b8a62";
    ctx.beginPath(); ctx.moveTo(topL + 8, horizonY); ctx.lineTo(topR - 8, horizonY); ctx.lineTo(W + 4, H); ctx.lineTo(-4, H); ctx.closePath(); ctx.fill();
    // stone path tiles
    const tileCount = 13;
    for (let i = 0; i < tileCount; i++) {
      const z = ((i / tileCount) + roadOffset) % 1;
      const r = roadAt(z), prev = roadAt(Math.max(0, z - .055));
      ctx.strokeStyle = "#6c6248"; ctx.lineWidth = 2 + z * 4;
      ctx.beginPath(); ctx.moveTo(W / 2 - r.half, r.y); ctx.lineTo(W / 2 + r.half, r.y); ctx.stroke();
      if (i % 2 === 0) {
        ctx.fillStyle = "#b4a174";
        ctx.fillRect(W / 2 - r.half + 4, r.y, r.half * 2 - 8, 2 + z * 4);
      }
    }
    // lane markings
    ctx.setLineDash([10, 13]); ctx.strokeStyle = "#e2d5a0a0"; ctx.lineWidth = 2;
    for (const laneLine of [-.29, .29]) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + laneLine * 68, horizonY);
      ctx.lineTo(W / 2 + laneLine * 680, H); ctx.stroke();
    }
    ctx.setLineDash([]);
    // roadside plants
    for (let i = 0; i < 20; i++) {
      const z = ((i / 20) + roadOffset * 1.2) % 1;
      const r = roadAt(z);
      for (const side of [-1, 1]) {
        const x = W / 2 + side * (r.half + 20 + z * 70);
        const size = 8 + z * 30;
        ctx.fillStyle = i % 3 === 0 ? "#d0bd67" : "#174c30";
        ctx.beginPath(); ctx.ellipse(x, r.y, size * .55, size, side * -.3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  function drawPlayer() {
    const groundY = H - 75;
    const x = W / 2 + playerX * 200;
    let lift = 0;
    if (jumpTime > 0) lift = Math.sin((jumpTime / .72) * Math.PI) * 110;
    const sliding = slideTime > 0;
    // shadow
    ctx.fillStyle = "#16231977";
    ctx.beginPath(); ctx.ellipse(x, groundY + 18, sliding ? 45 : 28, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(x, groundY - lift);
    if (sliding) ctx.translate(0, 20);
    // legs
    ctx.strokeStyle = "#382b20"; ctx.lineWidth = sliding ? 12 : 14; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-8, 5); ctx.lineTo(-18, sliding ? 19 : 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, 5); ctx.lineTo(18, sliding ? 18 : 40); ctx.stroke();
    // body / shirt
    ctx.fillStyle = "#d8a76b";
    ctx.beginPath(); ctx.roundRect(-20, -42, 40, 54, 12); ctx.fill();
    ctx.fillStyle = "#eee0b3";
    ctx.beginPath(); ctx.roundRect(-17, -39, 34, 43, 10); ctx.fill();
    // arms
    ctx.strokeStyle = "#d8a76b"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(-17, -28); ctx.lineTo(-31, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(17, -28); ctx.lineTo(31, -8); ctx.stroke();
    // head and hair
    ctx.fillStyle = "#b9784c"; ctx.beginPath(); ctx.arc(0, -53, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3c281b"; ctx.beginPath(); ctx.arc(0, -59, 16, Math.PI, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawObstacle(o) {
    const r = roadAt(o.z), x = laneX(o.lane, o.z), y = r.y;
    const scale = .22 + o.z * 1.05;
    const w = (o.type === "gate" ? 56 : 48) * scale, h = (o.type === "gate" ? 70 : 48) * scale;
    ctx.fillStyle = "#17251d55"; ctx.beginPath(); ctx.ellipse(x, y, w * .8, 7 * scale, 0, 0, Math.PI * 2); ctx.fill();
    if (o.type === "rock") {
      ctx.fillStyle = "#554b3c"; ctx.beginPath();
      ctx.moveTo(x-w/2, y); ctx.lineTo(x-w*.42, y-h*.65); ctx.lineTo(x-w*.08, y-h); ctx.lineTo(x+w*.4, y-h*.75); ctx.lineTo(x+w/2, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#81745c"; ctx.beginPath(); ctx.moveTo(x-w*.08,y-h); ctx.lineTo(x+w*.4,y-h*.75); ctx.lineTo(x+w*.1,y-h*.28); ctx.closePath(); ctx.fill();
    } else if (o.type === "gate") {
      ctx.fillStyle = "#593b24"; ctx.fillRect(x-w/2, y-h, w*.18, h); ctx.fillRect(x+w*.32, y-h, w*.18, h);
      ctx.fillStyle = "#8c6032"; ctx.fillRect(x-w/2, y-h, w, h*.22);
      ctx.fillStyle = "#d1a65b"; ctx.fillRect(x-w/2, y-h, w, h*.08);
    } else {
      ctx.fillStyle = "#7b3829"; ctx.fillRect(x-w/2, y-h*.65, w, h*.65);
      ctx.fillStyle = "#e2a44f"; ctx.fillRect(x-w/2, y-h*.65, w, h*.18);
      ctx.fillStyle = "#542d21"; ctx.fillRect(x-w*.42, y-h*.45, w*.84, h*.11);
    }
  }
  function drawCoin(c) {
    const r = roadAt(c.z), x = laneX(c.lane, c.z), y = r.y - 15 * c.z;
    const rad = 4 + c.z * 12;
    ctx.fillStyle = "#8a5814"; ctx.beginPath(); ctx.ellipse(x, y, rad * .72, rad, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#ffcf36"; ctx.beginPath(); ctx.ellipse(x, y, rad * .56, rad * .85, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#fff0a0"; ctx.lineWidth = Math.max(1, c.z * 2); ctx.beginPath(); ctx.ellipse(x, y, rad * .25, rad * .56, 0, 0, Math.PI*2); ctx.stroke();
  }
  function spawnObstacle() {
    const types = ["rock", "rock", "gate", "barrier"];
    obstacles.push({ lane: LANES[Math.floor(Math.random() * 3)], z: 0.02, type: types[Math.floor(Math.random() * types.length)], checked: false });
  }
  function spawnCoins() {
    const chosenLane = LANES[Math.floor(Math.random() * 3)];
    for (let i = 0; i < 5; i++) pickups.push({ lane: chosenLane, z: 0.02 - i * .07, taken: false });
  }
  function burst(x, y) {
    for (let i = 0; i < 8; i++) particles.push({ x, y, vx: (Math.random()-.5)*130, vy: -Math.random()*100, life: .45 });
  }
  function update(dt) {
    distance += dt * (16 + speed * 18);
    speed = Math.min(.78, speed + dt * .004);
    roadOffset = (roadOffset + dt * speed * .35) % 1;
    if (jumpTime > 0) jumpTime = Math.max(0, jumpTime - dt);
    if (slideTime > 0) slideTime = Math.max(0, slideTime - dt);
    playerX += (lane - playerX) * Math.min(1, dt * 12);

    spawnTimer -= dt;
    if (spawnTimer <= 0) { spawnObstacle(); spawnTimer = Math.max(.52, 1.25 - speed * .7) + Math.random() * .45; }
    coinTimer -= dt;
    if (coinTimer <= 0) { spawnCoins(); coinTimer = 1.7 + Math.random() * 1.3; }

    for (const o of obstacles) {
      o.z += dt * speed;
      if (!o.checked && o.z > .82) {
        o.checked = true;
        const sameLane = Math.abs(playerX - o.lane) < .48;
        const safe = (o.type === "gate" && slideTime > .08) || (o.type !== "gate" && jumpTime > .1);
        // Some rocks/barriers are jumpable; a slide is required for the overhead gate.
        if (sameLane && !safe) { endGame(); return; }
      }
    }
    obstacles = obstacles.filter(o => o.z < 1.08);
    for (const c of pickups) {
      c.z += dt * speed;
      if (!c.taken && c.z > .82 && Math.abs(playerX - c.lane) < .48) {
        c.taken = true; coins++; burst(W/2 + c.lane*160, H-115); updateHud();
      }
    }
    pickups = pickups.filter(c => c.z < 1.08 && !c.taken);
    for (const p of particles) { p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 180*dt; p.life -= dt; }
    particles = particles.filter(p => p.life > 0);
    updateHud();
  }
  function render() {
    drawBackground();
    // Objects farther away should be drawn first.
    [...pickups].sort((a,b) => a.z-b.z).forEach(drawCoin);
    [...obstacles].sort((a,b) => a.z-b.z).forEach(drawObstacle);
    drawPlayer();
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / .45); ctx.fillStyle = "#ffda48";
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // subtle edge vignette
    const v = ctx.createRadialGradient(W/2,H/2,120,W/2,H/2,560);
    v.addColorStop(0,"#00000000"); v.addColorStop(1,"#07150d70");
    ctx.fillStyle = v; ctx.fillRect(0,0,W,H);
  }
  function loop(now) {
    if (!running || paused) return;
    const dt = Math.min((now - lastTime) / 1000, .04);
    lastTime = now;
    update(dt);
    render();
    if (running && !paused) requestAnimationFrame(loop);
  }

  // Draw a scenic title-screen frame before the first run.
  render();
})();
