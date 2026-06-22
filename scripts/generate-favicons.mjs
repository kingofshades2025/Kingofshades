import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(
  root,
  "..",
  ".cursor",
  "projects",
  "c-Users-Mac-Downloads-kingofshades",
  "assets",
  "king-of-shades-favicon-base.png"
);

const appDir = path.join(root, "app");
const publicDir = path.join(root, "public");

await mkdir(appDir, { recursive: true });
await mkdir(publicDir, { recursive: true });

const base = sharp(source).resize(512, 512, { fit: "cover" });

await base.clone().png().toFile(path.join(appDir, "icon.png"));
await base
  .clone()
  .resize(180, 180, { fit: "cover" })
  .png()
  .toFile(path.join(appDir, "apple-icon.png"));

const icoSizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(source)
      .resize(size, size, { fit: "cover" })
      .ensureAlpha()
      .png()
      .toBuffer()
  )
);

// Minimal ICO: header + directory + PNG payloads (Windows/modern browsers accept PNG-in-ICO)
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

const faviconPath = path.join(publicDir, "favicon.ico");
await writeFile(faviconPath, ico);
console.log("Created app/icon.png, app/apple-icon.png, public/favicon.ico");
