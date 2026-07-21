import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgBuffer = readFileSync(join(__dirname, '../public/icon.svg'));

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

for (const { size, name } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(__dirname, '../public', name));
  console.log(`✓ ${name}`);
}

const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#DC143C"/>
      <stop offset="1" stop-color="#800020"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(51.2, 51.2) scale(0.8)">
    ${svgBuffer.toString().match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1].replace(/<rect[^/]*\/>/, '')}
  </g>
</svg>`;

await sharp(Buffer.from(maskableSvg))
  .resize(512, 512)
  .png()
  .toFile(join(__dirname, '../public/pwa-maskable-512x512.png'));
console.log('✓ pwa-maskable-512x512.png');

console.log('Готово! Иконки в public/');