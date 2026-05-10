const canvas = document.querySelector("#pitch-canvas");
const ctx = canvas.getContext("2d");
const siteSong = document.querySelector("#site-song");
const songVolume = document.querySelector("#song-volume");
const songVolumeValue = document.querySelector("#song-volume-value");
const minimumSongVolume = 0.1;
const originalSongStartTime = 16;

let width = 0;
let height = 0;
let pointer = { x: 0.62, y: 0.42 };

function setSongVolume(value) {
  const volume = Math.max(minimumSongVolume, Math.min(1, Number(value) / 100));
  siteSong.volume = volume;
  siteSong.muted = false;
  songVolume.value = Math.round(volume * 100);
  songVolumeValue.value = songVolume.value;
}

function playSiteSong() {
  siteSong.muted = false;
  if (!siteSong.currentSrc.includes("lighter-clipped") && siteSong.currentTime < originalSongStartTime) {
    siteSong.currentTime = originalSongStartTime;
  }
  siteSong.play().catch(() => {
    document.addEventListener("pointerdown", playSiteSong, { once: true });
    document.addEventListener("keydown", playSiteSong, { once: true });
  });
}

siteSong.addEventListener("volumechange", () => {
  if (siteSong.muted || siteSong.volume < minimumSongVolume) {
    setSongVolume(Math.max(minimumSongVolume, siteSong.volume) * 100);
  }
});

songVolume.addEventListener("input", (event) => {
  setSongVolume(event.target.value);
});

setSongVolume(songVolume.value);
playSiteSong();

const balls = Array.from({ length: 16 }, (_, index) => ({
  x: Math.random(),
  y: Math.random(),
  size: 2 + Math.random() * 4,
  phase: index * 0.8,
  speed: 0.00035 + Math.random() * 0.00055,
}));

