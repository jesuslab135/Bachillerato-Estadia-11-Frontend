// FB-F-12: genera los iconos instalables de la PWA (placeholder de marca).
// Emblema simple: fondo navy #0b1e40 con círculo azul institucional #1d4ed8.
// Sustituir por el logo real del plantel cuando se disponga de él.
// Uso: node scripts/generar-iconos-pwa.mjs   (escribe public/pwa-192.png y public/pwa-512.png)
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const NAVY = [0x0b, 0x1e, 0x40];
const BRAND = [0x1d, 0x4e, 0xd8];

const tablaCrc = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = tablaCrc[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, datos) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([len, cuerpo, crc]);
}

function png(tam) {
  const cx = tam / 2;
  const cy = tam / 2;
  // Zona segura maskable: el emblema cabe en un círculo de radio 0.33 * tam.
  const radio = tam * 0.33;
  const filas = Buffer.alloc(tam * (1 + tam * 3));
  for (let y = 0; y < tam; y++) {
    const base = y * (1 + tam * 3);
    filas[base] = 0; // filtro None
    for (let x = 0; x < tam; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      const [r, g, b] = d <= radio ? BRAND : NAVY;
      const off = base + 1 + x * 3;
      filas[off] = r;
      filas[off + 1] = g;
      filas[off + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tam, 0);
  ihdr.writeUInt32BE(tam, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(filas)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(raiz, 'public'), { recursive: true });
for (const tam of [192, 512]) {
  writeFileSync(join(raiz, 'public', `pwa-${tam}.png`), png(tam));
  console.log(`public/pwa-${tam}.png generado`);
}
