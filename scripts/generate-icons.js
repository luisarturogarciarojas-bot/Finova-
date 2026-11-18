import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, drawPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x / width, y / height, x, y, width, height);
      rawData[pixelOffset] = Math.min(255, Math.max(0, Math.round(r)));
      rawData[pixelOffset + 1] = Math.min(255, Math.max(0, Math.round(g)));
      rawData[pixelOffset + 2] = Math.min(255, Math.max(0, Math.round(b)));
      rawData[pixelOffset + 3] = Math.min(255, Math.max(0, Math.round(a)));
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance to rounded rectangle
function sdRoundedRect(px, py, rx, ry, rw, rh, rad) {
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;
  const dx = Math.abs(px - cx) - (rw / 2 - rad);
  const dy = Math.abs(py - cy) - (rh / 2 - rad);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  const insideDist = Math.min(Math.max(dx, dy), 0);
  return Math.sqrt(ox * ox + oy * oy) + insideDist - rad;
}

// Draw the Fino emblem onto the canvas
function renderFinoIcon(u, v, isMaskable = false) {
  // u, v in [0, 1]
  // Normalize coords centered at (0.5, 0.5)
  const px = u * 512;
  const py = v * 512;

  // Background
  let r = 15 + (u * 15 + v * 20); // #0F172A to #1E293B
  let g = 23 + (u * 18 + v * 20);
  let b = 42 + (u * 20 + v * 20);
  let a = 255;

  if (!isMaskable) {
    // Squircle shape with radius ~100
    const distSquircle = sdRoundedRect(px, py, 24, 24, 464, 464, 110);
    if (distSquircle > 0) {
      // Outside icon
      return [0, 0, 0, 0];
    }
    // Border glow
    if (distSquircle > -6 && distSquircle <= 0) {
      return [255, 207, 0, 180]; // Gold border accent
    }
  }

  // Golden Ring / Horizon (center 256, 256, radius 170)
  const distFromCenter = Math.hypot(px - 256, py - 256);
  if (Math.abs(distFromCenter - 170) < 3.5) {
    // Dashed effect: angle
    const angle = Math.atan2(py - 256, px - 256);
    if (Math.sin(angle * 12) > -0.2) {
      return [255, 207, 0, 120];
    }
  }

  // Golden 'F' Vertical Spine: rect from x: 152 to 216, y: 136 to 376
  const spineDist = sdRoundedRect(px, py, 152, 136, 64, 240, 12);
  if (spineDist <= 0) {
    const goldT = (py - 136) / 240;
    // Gradient: #FFF385 (top) -> #FFCF00 -> #F59E0B (bottom)
    const gr = 255;
    const gg = Math.round(243 - goldT * 85);
    const gb = Math.round(133 - goldT * 122);
    return [gr, gg, gb, 255];
  }

  // Top Bar of 'F' with Chevron slope:
  // Starts at x: 216, y: 144, goes to ~344, y: 144 to 216
  const inTopBar = (
    px >= 216 && px <= 344 &&
    py >= 144 && py <= 216 &&
    (px <= 324 || (px - 324) * 1.5 + (py - 144) <= 72)
  );
  if (inTopBar) {
    return [255, 207, 0, 255];
  }

  // Middle Bar of 'F':
  // Starts at x: 216, y: 252, goes to ~296, y: 252 to 308
  const inMidBar = (
    px >= 216 && px <= 296 &&
    py >= 252 && py <= 308 &&
    (px <= 280 || (px - 280) * 1.4 + (py - 252) <= 56)
  );
  if (inMidBar) {
    return [245, 158, 11, 245];
  }

  // Emerald Diamond Node at (384, 256), size 40
  const dxDiamond = Math.abs(px - 384);
  const dyDiamond = Math.abs(py - 256);
  if (dxDiamond + dyDiamond <= 26) {
    return [52, 211, 153, 255]; // #34D399
  }

  // Gold Sparkle Node at (384, 180), radius 16
  const distGoldDot = Math.hypot(px - 384, py - 180);
  if (distGoldDot <= 16) {
    return [255, 207, 0, 255];
  }

  // Small Emerald Accent at (256, 384), radius 9
  const distEmeraldDot = Math.hypot(px - 256, py - 384);
  if (distEmeraldDot <= 9) {
    return [52, 211, 153, 230];
  }

  return [r, g, b, a];
}

console.log('Generating PWA and Mobile App Icons...');

const publicDir = path.resolve(process.cwd(), 'public');

// 1. pwa-192x192.png
const png192 = createPng(192, 192, (u, v) => renderFinoIcon(u, v, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('✓ Created public/pwa-192x192.png');

// 2. pwa-512x512.png
const png512 = createPng(512, 512, (u, v) => renderFinoIcon(u, v, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('✓ Created public/pwa-512x512.png');

// 3. apple-touch-icon.png (180x180 for iOS Safari)
const appleIcon = createPng(180, 180, (u, v) => renderFinoIcon(u, v, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('✓ Created public/apple-touch-icon.png');

// 4. pwa-maskable-512x512.png (full-bleed background with safe zone)
const maskable512 = createPng(512, 512, (u, v) => {
  // Scale down coords into central 80% safe zone
  const safeU = (u - 0.5) * 1.25 + 0.5;
  const safeV = (v - 0.5) * 1.25 + 0.5;
  if (safeU >= 0 && safeU <= 1 && safeV >= 0 && safeV <= 1) {
    return renderFinoIcon(safeU, safeV, true);
  }
  // Outer margin
  return [15, 23, 42, 255];
});
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskable512);
console.log('✓ Created public/pwa-maskable-512x512.png');

// 5. favicon-32x32.png
const fav32 = createPng(32, 32, (u, v) => renderFinoIcon(u, v, false));
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), fav32);
console.log('✓ Created public/favicon-32x32.png');

console.log('All PWA and Mobile app icons generated successfully!');
