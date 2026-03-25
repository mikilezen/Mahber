import { NextResponse } from "next/server";
import {
  encodeProfileCookie,
  exchangeCodeForToken,
  fetchTikTokProfile,
  hasTikTokConfig,
} from "@/lib/auth/tiktok";

function getCookieDomain() {
  if (process.env.NODE_ENV !== "production") return undefined;
  return process.env.AUTH_COOKIE_DOMAIN || ".mahber.social";
}

export async function GET(request) {
  if (!hasTikTokConfig()) {
    return NextResponse.redirect(new URL("/?auth=tiktok_not_configured", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const upstreamError = url.searchParams.get("error") || url.searchParams.get("error_type");
  const storedState = request.cookies.get("tiktok_oauth_state")?.value;
  const storedVerifier = request.cookies.get("tiktok_oauth_verifier")?.value;

  if (upstreamError) {
    return NextResponse.redirect(new URL(`/?auth=tiktok_upstream_error`, request.url));
  }

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/?auth=tiktok_state_mismatch", request.url));
  }

  if (!storedVerifier) {
    return NextResponse.redirect(new URL("/?auth=tiktok_pkce_missing", request.url));
  }

  try {
    const tokenPayload = await exchangeCodeForToken(code, storedVerifier);
    const accessToken = tokenPayload?.access_token || tokenPayload?.data?.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/?auth=tiktok_token_missing", request.url));
    }

    const profileResponse = await fetchTikTokProfile(accessToken);
    const user = profileResponse?.data?.user || profileResponse?.user || profileResponse?.data;

    if (!user) {
      return NextResponse.redirect(new URL("/?auth=tiktok_user_missing", request.url));
    }

    const profile = {
      openId: user.open_id || user.openId || "",
      name: user.display_name || "TikTok User",
      username: user.username || "unknown",
      picture: user.avatar_url || "",
    };

    const response = NextResponse.redirect(new URL("/?auth=tiktok_ok", request.url));
    response.cookies.set("tiktok_profile", encodeProfileCookie(profile), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      domain: getCookieDomain(),
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set("tiktok_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      domain: getCookieDomain(),
      path: "/",
      maxAge: 0,
    });
    response.cookies.set("tiktok_oauth_verifier", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      domain: getCookieDomain(),
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("TikTok callback failed", error);
    const msg = String(error?.message || "").toLowerCase();
    const reason = msg.includes("token request failed") ? "tiktok_failed_token" : msg.includes("user request failed") ? "tiktok_failed_user" : "tiktok_failed";
    return NextResponse.redirect(new URL(`/?auth=${reason}`, request.url));
  }
}
