const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIco(pngBuffers, sizes) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let currentOffset = headerSize + numImages * dirEntrySize;
  const dirEntries = [];

  for (let i = 0; i < numImages; i++) {
    const buf = pngBuffers[i];
    const size = sizes[i];
    const width = size >= 256 ? 0 : size;
    const height = size >= 256 ? 0 : size;

    const entry = Buffer.alloc(16);
    entry.writeUInt8(width, 0);
    entry.writeUInt8(height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buf.length, 8); // image size
    entry.writeUInt32LE(currentOffset, 12); // offset

    dirEntries.push(entry);
    currentOffset += buf.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(numImages, 4); // count

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function generateFavicons() {
  const inputPath = path.join(__dirname, '../public/sheybi head.png');
  const appDir = path.join(__dirname, '../app');
  const publicDir = path.join(__dirname, '../public');

  console.log('Processing input image:', inputPath);

  // 1. Generate ICO file containing 16x16, 32x32, 48x48
  const icoSizes = [16, 32, 48];
  const icoBuffers = [];
  for (const size of icoSizes) {
    const buf = await sharp(inputPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    icoBuffers.push(buf);
  }

  const icoBuffer = await createIco(icoBuffers, icoSizes);

  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico (in app/ and public/)');

  // 2. Generate Next.app icon.png (32x32)
  await sharp(inputPath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(appDir, 'icon.png'));
  console.log('Generated app/icon.png');

  // 3. Generate Next.app apple-icon.png (180x180)
  await sharp(inputPath)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));
  console.log('Generated app/apple-icon.png');

  // 4. Generate public/apple-touch-icon.png (180x180)
  await sharp(inputPath)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png');

  // 5. Generate web manifest icons (192x192 & 512x512)
  await sharp(inputPath)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  
  await sharp(inputPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Generated public/icon-192.png and public/icon-512.png');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
