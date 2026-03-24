"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const msg = useMemo(() => {
    const auth = params.get("auth");
    if (auth === "google_not_configured") return "Google login is not configured yet.";
    if (auth === "tiktok_not_configured") return "TikTok login is not configured yet.";
    return "";
  }, [params]);

  return (
    <main style={{ minHeight: "100vh", background: "#07070A", color: "#eaf0ff", padding: 24 }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ marginBottom: 6 }}>Login</h1>
        <p style={{ color: "#9aa5bf" }}>Continue with TikTok or Google.</p>

        <section style={boxStyle}>
          <a href="/api/auth/tiktok/login" style={{ ...btnStyle, textDecoration: "none", textAlign: "center", background: "#FE2C55", borderColor: "#FE2C55" }}>
            Continue with TikTok
          </a>
          <a href="/api/auth/google/login" style={{ ...btnStyle, textDecoration: "none", textAlign: "center", background: "#4285F4", borderColor: "#4285F4" }}>
            Continue with Google
          </a>
        </section>

        {msg ? <div style={{ color: "#ffd166", fontSize: 13 }}>{msg}</div> : null}
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
