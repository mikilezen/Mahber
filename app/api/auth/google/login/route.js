import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, hasGoogleConfig } from "@/lib/auth/google";

export async function GET(request) {
  if (!hasGoogleConfig()) {
    return NextResponse.redirect(new URL("/login?auth=google_not_configured", request.url));
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(state));
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
