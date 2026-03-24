"use client";

export default function TikTokAuthButton({ profile }) {
  if (profile) {
    return (
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "6px 10px",
          fontSize: 12,
          color: "var(--soft)",
          background: "var(--s2)",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <img
          src={profile.picture || "https://placehold.co/48x48/png?text=TT"}
          alt="TikTok profile"
          width={20}
          height={20}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
        <span>{profile.name || "TikTok User"}</span>
        <span style={{ color: "var(--muted)" }}>@{profile.username}</span>
      </div>
    );
  }

  return (
    <a
      href="/login"
      style={{
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        fontWeight: 900,
        color: "#fff",
        background: "#FE2C55",
        border: "1px solid #FE2C55",
        boxShadow: "0 8px 20px rgba(254,44,85,0.36)",
      }}
    >
      Login
    </a>
  );
}
