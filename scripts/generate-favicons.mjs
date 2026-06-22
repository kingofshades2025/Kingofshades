import sharp from "sharp";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(root, "assets");
const source = path.join(assetsDir, "favicon-source.png");

const appDir = path.join(root, "app");
const publicDir = path.join(root, "public");

// ~20% corner radius — matches rounded app-icon style (Logo uses rounded-xl)
const CORNER_RADIUS_RATIO = 0.2;

function roundedMask(size) {
  const radius = Math.round(size * CORNER_RADIUS_RATIO);
  return Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`,
  );
}

async function roundedIcon(input, size) {
  return sharp(input)
    .resize(size, size, { fit: "cover" })
    .ensureAlpha()
    .composite([{ input: roundedMask(size), blend: "dest-in" }])
    .png()
    .toBuffer();
}

await mkdir(assetsDir, { recursive: true });
await mkdir(appDir, { recursive: true });
await mkdir(publicDir, { recursive: true });

// Preserve square source once; reuse on subsequent runs
try {
  await sharp(source).metadata();
} catch {
  await copyFile(path.join(appDir, "icon.png"), source);
}

const icon512 = await roundedIcon(source, 512);
const icon180 = await roundedIcon(source, 180);

await sharp(icon512).toFile(path.join(appDir, "icon.png"));
await sharp(icon512).toFile(path.join(publicDir, "icon.png"));
await sharp(icon180).toFile(path.join(appDir, "apple-icon.png"));
await sharp(icon180).toFile(path.join(publicDir, "apple-icon.png"));

const icoSizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  icoSizes.map((size) => roundedIcon(source, size)),
);

// Minimal ICO: header + directory + PNG payloads (modern browsers accept PNG-in-ICO)
const headerSize = 6;
const dirEntrySize = 16;
const offset = headerSize + dirEntrySize * icoSizes.length;
let dataOffset = offset;
const entries = [];

for (let i = 0; i < icoSizes.length; i++) {
  const size = icoSizes[i];
  const buf = pngBuffers[i];
  entries.push({ size, buf, offset: dataOffset });
  dataOffset += buf.length;
}

const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);

const directory = Buffer.alloc(dirEntrySize * icoSizes.length);
entries.forEach((entry, i) => {
  const pos = i * dirEntrySize;
  directory.writeUInt8(entry.size === 256 ? 0 : entry.size, pos);
  directory.writeUInt8(entry.size === 256 ? 0 : entry.size, pos + 1);
  directory.writeUInt8(0, pos + 2);
  directory.writeUInt8(0, pos + 3);
  directory.writeUInt16LE(1, pos + 4);
  directory.writeUInt16LE(32, pos + 6);
  directory.writeUInt32LE(entry.buf.length, pos + 8);
  directory.writeUInt32LE(entry.offset, pos + 12);
});

const ico = Buffer.concat([
  header,
  directory,
  ...entries.map((e) => e.buf),
]);

await writeFile(path.join(publicDir, "favicon.ico"), ico);
console.log(
  "Created rounded app/icon.png, app/apple-icon.png, public/favicon.ico (+ public PNG copies)",
);
