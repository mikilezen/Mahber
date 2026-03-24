import { NextResponse } from "next/server";
import { hasTikTokConfig } from "@/lib/auth/tiktok";
import { hasGoogleConfig } from "@/lib/auth/google";

export async function GET() {
  return NextResponse.json({
    tiktok: hasTikTokConfig(),
    google: hasGoogleConfig(),
  });
}
