import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";

const ALLOWED_FILES: Record<string, string> = {
  "alekhancorner2.svg": "image/svg+xml",
  "akehan3.svg": "image/svg+xml",
  "logo.png": "image/png",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const contentType = ALLOWED_FILES[file];

  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  const absolutePath = path.resolve(process.cwd(), "..", "indianFestival", file);

  try {
    const data = await fs.readFile(absolutePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
