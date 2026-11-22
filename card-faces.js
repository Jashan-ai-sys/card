// 2D canvases for the 3D card: front (the signature layout), back (QR + links) and the foil masks
// that tell the holographic layer where to shine. Reads window.PROFILE and window.ICONS.
const P = window.PROFILE;
export const CARD_W = 1024;
export const CARD_H = 640; // 1.6 ratio, close to a business card

const FONT = '-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

function canvas(w = CARD_W, h = CARD_H) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const iconImage = (name, color) =>
  loadImage("data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96" style="color:${color}">${window.ICONS[name]}</svg>`));

function drawMark(ctx, x, y, s) {
  const g = ctx.createLinearGradient(x, y, x + s, y + s);
  g.addColorStop(0, "#5b86ff");
  g.addColorStop(0.7, "#1f3fd1");
  ctx.fillStyle = g;
  roundRect(ctx, x, y, s, s, s * 0.25);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `800 ${s * 0.4}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(P.initials, x + s / 2, y + s / 2 + s * 0.02);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// The slashed portrait art from the signature: photo (or monogram) cut into a parallelogram,
// a white slash through it and two grey shards. Shared with the GIF tile.
export function drawArt(ctx, x, y, w, h, photo) {
  const skew = (yy) => (y + h - yy) * Math.tan((28 * Math.PI) / 180);
  const shard = (left, width, height, from, to) => {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, from);
    g.addColorStop(1, to);
    ctx.fillStyle = g;
    const top = y + h - height;
    ctx.beginPath();
    ctx.moveTo(x + left + skew(top), top);
    ctx.lineTo(x + left + width + skew(top), top);
    ctx.lineTo(x + left + width, y + h);
    ctx.lineTo(x + left, y + h);
    ctx.fill();
  };
  shard(w * 0.58, w * 0.15, h, "#d9d9de", "#f3f3f5");
  shard(w * 0.79, w * 0.085, h * 0.78, "#c9c9cf", "#ececf0");

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.34, y);
  ctx.lineTo(x + w * 0.96, y);
  ctx.lineTo(x + w * 0.66, y + h);
  ctx.lineTo(x + w * 0.04, y + h);
  ctx.closePath();
  ctx.clip();
  if (photo) {
    const s = Math.max(w / photo.width, h / photo.height);
    const pw = photo.width * s;
    const ph = photo.height * s;
    ctx.drawImage(photo, x + (w - pw) / 2, y + (h - ph) * 0.2, pw, ph);
  } else {
    const g = ctx.createRadialGradient(x + w * 0.4, y + h * 0.2, 0, x + w * 0.4, y + h * 0.2, h * 1.1);
    g.addColorStop(0, "#f3dfb8");
    g.addColorStop(0.45, "#cfa776");
    g.addColorStop(0.9, "#6b4a2f");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,244,214,.28)";
    for (let i = -4; i < 8; i++) {
      const bx = x + i * h * 0.3;
      ctx.beginPath();
      ctx.moveTo(bx, y + h);
      ctx.lineTo(bx + h * 0.78, y);
      ctx.lineTo(bx + h * 0.78 + h * 0.1, y);
      ctx.lineTo(bx + h * 0.1, y + h);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(28,18,10,.8)";
    ctx.font = `800 ${h * 0.4}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(P.initials, x + w / 2, y + h / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  // white slash through the cut-out
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(2, w * 0.024);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5 + h * 0.31, y);
  ctx.lineTo(x + w * 0.5 - h * 0.31, y + h);
  ctx.stroke();
}

// forEmail drops the small contact lines: unreadable in the GIF, and the HTML line under it has them.
export async function drawFront(photo, { forEmail = false } = {}) {
  const c = canvas();
  const ctx = c.getContext("2d");
  // pearl base
  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#eeeef3");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // icon rail
  ctx.strokeStyle = "#dcdce4";
  ctx.lineWidth = 3;
  roundRect(ctx, 56, 60, 108, 420, 30);
  ctx.stroke();
  drawMark(ctx, 78, 82, 64);
  const ids = ["globe", ...P.links.filter((l) => l.id !== "globe").map((l) => l.id), "mail"];
  const icons = await Promise.all(ids.map((id) => iconImage(id, "#6f6f7c")));
  icons.forEach((img, i) => img && ctx.drawImage(img, 92, 180 + i * 72, 36, 36));

  // text column
  const tx = 210;
  ctx.fillStyle = "#1c1c22";
  ctx.font = `700 26px ${FONT}`;
  ctx.letterSpacing = "11px";
  ctx.fillText(P.firstName.toUpperCase(), tx, 108);
  ctx.letterSpacing = "0px";
  ctx.font = `700 54px ${FONT}`;
  ctx.fillStyle = "#14141a";
  ctx.fillText(P.name, tx, 186);
  ctx.font = `400 32px ${FONT}`;
  ctx.fillStyle = "#6b6b76";
  ctx.fillText(P.role, tx, 232);
  ctx.font = `700 26px ${FONT}`;
  ctx.fillStyle = "#14141a";
  P.tagline.split(" · ").forEach((t, i) => ctx.fillText(t, tx, 300 + i * 36));
  if (!forEmail) {
    ctx.font = `400 25px ${FONT}`;
    ctx.fillStyle = "#6b6b76";
    ctx.fillText(P.email, tx, 452);
    ctx.fillText(new URL(P.website).host, tx, 488);
  }
  ctx.font = `700 25px ${FONT}`;
  ctx.fillStyle = "#1f3fd1";
  ctx.fillText("✦ Ask my digital persona →", tx, 556);

  drawArt(ctx, 640, 250, 340, 340, photo);
  return c;
}

export async function drawBack() {
  const c = canvas();
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, "#17171f");
  g.addColorStop(1, "#0b0b10");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // QR to the profile, dark on light so phone cameras read it
  const qr = window.qrcode(0, "M");
  qr.addData(P.baseUrl);
  qr.make();
  const n = qr.getModuleCount();
  const size = 360;
  const cell = size / (n + 8);
  const qx = 76;
  const qy = (CARD_H - size) / 2;
  ctx.fillStyle = "#fff";
  roundRect(ctx, qx, qy, size, size, 28);
  ctx.fill();
  ctx.fillStyle = "#0b0b10";
  for (let r = 0; r < n; r++)
    for (let col = 0; col < n; col++)
      if (qr.isDark(r, col)) ctx.fillRect(qx + (col + 4) * cell, qy + (r + 4) * cell, cell + 0.5, cell + 0.5);

  const tx = 500;
  drawMark(ctx, tx, 150, 72);
  ctx.fillStyle = "#f5f5f7";
  ctx.font = `700 44px ${FONT}`;
  ctx.fillText("Scan to open my card", tx, 290);
  ctx.font = `400 28px ${FONT}`;
  ctx.fillStyle = "#b9b9c2";
  ctx.fillText(P.baseUrl.replace(/^https?:\/\//, ""), tx, 338);
  ctx.fillText(P.email, tx, 384);
  ctx.fillStyle = "#7d9bff";
  ctx.font = `700 26px ${FONT}`;
  ctx.fillText("Flip the card to go back", tx, 470);
  return c;
}

// Foil masks: white = strong holo, black = none. A faint line pattern covers the whole card,
// except on the email GIF, where it turns into dither noise and bloats the file.
export function drawFoilMask(side, { lines = true } = {}) {
  const c = canvas(512, 320);
  const ctx = c.getContext("2d");
  ctx.scale(0.5, 0.5);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = "rgba(255,255,255,.16)";
  ctx.lineWidth = 2;
  for (let x = -CARD_H; lines && x < CARD_W; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, CARD_H);
    ctx.lineTo(x + CARD_H * 0.53, 0);
    ctx.stroke();
  }
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 10;
  roundRect(ctx, 14, 14, CARD_W - 28, CARD_H - 28, 34);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  if (side === "front") {
    // wordmark letters, drawn exactly as on the front so the foil sits on the type
    ctx.font = `700 26px ${FONT}`;
    ctx.letterSpacing = "11px";
    ctx.fillText(P.firstName.toUpperCase(), 210, 108);
    ctx.letterSpacing = "0px";
    const skew = (yy) => (590 - yy) * Math.tan((28 * Math.PI) / 180);
    [[838, 51, 340], [909, 29, 265]].forEach(([left, w, hh]) => {
      const top = 590 - hh;
      ctx.beginPath();
      ctx.moveTo(left + skew(top), top);
      ctx.lineTo(left + w + skew(top), top);
      ctx.lineTo(left + w, 590);
      ctx.lineTo(left, 590);
      ctx.fill();
    });
  } else {
    ctx.fillRect(500, 150, 72, 72); // mark
  }
  return c;
}
