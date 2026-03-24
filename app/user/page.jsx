"use client";

import { useEffect, useState } from "react";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [ownedMahbers, setOwnedMahbers] = useState([]);
  const [message, setMessage] = useState("");
  const [busySlug, setBusySlug] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [meRes, mineRes] = await Promise.all([
          fetch("/api/auth/tiktok/me", { cache: "no-store" }),
          fetch("/api/mahbers?owner=me&limit=50", { cache: "no-store" }),
        ]);
        const meData = await meRes.json();
        const mineData = await mineRes.json();
        setUser(meData.user || null);
        setOwnedMahbers(Array.isArray(mineData.items) ? mineData.items : []);
      } catch {
        setUser(null);
        setOwnedMahbers([]);
      }
    }

    load();
  }, []);

  async function requestVerification(slug) {
    setBusySlug(slug);
    setMessage("");
    try {
      const res = await fetch("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_verify", slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to apply for verification");
        return;
      }
      setOwnedMahbers((prev) =>
        prev.map((m) =>
          m.slug === slug
            ? { ...m, verifyRequested: true, verifyRequestedAt: new Date().toISOString() }
            : m
        )
      );
      setMessage(data?.alreadyVerified ? "Already verified" : "Verification request submitted");
    } catch {
      setMessage("Failed to apply for verification");
    } finally {
      setBusySlug("");
    }
  }

  return (
    <main style={{ padding: 24, color: "#eaf0ff", background: "#07070A", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 10, fontSize: 34, letterSpacing: 1 }}>Account</h1>
        <p style={{ color: "#9aa5bf", marginBottom: 20 }}>
          Apply for verification on your mahbers. Super admin can approve requests.
        </p>

        <div style={{ border: "1px solid #23344f", borderRadius: 16, padding: 18, background: "#0e1626", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <img
            src={user?.picture || "https://placehold.co/96x96?text=User"}
            alt="Profile"
            width={88}
            height={88}
            style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #2f4465" }}
          />
          <div>
              <div style={{ fontSize: 12, color: "#9aa5bf" }}>Profile photo</div>
              <div style={{ fontSize: 13, color: "#d5def0", marginTop: 4 }}>Connected from TikTok</div>
            </div>
          </div>

          <label style={labelStyle}>Name</label>
          <input style={inputStyle} value={user?.name || "Guest"} disabled />

          <label style={labelStyle}>Username</label>
          <input style={inputStyle} value={user?.username ? `@${user.username}` : "not-connected"} disabled />
        </div>

        <div style={{ border: "1px solid #23344f", borderRadius: 16, padding: 18, background: "#0e1626" }}>
          <h2 style={{ marginBottom: 12, fontSize: 20 }}>My Mahbers</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {ownedMahbers.length === 0 ? (
              <div style={{ color: "#9aa5bf" }}>No mahbers created yet.</div>
            ) : (
              ownedMahbers.map((m) => (
                <div
                  key={m.id || m.slug}
                  style={{
                    border: "1px solid #2f4465",
                    borderRadius: 12,
                    padding: 12,
                    background: "#0b1220",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{m.emoji || "🔥"}</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                      {m.verified ? <span style={{ color: "#2ea6ff", fontWeight: 900 }}>✓</span> : null}
                    </div>
                    <div style={{ color: "#9aa5bf", fontSize: 12 }}>
                      {m.verified ? "Verified" : m.verifyRequested ? "Verification pending" : "Not verified"}
                    </div>
                  </div>
                  <button
                    disabled={Boolean(busySlug) || m.verified || m.verifyRequested}
                    onClick={() => requestVerification(m.slug)}
                    style={{
                      border: "1px solid #2384d6",
                      background: m.verified || m.verifyRequested ? "#10233b" : "#1c7dd1",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontWeight: 800,
                      cursor: m.verified || m.verifyRequested ? "not-allowed" : "pointer",
                    }}
                  >
                    {m.verified ? "Verified" : m.verifyRequested ? "Pending" : busySlug === m.slug ? "Applying..." : "Apply"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {message ? <p style={{ marginTop: 12, color: "#9aa5bf" }}>{message}</p> : null}
      </div>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginTop: 10,
  marginBottom: 6,
  color: "#9aa5bf",
  fontSize: 12,
};

const inputStyle = {
  width: "100%",
  border: "1px solid #2f4465",
  background: "#0b1220",
  color: "#eaf0ff",
  borderRadius: 10,
  padding: "10px 12px",
  opacity: 0.9,
};
