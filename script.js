(() => {
  const canvas = document.getElementById("paint-canvas");
  const ctx = canvas.getContext("2d");
  const drips = [];
  const blobs = [];
  const COLORS = ["#ff3b4a", "#ff8a1f", "#ffe14a", "#7dff4d", "#3de0ff", "#6b2dff", "#e23cff", "#2f6bff"];

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

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.04) spawnDrip();
    if (Math.random() < 0.02) spawnBlob();

    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i];
      d.y += d.vy;
      d.life -= 0.003;
      ctx.beginPath();
      ctx.fillStyle = d.color;
      ctx.globalAlpha = Math.max(d.life, 0) * 0.45;
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
      ctx.globalAlpha = Math.max(b.life, 0) * 0.28;
      ctx.fillStyle = b.color;
      ctx.ellipse(b.x, b.y, b.r, b.r * 0.75, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      if (b.life <= 0) blobs.splice(i, 1);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  for (let i = 0; i < 12; i++) spawnBlob();
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
