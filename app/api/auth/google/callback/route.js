import { NextResponse } from "next/server";
import {
  exchangeGoogleCodeForToken,
  fetchGoogleProfile,
  hasGoogleConfig,
  toSafeUsername,
} from "@/lib/auth/google";
import { encodeProfileCookie } from "@/lib/auth/tiktok";

export async function GET(request) {
  if (!hasGoogleConfig()) {
    return NextResponse.redirect(new URL("/?auth=google_not_configured", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("google_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/?auth=google_state_mismatch", request.url));
  }

  try {
    const tokenPayload = await exchangeGoogleCodeForToken(code);
    const accessToken = tokenPayload.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/?auth=google_token_missing", request.url));
    }

    const user = await fetchGoogleProfile(accessToken);

    const profile = {
      openId: user.sub,
      name: user.name || "Google User",
      username: toSafeUsername(user.email, user.name),
      picture: user.picture || "",
      provider: "google",
    };

    const response = NextResponse.redirect(new URL("/?auth=google_ok", request.url));
    response.cookies.set("tiktok_profile", encodeProfileCookie(profile), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete("google_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?auth=google_failed", request.url));
  }
}
