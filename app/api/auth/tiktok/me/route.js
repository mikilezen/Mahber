import { NextResponse } from "next/server";
import { decodeProfileCookie } from "@/lib/auth/tiktok";

export async function GET(request) {
  const encoded = request.cookies.get("tiktok_profile")?.value;

  if (!encoded) {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const user = decodeProfileCookie(encoded);
  return NextResponse.json({ user: user || null }, { headers: { "Cache-Control": "no-store" } });
}
