// Pure-Node PNG generator — no native deps required.
// Uses manual PNG encoding (zlib deflate via built-in zlib module).
import { deflateSync } from "zlib";
import { writeFileSync } from "fs";

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, c]);
}

function encodePng(pixels, w, h) {
  // pixels: Uint8Array of RGBA, row-major
  const rows = [];
  for (let y = 0; y < h; y++) {
    rows.push(0); // filter byte: None
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      rows.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
    }
  }
  const raw = deflateSync(Buffer.from(rows));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // bit depth, RGBA
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", raw),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function drawFavicon(size, radius, bgR, bgG, bgB) {
  const pixels = new Uint8Array(size * size * 4);

  // ── Background: rounded rectangle ──────────────────
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Distance from nearest corner arc centre
      const cx = x < radius ? radius : x >= size - radius ? size - radius - 1 : x;
      const cy = y < radius ? radius : y >= size - radius ? size - radius - 1 : y;
      const dx = x - cx, dy = y - cy;
      const inside = dx * dx + dy * dy <= radius * radius;
      const inRect = x >= radius && x < size - radius || y >= radius && y < size - radius;
      if (inside || inRect) {
        pixels[i] = bgR; pixels[i+1] = bgG; pixels[i+2] = bgB; pixels[i+3] = 255;
      }
    }
  }

  // ── Letter "S" via bezier-free bitmap rasterisation ─
  // We draw a scaled reference glyph at 32px then scale.
  // Simpler: hard-code an "S" shape using filled rectangles/arcs at the target size.
  const scale = size / 32;
  const sw = Math.round(3.5 * scale); // stroke width
  const cx = size / 2;
  const topY    = Math.round(5  * scale);
  const midY    = Math.round(15 * scale);
  const botY    = Math.round(26 * scale);
  const leftX   = Math.round(8  * scale);
  const rightX  = Math.round(24 * scale);
  const arcR    = Math.round(5.5 * scale);

  function plotCircle(ox, oy, r, startAngle, endAngle) {
    const steps = Math.max(64, r * 8);
    for (let s = 0; s <= steps; s++) {
      const a = startAngle + (endAngle - startAngle) * (s / steps);
      for (let t = -sw / 2; t <= sw / 2; t++) {
        const px = Math.round(ox + (r + t) * Math.cos(a));
        const py = Math.round(oy + (r + t) * Math.sin(a));
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const i = (py * size + px) * 4;
          pixels[i] = 255; pixels[i+1] = 255; pixels[i+2] = 255; pixels[i+3] = 255;
        }
      }
    }
  }

  // Top arc of S (left-facing, top half)
  const topCX = Math.round(cx);
  const topCY = Math.round(topY + arcR);
  plotCircle(topCX, topCY, arcR, -Math.PI, 0);

  // Middle arc of S — two small arcs meeting in the middle
  const midCX = Math.round(cx);
  const midCY = Math.round(midY - arcR * 0.2);
  plotCircle(midCX, midCY, arcR * 0.85, 0, Math.PI);

  // Bottom arc of S
  const botCX = Math.round(cx);
  const botCY = Math.round(botY - arcR);
  plotCircle(botCX, botCY, arcR, 0, Math.PI);

  return pixels;
}

// 32×32
const px32 = drawFavicon(32, 7, 13, 148, 136);
writeFileSync("favicon-32.png", encodePng(px32, 32, 32));

// 180×180
const px180 = drawFavicon(180, 40, 13, 148, 136);
writeFileSync("favicon-apple.png", encodePng(px180, 180, 180));

console.log("favicon-32.png and favicon-apple.png generated.");