const runners = [
  { x: 0.18, y: 0.55, scale: 0.92, phase: 0.2 },
  { x: 0.34, y: 0.5, scale: 1.15, phase: 1.1 },
  { x: 0.48, y: 0.53, scale: 0.9, phase: 2.4 },
  { x: 0.64, y: 0.48, scale: 0.95, phase: 0.8 },
  { x: 0.78, y: 0.52, scale: 0.82, phase: 1.8 },
];

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawRunner(x, y, scale, time, phase) {
  const stride = Math.sin(time * 0.006 + phase) * 5 * scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "rgba(235, 242, 255, 0.9)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.fillStyle = "#1a2d68";
  ctx.beginPath();
  ctx.arc(0, -27, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#e9d4ba";
  ctx.fill();
  ctx.fillStyle = "#232f73";
  ctx.fillRect(-6, -20, 12, 24);
  ctx.beginPath();
  ctx.moveTo(-5, -12);
  ctx.lineTo(-18, -5 + stride);
  ctx.moveTo(5, -11);
  ctx.lineTo(18, -18 - stride);
  ctx.moveTo(-4, 3);
  ctx.lineTo(-16, 25 - stride);
  ctx.moveTo(5, 3);
  ctx.lineTo(17, 25 + stride);
  ctx.stroke();
  ctx.restore();
}

function drawPitch(time) {
  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#08101e");
  sky.addColorStop(0.3, "#0b1729");
  sky.addColorStop(1, "#0b2440");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#070d15";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.23);
  ctx.bezierCurveTo(width * 0.25, height * 0.16, width * 0.35, height * 0.25, width * 0.52, height * 0.17);
  ctx.bezierCurveTo(width * 0.66, height * 0.11, width * 0.76, height * 0.24, width, height * 0.17);
  ctx.lineTo(width, height * 0.45);
  ctx.lineTo(0, height * 0.45);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(246, 166, 67, 0.82)";
  ctx.beginPath();
  ctx.arc(width * 0.86, height * 0.14, 7, 0, Math.PI * 2);
  ctx.fill();
  const lampGlow = ctx.createRadialGradient(width * 0.86, height * 0.14, 4, width * 0.86, height * 0.14, width * 0.18);
  lampGlow.addColorStop(0, "rgba(246, 166, 67, 0.32)");
  lampGlow.addColorStop(1, "rgba(246, 166, 67, 0)");
  ctx.fillStyle = lampGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(8, 10, 16, 0.5)";
  ctx.fillRect(width * 0.78, 0, width * 0.22, height * 0.36);

  ctx.save();
  ctx.translate(0, height * 0.31);
  const stripeWidth = Math.max(56, width / 13);
  for (let x = -stripeWidth; x < width + stripeWidth; x += stripeWidth) {
    ctx.fillStyle = Math.round(x / stripeWidth) % 2 === 0 ? "#0a6c55" : "#075744";
    ctx.fillRect(x, 0, stripeWidth, height * 0.69);
  }

  const turfSpacing = 14;
  ctx.lineWidth = 1.2;
  for (let y = 0; y < height * 0.69; y += turfSpacing) {
    ctx.strokeStyle = y % (turfSpacing * 2) === 0 ? "rgba(117, 201, 246, 0.08)" : "rgba(234, 247, 255, 0.05)";
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(time * 0.001 + y) * 1.5);
    ctx.lineTo(width, y + Math.cos(time * 0.001 + y) * 1.5);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(width * 0.5, height * 0.74);
  ctx.rotate(-0.06);
  ctx.fillStyle = "#7b5bbb";
  ctx.fillRect(-width * 0.58, -height * 0.1, width * 1.16, height * 0.23);
  ctx.fillStyle = "rgba(234, 247, 255, 0.8)";
  ctx.fillRect(-width * 0.62, -height * 0.16, width * 1.24, height * 0.055);
  ctx.restore();

  ctx.save();
  ctx.translate(width * 0.62, height * 0.52);
  ctx.rotate(-0.1);
  ctx.strokeStyle = "rgba(234, 247, 255, 0.8)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-width * 0.76, height * 0.09);
  ctx.lineTo(width * 0.58, -height * 0.03);
  ctx.stroke();
  ctx.strokeStyle = "rgba(248, 220, 64, 0.78)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width * 0.1, height * 0.16);
  ctx.lineTo(width * 0.58, height * 0.11);
  ctx.stroke();
  ctx.restore();

  const glow = ctx.createRadialGradient(width * 0.72, height * 0.28, 20, width * 0.72, height * 0.28, width * 0.58);
  glow.addColorStop(0, "rgba(117, 201, 246, 0.24)");
  glow.addColorStop(0.5, "rgba(12, 134, 209, 0.1)");
  glow.addColorStop(1, "rgba(12, 134, 209, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width * 0.58 + (pointer.x - 0.5) * 28, height * 0.58 + (pointer.y - 0.5) * 20);
  ctx.rotate(-0.12);
  ctx.strokeStyle = "rgba(234, 247, 255, 0.5)";
  ctx.lineWidth = 3;
  const fieldW = width * 0.62;
  const fieldH = height * 0.48;
  ctx.strokeRect(-fieldW / 2, -fieldH / 2, fieldW, fieldH);
  ctx.beginPath();
  ctx.arc(0, 0, Math.min(width, height) * 0.14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -fieldH / 2);
  ctx.lineTo(0, fieldH / 2);
  ctx.stroke();

  const boxW = fieldW * 0.18;
  const boxH = fieldH * 0.46;
  ctx.strokeStyle = "rgba(117, 201, 246, 0.52)";
  ctx.strokeRect(-fieldW / 2, -boxH / 2, boxW, boxH);
  ctx.strokeRect(fieldW / 2 - boxW, -boxH / 2, boxW, boxH);
  ctx.strokeStyle = "rgba(234, 247, 255, 0.34)";
  ctx.strokeRect(-fieldW / 2, -boxH * 0.78 / 2, boxW * 0.45, boxH * 0.78);
  ctx.strokeRect(fieldW / 2 - boxW * 0.45, -boxH * 0.78 / 2, boxW * 0.45, boxH * 0.78);
  ctx.restore();

  ctx.save();
  ctx.translate(width * 0.38, height * 0.31);
  ctx.strokeStyle = "#f8df35";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-width * 0.08, -height * 0.31);
  ctx.lineTo(-width * 0.08, height * 0.03);
  ctx.lineTo(width * 0.08, height * 0.03);
  ctx.lineTo(width * 0.08, -height * 0.31);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, height * 0.03);
  ctx.lineTo(0, height * 0.16);
  ctx.stroke();
  ctx.strokeStyle = "rgba(248, 251, 255, 0.82)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-width * 0.105, height * 0.1, width * 0.21, height * 0.11);
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i += 1) {
    const netX = -width * 0.105 + (width * 0.21 * i) / 8;
    ctx.beginPath();
    ctx.moveTo(netX, height * 0.1);
    ctx.lineTo(netX, height * 0.21);
    ctx.stroke();
  }
  for (let i = 1; i < 4; i += 1) {
    const netY = height * 0.1 + (height * 0.11 * i) / 4;
    ctx.beginPath();
    ctx.moveTo(-width * 0.105, netY);
    ctx.lineTo(width * 0.105, netY);
    ctx.stroke();
  }
  ctx.restore();

  for (const runner of runners) {
    drawRunner(width * runner.x, height * runner.y, runner.scale, time, runner.phase);
  }

  for (const ball of balls) {
    const x = ball.x * width + Math.sin(time * ball.speed + ball.phase) * 24;
    const y = height * 0.35 + ball.y * height * 0.58 + Math.cos(time * ball.speed + ball.phase) * 18;
    const nearPointer = Math.max(0, 1 - Math.hypot(x - pointer.x * width, y - pointer.y * height) / 220);
    ctx.globalAlpha = 0.26 + nearPointer * 0.56;
    ctx.fillStyle = ball.phase % 2 > 1 ? "#75c9f6" : "#f8fbff";
    ctx.beginPath();
    ctx.arc(x, y, ball.size + nearPointer * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function render(time = 0) {
  drawPitch(time);
  requestAnimationFrame(render);
}

function movePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer = {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}


window.addEventListener("resize", resize);
canvas.addEventListener("pointermove", movePointer);

resize();
requestAnimationFrame(render);

document.querySelectorAll(".stat-scroller").forEach((scroller) => {
  scroller.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }
    event.preventDefault();
    scroller.scrollLeft += event.deltaY;
  }, { passive: false });
});
