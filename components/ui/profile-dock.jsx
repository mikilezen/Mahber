"use client";

export default function ProfileDock({ profile, onCreate, onProfile, onLogin }) {
  if (!profile) {
    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          padding: "10px 14px",
          background: "color-mix(in srgb, var(--s2) 88%, transparent)",
          borderTop: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={onLogin}
          style={{
            width: "100%",
            border: "1px solid #FE2C55",
            borderRadius: 12,
            padding: "12px 14px",
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: 0.2,
            cursor: "pointer",
            color: "#fff",
            background: "#FE2C55",
            boxShadow: "0 10px 28px rgba(254,44,85,0.36)",
          }}
        >
          T
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        padding: "10px 14px",
        background: "color-mix(in srgb, var(--s2) 88%, transparent)",
        borderTop: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
        <button onClick={onProfile} style={circleBtnStyle("var(--s3)", "var(--txt)")} aria-label="Profile" title="Profile">
          <img
            src={profile?.picture || "https://placehold.co/64x64?text=U"}
            alt="Profile"
            width={26}
            height={26}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        </button>
        <button onClick={onCreate} style={circleBtnStyle("var(--yellow)", "#000")} aria-label="Create" title="Create">+</button>
      </div>
    </div>
  );
}

function circleBtnStyle(bg, color) {
  return {
    border: "1px solid var(--border)",
    background: bg,
    color,
    borderRadius: "50%",
    width: 44,
    height: 44,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 18,
    cursor: "pointer",
  };
}
