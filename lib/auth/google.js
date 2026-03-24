const AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USER_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export function getGoogleConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI || "",
  };
}

export function hasGoogleConfig() {
  const cfg = getGoogleConfig();
  return Boolean(cfg.clientId && cfg.clientSecret && cfg.redirectUri);
}

export function buildGoogleAuthUrl(state) {
  const cfg = getGoogleConfig();
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state,
    access_type: "online",
    include_granted_scopes: "true",
    prompt: "select_account",
  });

  return `${AUTH_BASE}?${params.toString()}`;
}

export async function exchangeGoogleCodeForToken(code) {
  const cfg = getGoogleConfig();
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: cfg.redirectUri,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token request failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function fetchGoogleProfile(accessToken) {
  const res = await fetch(USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google user request failed: ${res.status} ${text}`);
  }

  return res.json();
}

export function toSafeUsername(email, name) {
  const base = String(email || name || "google_user").split("@")[0] || "google_user";
  return base.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "google_user";
}
