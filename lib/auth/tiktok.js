import { createHash, randomBytes } from "crypto";

const AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_URL = "https://open.tiktokapis.com/v2/user/info/";

export function getTikTokConfig() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    redirectUri: process.env.TIKTOK_REDIRECT_URI || "",
  };
}

export function hasTikTokConfig() {
  const cfg = getTikTokConfig();
  return Boolean(cfg.clientKey && cfg.clientSecret && cfg.redirectUri);
}

export function generatePkcePair() {
  const codeVerifier = randomBytes(48).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function buildAuthUrl(state, codeChallenge) {
  const cfg = getTikTokConfig();
  const params = new URLSearchParams({
    client_key: cfg.clientKey,
    scope: "user.info.basic",
    response_type: "code",
    redirect_uri: cfg.redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForToken(code, codeVerifier) {
  const cfg = getTikTokConfig();
  const body = new URLSearchParams({
    client_key: cfg.clientKey,
    client_secret: cfg.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TikTok token request failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function fetchTikTokProfile(accessToken) {
  const params = new URLSearchParams({
    fields: "open_id,display_name,username,avatar_url",
  });

  const res = await fetch(`${USER_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TikTok user request failed: ${res.status} ${text}`);
  }

  return res.json();
}

export function encodeProfileCookie(profile) {
  return Buffer.from(JSON.stringify(profile), "utf8").toString("base64url");
}

export function decodeProfileCookie(value) {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
