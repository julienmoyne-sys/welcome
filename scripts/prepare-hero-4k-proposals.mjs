import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDirectory = path.resolve("output/hero-4k-proposals");
await mkdir(outputDirectory, { recursive: true });

const images = [
  [
    "C:/Users/julie/.codex/generated_images/01a0fe2a-4ca4-7ea3-bb14-8c288e8ac1fe/exec-9a2e47fb-49ed-4b6e-8b90-3f0e30505a70.png",
    "hero-1-enhanced-4k.jpg",
  ],
  [
    "C:/Users/julie/.codex/generated_images/01a0fe2a-4ca4-7ea3-bb14-8c288e8ac1fe/exec-bc1e8003-d68b-49c0-a16e-2019d8a53f4a.png",
    "hero-2-enhanced-4k.jpg",
  ],
  [
    "C:/Users/julie/.codex/generated_images/01a0fe2a-4ca4-7ea3-bb14-8c288e8ac1fe/exec-b2264f75-a3c3-4101-8152-2b0793290cf9.png",
    "hero-3-enhanced-4k.jpg",
  ],
  [
    "C:/Users/julie/.codex/generated_images/01a0fe2a-4ca4-7ea3-bb14-8c288e8ac1fe/exec-7f9e5e64-0286-4ee1-b7b9-1ec623aabeec.png",
    "hero-4-enhanced-4k.jpg",
  ],
];

for (const [source, filename] of images) {
  await sharp(source)
    .resize(3840, 2160, { fit: "cover", position: "centre", kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 0.2 })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(path.join(outputDirectory, filename));
}
