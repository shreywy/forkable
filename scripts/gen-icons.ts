// One-off: generate PWA icons from an inline SVG fork mark.
// Run: npx tsx scripts/gen-icons.ts

import sharp from "sharp";
import { mkdirSync } from "fs";
import path from "path";

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#F5C518"/>
  <g stroke="#1a1a1a" stroke-width="34" stroke-linecap="round" fill="none">
    <circle cx="176" cy="128" r="40"/>
    <circle cx="336" cy="128" r="40"/>
    <circle cx="256" cy="384" r="40"/>
    <path d="M176 168 v40 a80 80 0 0 0 80 80 a80 80 0 0 0 80 -80 v-40"/>
    <path d="M256 288 v56"/>
  </g>
</svg>`;

async function main() {
  const outDir = path.join(process.cwd(), "public", "icons");
  mkdirSync(outDir, { recursive: true });
  const buf = Buffer.from(SVG);
  await sharp(buf).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
  await sharp(buf).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));
  console.log("icons written to public/icons");
}

void main();
