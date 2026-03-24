"use client";

import { useEffect, useState } from "react";

export default function TikTokDemoPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch("/api/auth/tiktok/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProfile(d.user || null))
      .catch(() => setProfile(null));
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 0%, rgba(255,0,80,0.22), transparent 40%), #06070b",
        color: "#f4f7ff",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontSize: 34, marginBottom: 8 }}>TikTok Login Kit Demo</h1>
        <p style={{ color: "#a6b2ca", marginBottom: 20 }}>
          Use this page in your demo. It supports real TikTok OAuth and demo fallback mode.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <a
            href="/api/auth/tiktok/login"
            style={{
              background: "linear-gradient(135deg,#FF0050,#00F2EA)",
              color: "#000",
              fontWeight: 800,
              borderRadius: 12,
              padding: "10px 14px",
              textDecoration: "none",
            }}
          >
            Continue with TikTok
          </a>
          <form action="/api/auth/tiktok/logout" method="post">
            <button
              type="submit"
              style={{
                border: "1px solid #2a3550",
                background: "#101626",
                color: "#d9e3f8",
                borderRadius: 12,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </form>
        </div>

        <section style={{ border: "1px solid #273553", borderRadius: 16, padding: 18, background: "#0d1322" }}>
          <h2 style={{ marginBottom: 12 }}>Fetched Profile</h2>
          {profile ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                src={profile.picture || "https://placehold.co/96x96/png?text=TT"}
                alt="TikTok profile"
                width={64}
                height={64}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <div style={{ fontWeight: 800 }}>{profile.name || "TikTok User"}</div>
                <div style={{ color: "#93a4c3" }}>@{profile.username || "unknown"}</div>
                <div style={{ color: "#93a4c3", fontSize: 13 }}>openId: {profile.openId || "n/a"}</div>
                {profile.mode === "demo" ? <div style={{ color: "#ffd166", fontSize: 12 }}>Demo mode</div> : null}
              </div>
            </div>
          ) : (
            <p style={{ color: "#93a4c3" }}>No logged-in profile yet.</p>
          )}
        </section>

        <section style={{ marginTop: 18, color: "#93a4c3", fontSize: 14, lineHeight: 1.7 }}>
          <h3 style={{ color: "#dbe6ff", marginBottom: 8 }}>Environment Variables for Real OAuth</h3>
          <div>TIKTOK_CLIENT_KEY</div>
          <div>TIKTOK_CLIENT_SECRET</div>
          <div>TIKTOK_REDIRECT_URI = https://your-domain.com/api/auth/tiktok/callback</div>
        </section>
      </div>
    </main>
  );
}
