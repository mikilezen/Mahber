import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("tiktok_profile");
  response.cookies.delete("tiktok_oauth_state");
  return response;
}
