const sharp = require("sharp");
const pngToIco = require("png-to-ico").default;
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "bull-icon.png");
const OUT_DIR = path.join(__dirname, "..", "public");
const BG = "#0A0A0B";

async function bullBuffer(size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  return sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
}

async function makeIcon(size, filename, padding = 0.18) {
  const bull = await bullBuffer(size, padding);
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: bull, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, filename));
  console.log("wrote", filename, `${size}x${size}`);
}

// Splash-Screen: Bulle zentriert auf App-Hintergrundfarbe, gleiche Optik wie
// theme_color/background_color im Manifest -> nahtloser Übergang beim App-Start.
async function makeSplash(width, height, filename) {
  const bullSize = Math.round(Math.min(width, height) * 0.32);
  const bull = await bullBuffer(bullSize, 0.08);
  await sharp({ create: { width, height, channels: 4, background: BG } })
    .composite([{ input: bull, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, filename));
  console.log("wrote", filename, `${width}x${height}`);
}

const SPLASH_SCREENS = [
  { width: 750, height: 1334, filename: "splash-750x1334.png" }, // iPhone SE/8
  { width: 1170, height: 2532, filename: "splash-1170x2532.png" }, // iPhone 12/13/14
  { width: 1179, height: 2556, filename: "splash-1179x2556.png" }, // iPhone 14/15/16 Pro
  { width: 1284, height: 2778, filename: "splash-1284x2778.png" }, // iPhone 12/13/14 Pro Max
  { width: 1290, height: 2796, filename: "splash-1290x2796.png" }, // iPhone 14/15/16 Pro Max
  { width: 1668, height: 2388, filename: "splash-1668x2388.png" }, // iPad Pro 11"
  { width: 2048, height: 2732, filename: "splash-2048x2732.png" }, // iPad Pro 12.9"
];

async function main() {
  await makeIcon(192, "icon-192.png", 0.16);
  await makeIcon(512, "icon-512.png", 0.16);
  await makeIcon(512, "icon-maskable-512.png", 0.28);
  await makeIcon(180, "apple-touch-icon.png", 0.14);

  await makeIcon(16, "favicon-16.png", 0.1);
  await makeIcon(32, "favicon-32.png", 0.1);
  const icoBuffer = await pngToIco([
    path.join(OUT_DIR, "favicon-16.png"),
    path.join(OUT_DIR, "favicon-32.png"),
  ]);
  fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), icoBuffer);
  console.log("wrote favicon.ico");

  for (const s of SPLASH_SCREENS) {
    await makeSplash(s.width, s.height, s.filename);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
