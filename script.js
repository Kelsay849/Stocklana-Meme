(() => {
  const canvas = document.getElementById("paint-canvas");
  const ctx = canvas.getContext("2d");
  const drips = [];
  const blobs = [];
  const coins = [];
  const COLORS = ["#ff3b4a", "#ff8a1f", "#ffe14a", "#7dff4d", "#3de0ff", "#6b2dff", "#e23cff", "#2f6bff"];

  const COIN_SRCS = [
    "assets/coins/coin-00.png",
    "assets/coins/coin-01.png",
    "assets/coins/coin-02.png",
    "assets/coins/coin-03.png",
    "assets/coins/coin-04.png",
    "assets/coins/coin-05.png",
    "assets/coins/coin-06.png",
    "assets/coins/coin-07.png",
    "assets/coins/coin-08.png",
    "assets/coins/coin-09.png",
    "assets/coins/coin-10.png",
    "assets/coins/coin-11.png",
    "assets/coins/coin-12.png",
    "assets/coins/coin-13.png",
    "assets/coins/coin-solana.png",
    "assets/logo.png",
  ];

  const coinImgs = COIN_SRCS.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });

  let readyCount = 0;
  let coinsReady = false;
  coinImgs.forEach((img) => {
    const done = () => {
      readyCount += 1;
      if (readyCount >= coinImgs.length) coinsReady = true;
    };
    if (img.complete) done();
    else {
      img.onload = done;
      img.onerror = done;
    }
  });

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawnDrip() {
    drips.push({
      x: Math.random() * canvas.width,
      y: -20,
      vy: 1.2 + Math.random() * 2.4,
      r: 3 + Math.random() * 6,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
    });
  }

  function spawnBlob() {
    blobs.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 8 + Math.random() * 28,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
      decay: 0.004 + Math.random() * 0.008,
    });
  }

  function spawnCoin(fromTop) {
    const img = coinImgs[(Math.random() * coinImgs.length) | 0];
    if (!img || !img.naturalWidth) return;
    const size = 42 + Math.random() * 58;
    coins.push({
      img,
      x: Math.random() * canvas.width,
      y: fromTop ? -size - Math.random() * 120 : Math.random() * canvas.height,
      size,
      vy: 0.55 + Math.random() * 1.35,
      vx: (Math.random() - 0.5) * 0.7,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
      alpha: 0.55 + Math.random() * 0.35,
    });
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.025) spawnDrip();
    if (Math.random() < 0.012) spawnBlob();
    if (coinsReady && coins.length < 28 && Math.random() < 0.08) spawnCoin(true);

    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i];
      d.y += d.vy;
      d.life -= 0.003;
      ctx.beginPath();
      ctx.fillStyle = d.color;
      ctx.globalAlpha = Math.max(d.life, 0) * 0.35;
      ctx.ellipse(d.x, d.y, d.r * 0.55, d.r * 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(d.x, d.y - d.r * 1.2, d.r * 0.7, d.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      if (d.y > canvas.height + 40 || d.life <= 0) drips.splice(i, 1);
    }

    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i];
      b.life -= b.decay;
      ctx.beginPath();
      ctx.globalAlpha = Math.max(b.life, 0) * 0.2;
      ctx.fillStyle = b.color;
      ctx.ellipse(b.x, b.y, b.r, b.r * 0.75, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      if (b.life <= 0) blobs.splice(i, 1);
    }

    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.sway += c.swaySpeed;
      c.x += c.vx + Math.sin(c.sway) * 0.45;
      c.y += c.vy;
      c.rot += c.vr;

      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.beginPath();
      ctx.arc(0, 0, c.size * 0.5, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(c.img, -c.size * 0.5, -c.size * 0.5, c.size, c.size);
      ctx.restore();

      // soft outline glow
      ctx.save();
      ctx.globalAlpha = c.alpha * 0.35;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(26,18,48,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      if (c.y > canvas.height + c.size + 40) {
        coins.splice(i, 1);
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  for (let i = 0; i < 8; i++) spawnBlob();

  const bootCoins = setInterval(() => {
    if (!coinsReady) return;
    clearInterval(bootCoins);
    for (let i = 0; i < 16; i++) spawnCoin(false);
  }, 80);

  requestAnimationFrame(tick);

  // Scroll reveal
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((el) => io.observe(el));

  // Mobile nav
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  // Copy CA
  const copyBtn = document.getElementById("copyCa");
  const caText = document.getElementById("caText");
  if (copyBtn && caText) {
    copyBtn.addEventListener("click", async () => {
      const value = caText.textContent.trim();
      try {
        await navigator.clipboard.writeText(value);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1400);
      } catch {
        copyBtn.textContent = "Failed";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1400);
      }
    });
  }

  // Cursor paint trail (desktop)
  let last = 0;
  window.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - last < 40) return;
    last = now;
    if (e.pointerType === "touch") return;
    blobs.push({
      x: e.clientX,
      y: e.clientY,
      r: 6 + Math.random() * 10,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 0.9,
      decay: 0.02,
    });
  });
})();
