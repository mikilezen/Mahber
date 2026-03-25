import { NextResponse } from "next/server";
import { buildAuthUrl, generatePkcePair, hasTikTokConfig } from "@/lib/auth/tiktok";

export async function GET(request) {
  if (!hasTikTokConfig()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const state = crypto.randomUUID();
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const response = NextResponse.redirect(buildAuthUrl(state, codeChallenge));
  response.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set("tiktok_oauth_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
