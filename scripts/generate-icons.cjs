const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 1. Generate icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)"/>

  <g filter="url(#dropShadow)">
    <!-- House Roof -->
    <path d="M256 100 L110 230 L150 230 L150 370 C150 385 162 396 178 396 L334 396 C350 396 362 385 362 370 L362 230 L402 230 Z" fill="#ffffff"/>

    <!-- Shelter Entrance / Arch -->
    <path d="M220 396 L220 300 C220 280 236 264 256 264 C276 264 292 280 292 300 L292 396 Z" fill="#047857"/>

    <!-- Heart / Paw Print inside the house -->
    <!-- Main pad -->
    <ellipse cx="256" cy="205" rx="34" ry="26" fill="#f59e0b"/>
    <!-- 4 Toe pads -->
    <ellipse cx="222" cy="165" rx="13" ry="17" transform="rotate(-20 222 165)" fill="#f59e0b"/>
    <ellipse cx="245" cy="150" rx="12" ry="18" fill="#f59e0b"/>
    <ellipse cx="267" cy="150" rx="12" ry="18" fill="#f59e0b"/>
    <ellipse cx="290" cy="165" rx="13" ry="17" transform="rotate(20 290 165)" fill="#f59e0b"/>
  </g>

  <!-- Subtitle Tag -->
  <rect x="136" y="420" width="240" height="42" rx="21" fill="#ffffff" fill-opacity="0.95"/>
  <text x="256" y="447" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#047857" text-anchor="middle" letter-spacing="1">PADRINHOS</text>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
console.log('Created public/icon.svg');

// PNG Generation
function makeCrcTable() {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}
const crcTable = makeCrcTable();
function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePng(width, height, drawPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdr);

  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawScanlines[pos++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawScanlines[pos++] = r;
      rawScanlines[pos++] = g;
      rawScanlines[pos++] = b;
      rawScanlines[pos++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Distance helper for shapes
function inCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return (dx * dx + dy * dy) <= (r * r);
}

function inEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return (dx * dx + dy * dy) <= 1;
}

function renderPadrinhosIcon(size, isMaskable) {
  return generatePng(size, size, (px, py, w, h) => {
    // Normalization to [0, 1]
    const u = px / w;
    const v = py / h;

    // Background: #059669 -> #047857
    const bgR = Math.round(5 + (4 - 5) * v);
    const bgG = Math.round(150 + (120 - 150) * v);
    const bgB = Math.round(105 + (87 - 105) * v);

    // If maskable, safe zone is 80% (scale = 0.75, offset = 0.125)
    const scale = isMaskable ? 0.72 : 0.88;
    const offset = (1 - scale) / 2;

    const nx = (u - offset) / scale;
    const ny = (v - offset) / scale;

    // Check if inside house bounds
    if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
      // House roof: triangle peak at (0.5, 0.15) to left (0.18, 0.44), right (0.82, 0.44)
      let inRoof = false;
      if (ny >= 0.15 && ny <= 0.45) {
        const span = (ny - 0.15) / 0.30; // 0 to 1
        const leftEdge = 0.5 - span * 0.35;
        const rightEdge = 0.5 + span * 0.35;
        if (nx >= leftEdge && nx <= rightEdge) {
          inRoof = true;
        }
      }

      // House body: from 0.28 to 0.72, y from 0.44 to 0.82
      let inBody = false;
      if (nx >= 0.28 && nx <= 0.72 && ny >= 0.44 && ny <= 0.82) {
        inBody = true;
      }

      // Door cutout: x from 0.42 to 0.58, y from 0.60 to 0.82, arched top
      let inDoor = false;
      if (nx >= 0.42 && nx <= 0.58 && ny >= 0.64 && ny <= 0.82) {
        inDoor = true;
      } else if (inEllipse(nx, ny, 0.5, 0.64, 0.08, 0.07) && ny <= 0.64) {
        inDoor = true;
      }

      if (inDoor) {
        // Door is deep emerald cutout
        return [4, 100, 75, 255];
      }

      if (inRoof || inBody) {
        // Check paw print inside house
        // Center pad
        if (inEllipse(nx, ny, 0.5, 0.45, 0.085, 0.065)) {
          return [245, 158, 11, 255]; // amber paw
        }
        // Toes
        if (inEllipse(nx, ny, 0.43, 0.36, 0.035, 0.045)) return [245, 158, 11, 255];
        if (inEllipse(nx, ny, 0.48, 0.33, 0.035, 0.045)) return [245, 158, 11, 255];
        if (inEllipse(nx, ny, 0.52, 0.33, 0.035, 0.045)) return [245, 158, 11, 255];
        if (inEllipse(nx, ny, 0.57, 0.36, 0.035, 0.045)) return [245, 158, 11, 255];

        // White house wall/roof
        return [255, 255, 255, 255];
      }
    }

    return [bgR, bgG, bgB, 255];
  });
}

// Write files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), renderPadrinhosIcon(192, false));
console.log('Created public/pwa-192x192.png');

fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), renderPadrinhosIcon(512, false));
console.log('Created public/pwa-512x512.png');

fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), renderPadrinhosIcon(512, true));
console.log('Created public/pwa-maskable-512x512.png');

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderPadrinhosIcon(180, false));
console.log('Created public/apple-touch-icon.png');

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), renderPadrinhosIcon(64, false));
console.log('Created public/favicon.ico');
