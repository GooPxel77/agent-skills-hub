import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');

// Vector definition for Light Scheme (Crisp, High Contrast on White / Light Gray Tabs)
const SVG_LIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>
    <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="40%" stop-color="#7c3aed" />
      <stop offset="75%" stop-color="#6d28d9" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c3aed" />
      <stop offset="35%" stop-color="#e11d48" />
      <stop offset="75%" stop-color="#f59e0b" />
    </linearGradient>
    <radialGradient id="amberCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="30%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </radialGradient>
  </defs>

  <!-- 100% Transparent background -->
  <path d="M 24 82 L 38 102 L 61 102 L 74 82 L 61 64 L 38 64 L 24 46 L 38 26 L 61 26"
    stroke="url(#sGrad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 61 26 L 74 46 C 79 51, 84 42, 93 42" stroke="#7c3aed" stroke-width="6" stroke-linecap="round" fill="none" />
  <rect x="93" y="35" width="14" height="14" rx="3.5" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.2" />
  <path d="M 74 82 C 79 82, 84 88, 93 88" stroke="#7c3aed" stroke-width="6" stroke-linecap="round" fill="none" />
  <rect x="93" y="81" width="14" height="14" rx="3.5" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.2" />
  <line x1="61" y1="64" x2="89" y2="64" stroke="url(#warmGrad)" stroke-width="6.5" stroke-linecap="round" />
  <circle cx="100" cy="64" r="10" stroke="#d97706" stroke-width="3.5" fill="#fffbeb" />
  <circle cx="100" cy="64" r="5" fill="url(#amberCore)" />
</svg>`;

// Vector definition for Dark Scheme (Vibrant Neon Glow on Dark Tabs & App Tiles)
const SVG_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>
    <linearGradient id="sGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="40%" stop-color="#a855f7" />
      <stop offset="75%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
    <linearGradient id="warmGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="35%" stop-color="#fb7185" />
      <stop offset="75%" stop-color="#fbbf24" />
    </linearGradient>
    <radialGradient id="amberCoreDark" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="30%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ea580c" />
    </radialGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Ambient Glow -->
  <g opacity="0.6" filter="url(#neonGlow)">
    <path d="M 24 82 L 38 102 L 61 102 L 74 82 L 61 64 L 38 64 L 24 46 L 38 26 L 61 26"
      stroke="url(#sGradDark)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Main Tube -->
  <path d="M 24 82 L 38 102 L 61 102 L 74 82 L 61 64 L 38 64 L 24 46 L 38 26 L 61 26"
    stroke="url(#sGradDark)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 61 26 L 74 46 C 79 51, 84 42, 93 42" stroke="#c084fc" stroke-width="6" stroke-linecap="round" fill="none" />
  <rect x="93" y="35" width="14" height="14" rx="3.5" fill="#2e1065" stroke="#c084fc" stroke-width="2" />
  <path d="M 74 82 C 79 82, 84 88, 93 88" stroke="#c084fc" stroke-width="6" stroke-linecap="round" fill="none" />
  <rect x="93" y="81" width="14" height="14" rx="3.5" fill="#2e1065" stroke="#c084fc" stroke-width="2" />
  <line x1="61" y1="64" x2="89" y2="64" stroke="url(#warmGradDark)" stroke-width="6.5" stroke-linecap="round" />
  <circle cx="100" cy="64" r="10" stroke="#fbbf24" stroke-width="3.2" fill="#1c1917" />
  <circle cx="100" cy="64" r="5" fill="url(#amberCoreDark)" />
</svg>`;

/**
 * Pure JavaScript ICO Encoder for PNG frames.
 * No Python, No PIL, and no external native dependencies required!
 */
function createIcoFromPngs(pngFrames) {
  const count = pngFrames.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // number of icons

  const entries = [];
  const datas = [];

  for (const { width, height, buffer } of pngFrames) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // color palette (0 for truecolor)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // image size in bytes
    entry.writeUInt32LE(offset, 12); // offset in file

    entries.push(entry);
    datas.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...datas]);
}

async function run() {
  console.log('🚀 Generating transparent & sharp brand icons matrix (Pure Node.js)...');

  const lightBuf = Buffer.from(SVG_LIGHT);
  const darkBuf = Buffer.from(SVG_DARK);

  const targets = [PUBLIC_DIR];
  if (fs.existsSync(DIST_DIR)) {
    targets.push(DIST_DIR);
  }

  for (const dir of targets) {
    fs.mkdirSync(dir, { recursive: true });

    // 1. Transparent PNG Favicons (Light mode: default)
    const p16 = await sharp(lightBuf).resize(16, 16).png().toBuffer();
    const p32 = await sharp(lightBuf).resize(32, 32).png().toBuffer();
    const p48 = await sharp(lightBuf).resize(48, 48).png().toBuffer();

    await sharp(p16).toFile(path.join(dir, 'favicon-16x16.png'));
    await sharp(p32).toFile(path.join(dir, 'favicon-32x32.png'));
    await sharp(p48).toFile(path.join(dir, 'favicon-48x48.png'));

    // 2. Transparent PNG Favicons (Dark mode variant)
    await sharp(darkBuf).resize(16, 16).png().toFile(path.join(dir, 'favicon-dark-16x16.png'));
    await sharp(darkBuf).resize(32, 32).png().toFile(path.join(dir, 'favicon-dark-32x32.png'));

    // 3. Transparent High-res Icons (PWA / Manifest)
    await sharp(darkBuf).resize(192, 192).png().toFile(path.join(dir, 'icon-192x192.png'));
    await sharp(darkBuf).resize(512, 512).png().toFile(path.join(dir, 'icon-512x512.png'));

    // 4. Apple Touch Icon (180x180 px with solid midnight violet gradient & 132x132 logo)
    const logoAti = await sharp(darkBuf).resize(132, 132).png().toBuffer();
    
    // Create 180x180 solid gradient background for iOS
    const atiBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <defs>
        <linearGradient id="atiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#18122f" />
          <stop offset="100%" stop-color="#06050c" />
        </linearGradient>
      </defs>
      <rect width="180" height="180" fill="url(#atiGrad)" />
    </svg>`;
    const atiBg = await sharp(Buffer.from(atiBgSvg)).png().toBuffer();

    await sharp(atiBg)
      .composite([{ input: logoAti, gravity: 'center' }])
      .png()
      .toFile(path.join(dir, 'apple-touch-icon.png'));

    // 5. Generate Multi-resolution Transparent favicon.ico using pure JS
    const icoBuffer = createIcoFromPngs([
      { width: 16, height: 16, buffer: p16 },
      { width: 32, height: 32, buffer: p32 },
      { width: 48, height: 48, buffer: p48 }
    ]);
    fs.writeFileSync(path.join(dir, 'favicon.ico'), icoBuffer);

    console.log(`✅ Icons successfully generated in ${dir}`);
  }

  console.log('🎉 Complete brand icon matrix generated with transparent backgrounds!');
}

run().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
