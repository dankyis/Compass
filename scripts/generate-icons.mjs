// Generates the PWA icon PNGs from scratch (no image libraries required).
// Design: brand-green field with a white compass needle.

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "public", "icons");

const GREEN = [11, 107, 58, 255];
const WHITE = [255, 255, 255, 255];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function encodePng(size, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  const stride = size * 4;
  const raw = Buffer.alloc(size * (stride + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function drawIcon(size, needleRatio, maskable) {
  const pixels = Buffer.alloc(size * size * 4);
  const centre = (size - 1) / 2;
  const needle = size * needleRatio;
  // Maskable icons keep artwork inside the safe zone and bleed the field.
  const cornerRadius = maskable ? 0 : size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      let colour = GREEN;

      if (cornerRadius > 0) {
        const dx = Math.abs(x - centre);
        const dy = Math.abs(y - centre);
        const limit = centre - cornerRadius;
        if (dx > limit && dy > limit) {
          const cornerX = dx - limit;
          const cornerY = dy - limit;
          if (cornerX * cornerX + cornerY * cornerY > cornerRadius * cornerRadius) {
            continue; // transparent rounded corner
          }
        }
      }

      const diamond = Math.abs(x - centre) + Math.abs(y - centre);
      if (diamond <= needle) {
        colour = WHITE;
      }

      pixels[offset] = colour[0];
      pixels[offset + 1] = colour[1];
      pixels[offset + 2] = colour[2];
      pixels[offset + 3] = colour[3];
    }
  }

  return encodePng(size, pixels);
}

mkdirSync(OUT_DIR, { recursive: true });

const outputs = [
  ["icon-192.png", 192, 0.3, false],
  ["icon-512.png", 512, 0.3, false],
  ["maskable-512.png", 512, 0.22, true],
];

for (const [name, size, needleRatio, maskable] of outputs) {
  const png = drawIcon(size, needleRatio, maskable);
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`wrote ${name} (${png.length} bytes)`);
}
