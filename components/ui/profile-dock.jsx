"use client";

export default function ProfileDock({ profile, onCreate, onProfile, onLogout, onLogin }) {
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
          Login
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <img
            src={profile?.picture || "https://placehold.co/64x64?text=U"}
            alt="Profile"
            width={34}
            height={34}
            style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--txt)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile?.name || "Guest User"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile?.username ? `@${profile.username}` : "Sign in to sync votes"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onProfile} style={btnStyle("var(--s3)", "var(--txt)")}>Profile</button>
          <button onClick={onCreate} style={btnStyle("var(--yellow)", "#000")}>Create</button>
          <button onClick={onLogout} style={btnStyle("var(--s1)", "var(--muted)")}>Logout</button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    border: "1px solid var(--border)",
    background: bg,
    color,
    borderRadius: 9,
    padding: "8px 10px",
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
  };
}
