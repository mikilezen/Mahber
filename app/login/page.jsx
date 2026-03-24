"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const [providers, setProviders] = useState({ tiktok: true, google: false });
  const msg = useMemo(() => {
    const auth = params.get("auth");
    if (auth === "google_not_configured") return "Google login is not configured yet.";
    if (auth === "tiktok_not_configured") return "TikTok login is not configured yet.";
    return "";
  }, [params]);

  useEffect(() => {
    async function loadProviderStatus() {
      try {
        const res = await fetch("/api/auth/providers/status", { cache: "no-store" });
        const data = await res.json();
        setProviders({
          tiktok: Boolean(data?.tiktok),
          google: Boolean(data?.google),
        });
      } catch {
        setProviders({ tiktok: true, google: false });
      }
    }
    loadProviderStatus();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#07070A", color: "#eaf0ff", padding: 24 }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ marginBottom: 6 }}>Login</h1>
        <p style={{ color: "#9aa5bf" }}>Continue with TikTok or Google.</p>

        <section style={boxStyle}>
          <a
            href="/api/auth/tiktok/login"
            style={{
              ...btnStyle,
              textDecoration: "none",
              textAlign: "center",
              background: "#FE2C55",
              borderColor: "#FE2C55",
              opacity: providers.tiktok ? 1 : 0.5,
              pointerEvents: providers.tiktok ? "auto" : "none",
            }}
          >
            Continue with TikTok
          </a>
          {providers.google ? (
            <a href="/api/auth/google/login" style={{ ...btnStyle, textDecoration: "none", textAlign: "center", background: "#4285F4", borderColor: "#4285F4" }}>
              Continue with Google
            </a>
          ) : (
            <div style={{ ...btnStyle, textAlign: "center", background: "#26354d", borderColor: "#2e4667", cursor: "not-allowed", opacity: 0.75 }}>
              Google not configured
            </div>
          )}
        </section>

        {msg ? <div style={{ color: "#ffd166", fontSize: 13 }}>{msg}</div> : null}
        {!providers.google ? (
          <div style={{ color: "#9aa5bf", fontSize: 12 }}>
            Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `.env.local` to enable Google login.
          </div>
        ) : null}
      </div>
    </main>
  );
}

const boxStyle = {
  border: "1px solid #23344f",
  borderRadius: 14,
  padding: 14,
  background: "#0e1626",
  display: "grid",
  gap: 10,
};

const btnStyle = {
  border: "1px solid #FE2C55",
  background: "#FE2C55",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 800,
  cursor: "pointer",
};
