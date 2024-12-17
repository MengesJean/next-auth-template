import { access, mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function saveImageToLocal(
  file: File,
  userId: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Optimize image using sharp
  const optimizedBuffer = await sharp(buffer)
    .resize(800, 800, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Create unique filename
  const fileName = `${userId}-${Date.now()}.jpg`;
  const publicDir = path.join(process.cwd(), "public/uploads");
  const filePath = path.join(publicDir, fileName);

  // Ensure directory exists
  await createUploadsDirIfNeeded();

  // Save the optimized file
  await writeFile(filePath, optimizedBuffer);
  return `/uploads/${fileName}`;
}

async function createUploadsDirIfNeeded() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  try {
    await access(uploadDir);
  } catch {
    await mkdir(uploadDir, { recursive: true });
  }
}
