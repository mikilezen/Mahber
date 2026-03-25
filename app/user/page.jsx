"use client";

import { useEffect, useState } from "react";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [ownedMahbers, setOwnedMahbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [busySlug, setBusySlug] = useState("");
  const [deleteBusySlug, setDeleteBusySlug] = useState("");
  const [theme, setTheme] = useState("dark");
  const [logoutBusy, setLogoutBusy] = useState(false);

  useEffect(() => {
    const next = typeof window !== "undefined" && localStorage.getItem("mahber-theme") === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const [meRes, mineRes] = await Promise.all([
          fetch("/api/auth/tiktok/me", { cache: "no-store", signal: controller.signal }),
          fetch("/api/mahbers?owner=me&limit=50", { cache: "no-store", signal: controller.signal }),
        ]);

        if (!meRes.ok || !mineRes.ok) {
          throw new Error("Failed to load account data");
        }

        const meData = await meRes.json();
        const mineData = await mineRes.json();
        setUser(meData.user || null);
        setOwnedMahbers(Array.isArray(mineData.items) ? mineData.items : []);
      } catch (error) {
        if (error?.name === "AbortError") return;
        setUser(null);
        setOwnedMahbers([]);
        setLoadError("Failed to load account data.");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
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

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mahber-theme", next);
    setMessage(`Theme changed to ${next}`);
  }

  async function handleLogout() {
    setLogoutBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/tiktok/logout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Logout failed");
        return;
      }
      window.location.href = "/login";
    } catch {
      setMessage("Logout failed");
    } finally {
      setLogoutBusy(false);
    }
  }

  async function deleteMahber(slug, name) {
    if (!slug) return;
    const confirmed = window.confirm(`Delete \"${name || "this mahber"}\"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleteBusySlug(slug);
    setMessage("");
    try {
      const res = await fetch("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_owned", slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Failed to delete mahber");
        return;
      }

      setOwnedMahbers((prev) => prev.filter((m) => m.slug !== slug));
      setMessage("Mahber deleted");
    } catch {
      setMessage("Failed to delete mahber");
    } finally {
      setDeleteBusySlug("");
    }
  }

  return (
    <main style={{ padding: 24, color: "var(--theme-text)", background: "var(--theme-bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 10, fontSize: 34, letterSpacing: 1 }}>Account</h1>
        <p style={{ color: "#9aa5bf", marginBottom: 20 }}>
          Apply for verification on your mahbers. Super admin can approve requests.
        </p>

        {loading ? (
          <div style={{ marginBottom: 16, border: "1px solid var(--theme-border)", borderRadius: 16, padding: 18, background: "var(--theme-surface)", color: "var(--theme-muted)" }}>
            Loading account data...
          </div>
        ) : null}

        {loadError ? (
          <div style={{ marginBottom: 16, border: "1px solid #5a2b3a", borderRadius: 16, padding: 18, background: "#21131a", color: "#ffb3c1" }}>
            {loadError}
          </div>
        ) : null}

        <div style={{ border: "1px solid var(--theme-border)", borderRadius: 16, padding: 18, background: "var(--theme-surface)", marginBottom: 16 }}>
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

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => {
                window.location.href = "/#create";
              }}
              style={{
                border: "1px solid #2e9d5b",
                background: "#1f7a45",
                color: "#fff",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              + Create Mahber
            </button>
            <button
              onClick={toggleTheme}
              style={{
                border: "1px solid var(--theme-border-2)",
                background: "var(--theme-surface-2)",
                color: "var(--theme-text)",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Theme: {theme === "dark" ? "Dark" : "Light"}
            </button>
            <button
              disabled={logoutBusy}
              onClick={handleLogout}
              style={{
                border: "1px solid #9b304a",
                background: "#7a1f35",
                color: "#fff",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 800,
                cursor: logoutBusy ? "not-allowed" : "pointer",
                opacity: logoutBusy ? 0.7 : 1,
              }}
            >
              {logoutBusy ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        <div style={{ border: "1px solid var(--theme-border)", borderRadius: 16, padding: 18, background: "var(--theme-surface)" }}>
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
                    background: "var(--theme-surface-2)",
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      disabled={Boolean(busySlug) || Boolean(deleteBusySlug) || m.verified || m.verifyRequested}
                      onClick={() => requestVerification(m.slug)}
                      style={{
                        border: "1px solid #2384d6",
                        background: m.verified || m.verifyRequested ? "#10233b" : "#1c7dd1",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontWeight: 800,
                        cursor: m.verified || m.verifyRequested ? "not-allowed" : "pointer",
                        opacity: deleteBusySlug ? 0.7 : 1,
                      }}
                    >
                      {m.verified ? "Verified" : m.verifyRequested ? "Pending" : busySlug === m.slug ? "Applying..." : "Apply"}
                    </button>
                    <button
                      disabled={Boolean(busySlug) || Boolean(deleteBusySlug)}
                      onClick={() => deleteMahber(m.slug, m.name)}
                      style={{
                        border: "1px solid #9b304a",
                        background: "#7a1f35",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontWeight: 800,
                        cursor: Boolean(busySlug) || Boolean(deleteBusySlug) ? "not-allowed" : "pointer",
                        opacity: Boolean(busySlug) ? 0.7 : 1,
                      }}
                    >
                      {deleteBusySlug === m.slug ? "Deleting..." : "Delete"}
                    </button>
                  </div>
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
  color: "var(--theme-muted)",
  fontSize: 12,
};

const inputStyle = {
  width: "100%",
  border: "1px solid var(--theme-border-2)",
  background: "var(--theme-surface-2)",
  color: "var(--theme-text)",
  borderRadius: 10,
  padding: "10px 12px",
  opacity: 0.9,
};
