import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_PATH = path.join(__dirname, '../public/favicon.svg');
const OUT_DIR = path.join(__dirname, '../public/icons');

const BG_COLOR = '#090a0b';
const ACCENT_COLOR = '#4f46e5';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Replace currentColor with ACCENT_COLOR for png rasterization
const svgText = fs.readFileSync(SVG_PATH, 'utf8');
const coloredSvg = svgText.replace(/currentColor/g, ACCENT_COLOR);
const svgBuffer = Buffer.from(coloredSvg);

async function generate() {
  try {
    console.log('Generating icons...');

    // 1. favicon-16x16.png
    await sharp(svgBuffer)
      .resize(16, 16)
      .toFile(path.join(OUT_DIR, 'favicon-16x16.png'));
    console.log('✅ favicon-16x16.png');

    // 2. favicon-32x32.png
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFile(path.join(OUT_DIR, 'favicon-32x32.png'));
    console.log('✅ favicon-32x32.png');

    // 3. apple-touch-icon.png (180x180, solid bg)
    const appleIconBuffer = await sharp(svgBuffer).resize(144, 144).toBuffer();
    await sharp({
      create: { width: 180, height: 180, channels: 4, background: BG_COLOR }
    })
      .composite([{ input: appleIconBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(OUT_DIR, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png');

    // 4. icon-192x192.png (maskable padded)
    const icon192Buffer = await sharp(svgBuffer).resize(150, 150).toBuffer();
    await sharp({
      create: { width: 192, height: 192, channels: 4, background: BG_COLOR }
    })
      .composite([{ input: icon192Buffer, gravity: 'center' }])
      .png()
      .toFile(path.join(OUT_DIR, 'icon-192x192.png'));
    console.log('✅ icon-192x192.png');

    // 5. icon-512x512.png (maskable padded)
    const icon512Buffer = await sharp(svgBuffer).resize(400, 400).toBuffer();
    await sharp({
      create: { width: 512, height: 512, channels: 4, background: BG_COLOR }
    })
      .composite([{ input: icon512Buffer, gravity: 'center' }])
      .png()
      .toFile(path.join(OUT_DIR, 'icon-512x512.png'));
    console.log('✅ icon-512x512.png');

    // 6. og-image.png (1200x630)
    const ogLogoBuffer = await sharp(svgBuffer).resize(300, 300).toBuffer();
    await sharp({
      create: { width: 1200, height: 630, channels: 4, background: BG_COLOR }
    })
      .composite([{ input: ogLogoBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(OUT_DIR, 'og-image.png'));
    console.log('✅ og-image.png');

    console.log('🎉 All icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generate();
