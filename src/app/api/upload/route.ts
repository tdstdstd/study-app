import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Validate size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  // Ensure upload dir exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}-${Date.now()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/uploads/${fileName}`;
  return NextResponse.json({ url });
}