import { createHash, randomBytes } from "crypto";

const AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize";
const PROD_API_BASE = "https://open.tiktokapis.com";
const SANDBOX_API_BASE = "https://open-sandbox.tiktokapis.com";

function isSandboxEnabled() {
  return true;
}

function getApiBase() {
  return isSandboxEnabled() ? SANDBOX_API_BASE : PROD_API_BASE;
}

function getApiBaseCandidates() {
  return [SANDBOX_API_BASE];
}

function getTokenUrls() {
  return getApiBaseCandidates().map((base) => `${base}/v2/oauth/token/`);
}

function getUserUrls() {
  return getApiBaseCandidates().map((base) => `${base}/v2/user/info/`);
}

export function getTikTokConfig() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    redirectUri: process.env.TIKTOK_REDIRECT_URI || "",
    sandbox: isSandboxEnabled(),
  };
}

export function hasTikTokConfig() {
  const cfg = getTikTokConfig();
  return Boolean(cfg.clientKey && cfg.redirectUri);
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

async function requestToken(code, codeVerifier, includeClientSecret, tokenUrl) {
  const cfg = getTikTokConfig();
  const payload = {
    client_key: cfg.clientKey,
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirectUri,
    code_verifier: codeVerifier,
  };

  if (includeClientSecret) {
    payload.client_secret = cfg.clientSecret;
  }

  const body = new URLSearchParams(payload);

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  return res;
}

export async function exchangeCodeForToken(code, codeVerifier) {
  const tokenUrls = getTokenUrls();
  let lastErrorText = "";

  for (const tokenUrl of tokenUrls) {
    const withSecret = await requestToken(code, codeVerifier, true, tokenUrl);
    if (withSecret.ok) {
      return withSecret.json();
    }

    const withPkceOnly = await requestToken(code, codeVerifier, false, tokenUrl);
    if (withPkceOnly.ok) {
      return withPkceOnly.json();
    }

    lastErrorText = await withPkceOnly.text().catch(() => "");
  }

  throw new Error(`TikTok token request failed: ${lastErrorText}`);
}

export async function fetchTikTokProfile(accessToken) {
  const params = new URLSearchParams({
    fields: "open_id,display_name,username,avatar_url",
  });

  let lastErrorText = "";
  for (const userUrl of getUserUrls()) {
    const res = await fetch(`${userUrl}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      return res.json();
    }
    lastErrorText = await res.text().catch(() => "");
  }

  throw new Error(`TikTok user request failed: ${lastErrorText}`);
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
