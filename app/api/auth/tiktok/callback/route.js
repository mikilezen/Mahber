import { NextResponse } from "next/server";
import {
  encodeProfileCookie,
  exchangeCodeForToken,
  fetchTikTokProfile,
  hasTikTokConfig,
} from "@/lib/auth/tiktok";

export async function GET(request) {
  if (!hasTikTokConfig()) {
    return NextResponse.redirect(new URL("/?auth=tiktok_not_configured", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("tiktok_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/?auth=tiktok_state_mismatch", request.url));
  }

  try {
    const tokenPayload = await exchangeCodeForToken(code);
    const accessToken = tokenPayload.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/?auth=tiktok_token_missing", request.url));
    }

    const profileResponse = await fetchTikTokProfile(accessToken);
    const user = profileResponse?.data?.user;

    if (!user) {
      return NextResponse.redirect(new URL("/?auth=tiktok_user_missing", request.url));
    }

    const profile = {
      openId: user.open_id,
      name: user.display_name || "TikTok User",
      username: user.username || "unknown",
      picture: user.avatar_url || "",
    };

    const response = NextResponse.redirect(new URL("/?auth=tiktok_ok", request.url));
    response.cookies.set("tiktok_profile", encodeProfileCookie(profile), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete("tiktok_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?auth=tiktok_failed", request.url));
  }
}
