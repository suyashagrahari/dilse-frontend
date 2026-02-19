import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization") || "";

    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Generation failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data.data || data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to server" },
      { status: 500 }
    );
  }
}
