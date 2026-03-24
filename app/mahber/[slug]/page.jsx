"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

function fmt(n) {
  if (n == null) return "0";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function MahberProfilePage() {
  const params = useParams();
  const [item, setItem] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [pollDraft, setPollDraft] = useState({ question: "", a: "", b: "", c: "", d: "", durationHours: 24 });
  const [busy, setBusy] = useState(false);
  const [actionState, setActionState] = useState({ joined: false, boosted: false });
  const [flashKind, setFlashKind] = useState("");
  const [tick, setTick] = useState(Date.now());
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const pageCacheKey = `mahber-page-cache:${slug}`;

  const isOwner = Boolean(
    item?.ownerUsername &&
      profile?.username &&
      String(item.ownerUsername).toLowerCase() === String(profile.username).toLowerCase()
  );

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setItem(null);
      return () => {};
    }

    let mounted = true;

    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(pageCacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.slug === slug) {
            setItem(parsed);
            setLoading(false);
          }
        } catch {
          // ignore bad cache
        }
      }
    }

    async function run() {
      try {
        const res = await fetch(`/api/mahbers?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (!mounted) return;
        if (res.status === 401) {
          setAuthRequired(true);
          setItem(null);
          return;
        }
        if (!res.ok) {
          setItem(null);
          return;
        }
        const data = await res.json();
        setAuthRequired(false);
        setItem(data.item || null);
        if (typeof window !== "undefined" && data.item) {
          localStorage.setItem(pageCacheKey, JSON.stringify(data.item));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [slug, pageCacheKey]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/tiktok/me", { cache: "no-store" });
        const data = await res.json();
        setProfile(data?.user || null);
      } catch {
        setProfile(null);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    if (!slug || !profile?.username || typeof window === "undefined") return;
    const key = `mahber-actions:${slug}:${profile.username}`;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "{}");
      setActionState({ joined: Boolean(parsed.joined), boosted: Boolean(parsed.boosted) });
    } catch {
      setActionState({ joined: false, boosted: false });
    }
  }, [slug, profile?.username]);

  async function refreshMahber() {
    if (!slug) return;
    const res = await fetch(`/api/mahbers?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setItem(data.item || null);
    if (typeof window !== "undefined" && data.item) {
      localStorage.setItem(pageCacheKey, JSON.stringify(data.item));
    }
  }

  async function handleInteract(kind) {
    if (!item?.slug) return;
    setBusy(true);
    try {
      const res = await fetch("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interact",
          slug: item.slug,
          kind,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "login_required") alert("Login required.");
        else alert(data?.error || "Action failed");
        return;
      }
      if (data?.kind === "join") {
        setActionState((prev) => ({ ...prev, joined: Boolean(data.active) }));
      }
      if (data?.kind === "boost") {
        setActionState((prev) => ({ ...prev, boosted: Boolean(data.active) }));
      }
      setFlashKind(kind);
      setTimeout(() => setFlashKind(""), 420);
      setItem(data.item || item);
      if (typeof window !== "undefined") {
        if (data.item) {
          localStorage.setItem(pageCacheKey, JSON.stringify(data.item));
        }
        if (profile?.username) {
          const key = `mahber-actions:${slug}:${profile.username}`;
          const next = {
            joined: data?.kind === "join" ? Boolean(data.active) : actionState.joined,
            boosted: data?.kind === "boost" ? Boolean(data.active) : actionState.boosted,
          };
          localStorage.setItem(key, JSON.stringify(next));
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function pollRemaining(expiresAt) {
    if (!expiresAt) return "No expiry";
    const left = new Date(expiresAt).getTime() - tick;
    if (left <= 0) return "Ended";
    const h = Math.floor(left / (1000 * 60 * 60));
    const m = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((left % (1000 * 60)) / 1000);
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s left`;
  }

  async function handleCreatePoll() {
    if (!item?.slug) return;
    const q = pollDraft.question.trim();
    const options = [pollDraft.a, pollDraft.b, pollDraft.c, pollDraft.d]
      .map((x) => x.trim())
      .filter(Boolean);
    if (!q || options.length < 2) {
      alert("Add question and at least 2 choices.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_poll",
          slug: item.slug,
          question: q,
          options,
          durationHours: pollDraft.durationHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "failed");
        return;
      }
      setPollDraft({ question: "", a: "", b: "", c: "", d: "", durationHours: 24 });
      setItem(data.item || item);
    } finally {
      setBusy(false);
    }
  }

  async function handleVotePoll(pollId, optionIndex) {
    if (!item?.slug) return;
    setBusy(true);
    try {
      const res = await fetch("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vote_poll",
          slug: item.slug,
          pollId,
          optionIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "already_voted") alert("You already voted on this poll.");
        else if (data?.error === "poll_expired") alert("This poll has ended.");
        else if (data?.error === "login_required") alert("Login required.");
        else alert(data?.error || "Vote failed");
        return;
      }
      await refreshMahber();
    } finally {
      setBusy(false);
    }
  }

  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/mahber/${slug}`;
  }, [slug]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "radial-gradient(circle at 10% 0%, #1f1822 0%, #07070A 50%)", color: "#fff" }}>
        Loading mahber...
      </main>
    );
  }

  if (!item) {
    if (authRequired) {
      return (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "radial-gradient(circle at 10% 0%, #1f1822 0%, #07070A 50%)", color: "#fff", padding: 24, textAlign: "center" }}>
          <div>
            <h1 style={{ marginBottom: 8 }}>Login required</h1>
            <p style={{ color: "#9aa5bf", marginBottom: 14 }}>Please login first to open this mahber page.</p>
            <a href="/login" style={{ color: "#FE2C55", fontWeight: 700 }}>Go to Login</a>
          </div>
        </main>
      );
    }

    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "radial-gradient(circle at 10% 0%, #1f1822 0%, #07070A 50%)", color: "#fff", padding: 24, textAlign: "center" }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Mahber not found</h1>
          <p style={{ color: "#9aa5bf", marginBottom: 14 }}>This card exists in UI but no DB record was found for this slug yet.</p>
          <a href="/" style={{ color: "#FE2C55", fontWeight: 700 }}>Go Home</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 10% 0%, #1f1822 0%, #07070A 40%), radial-gradient(circle at 90% 100%, #0f2b1a 0%, #07070A 38%)", color: "#eaf0ff", padding: 24 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", border: "1px solid #2b2d39", borderRadius: 20, padding: 22, background: "#11131a", boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 42, marginBottom: 6 }}>{item.emoji || "🔥"}</div>
            <h1 style={{ marginBottom: 6, fontSize: 36, letterSpacing: 1 }}>{item.name}</h1>
            <div style={{ color: "#9aa5bf", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span>@{item.creator || "guest"}</span>
              {item.verified ? <span style={{ color: "#2ea6ff", fontWeight: 800 }}>✓ Blue Tick</span> : null}
            </div>
          </div>
          <a href="/" style={{ color: "#9aa5bf", textDecoration: "none" }}>← Back</a>
        </div>

        <p style={{ marginTop: 14, color: "#d0d8eb", lineHeight: 1.7 }}>{item.desc || "No description added yet."}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10, marginTop: 16 }}>
          <Stat label="Members" value={fmt(item.members)} />
          <Stat label="Heat" value={`${fmt(item.heat)} 🔥`} />
          <Stat label="Joins" value={fmt(item.joinCount || 0)} />
          <Stat label="Boosts" value={fmt(item.boostPoints || 0)} />
          <Stat label="Category" value={item.category || "community"} />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button
            disabled={busy}
            onClick={() => handleInteract("join")}
            style={{
              background: actionState.joined ? "#202633" : "#f4c400",
              color: actionState.joined ? "#d6e2ff" : "#111",
              border: actionState.joined ? "1px solid #2e455e" : "1px solid #f4c400",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 800,
              cursor: "pointer",
              transform: flashKind === "join" ? "scale(1.05)" : "scale(1)",
              transition: "transform 140ms ease",
            }}
          >
            {actionState.joined ? "Unjoin Mahber" : "+ Join Mahber"}
          </button>
          <button
            disabled={busy}
            onClick={() => handleInteract("boost")}
            style={{
              background: actionState.boosted ? "#1d2740" : "#078930",
              color: "#fff",
              border: actionState.boosted ? "1px solid #38507e" : "1px solid #078930",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 800,
              cursor: "pointer",
              transform: flashKind === "boost" ? "scale(1.05)" : "scale(1)",
              transition: "transform 140ms ease",
            }}
          >
            {actionState.boosted ? "Unboost" : "⚡ Boost Point"}
          </button>
        </div>

        <div style={{ marginTop: 20, borderTop: "1px solid #22324a", paddingTop: 16 }}>
          <h2 style={{ marginBottom: 10 }}>Polls</h2>
          {Array.isArray(item.polls) && item.polls.length > 0 ? (
            item.polls.map((poll) => {
              const total = (poll.opts || []).reduce((s, o) => s + (o.v || 0), 0);
              const ended = poll.expiresAt ? Date.now() > new Date(poll.expiresAt).getTime() : false;
              return (
                <div key={poll.id} style={{ border: "1px solid #2b3f60", borderRadius: 12, padding: 12, marginBottom: 10, background: "#0b1220" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 800 }}>{poll.q}</div>
                    <div style={{ color: ended ? "#ff7e88" : "#9aa5bf", fontSize: 12 }}>{pollRemaining(poll.expiresAt)}</div>
                  </div>
                  <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                    {(poll.opts || []).map((opt, i) => {
                      const pct = total > 0 ? Math.round(((opt.v || 0) / total) * 100) : 0;
                      return (
                        <button
                          key={`${poll.id}-${i}`}
                          disabled={ended || busy}
                          onClick={() => handleVotePoll(poll.id, i)}
                          style={{
                            textAlign: "left",
                            border: "1px solid #2b3f60",
                            background: "#111a2d",
                            color: "#eaf0ff",
                            borderRadius: 10,
                            padding: "10px 12px",
                            cursor: ended ? "not-allowed" : "pointer",
                            opacity: ended ? 0.65 : 1,
                          }}
                        >
                          <strong>{String.fromCharCode(65 + i)}.</strong> {opt.l} ({fmt(opt.v || 0)}) - {pct}%
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: "#9aa5bf" }}>No poll yet.</div>
          )}

          {isOwner && (
            <div style={{ marginTop: 16, border: "1px solid #2b3f60", borderRadius: 12, padding: 12, background: "#0b1220" }}>
              <h3 style={{ marginBottom: 10 }}>Create Poll</h3>
              <input
                value={pollDraft.question}
                onChange={(e) => setPollDraft((p) => ({ ...p, question: e.target.value }))}
                placeholder="Poll question"
                style={inputStyle}
              />
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <input value={pollDraft.a} onChange={(e) => setPollDraft((p) => ({ ...p, a: e.target.value }))} placeholder="A choice" style={inputStyle} />
                <input value={pollDraft.b} onChange={(e) => setPollDraft((p) => ({ ...p, b: e.target.value }))} placeholder="B choice" style={inputStyle} />
                <input value={pollDraft.c} onChange={(e) => setPollDraft((p) => ({ ...p, c: e.target.value }))} placeholder="C choice (optional)" style={inputStyle} />
                <input value={pollDraft.d} onChange={(e) => setPollDraft((p) => ({ ...p, d: e.target.value }))} placeholder="D choice (optional)" style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <label style={{ fontSize: 12, color: "#9aa5bf" }}>Hours:</label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={pollDraft.durationHours}
                  onChange={(e) => setPollDraft((p) => ({ ...p, durationHours: Number(e.target.value || 24) }))}
                  style={{ ...inputStyle, maxWidth: 100 }}
                />
              </div>
              <button
                disabled={busy}
                onClick={handleCreatePoll}
                style={{
                  marginTop: 10,
                  background: "#078930",
                  color: "#fff",
                  border: "1px solid #078930",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Create Poll
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <a
            href={item.tiktok || "https://tiktok.com"}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#FE2C55",
              color: "#fff",
              border: "1px solid #FE2C55",
              borderRadius: 10,
              padding: "10px 14px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Open TikTok
          </a>
          {item.telegram ? (
            <a
              href={item.telegram}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#1d9bf0",
                color: "#fff",
                border: "1px solid #1d9bf0",
                borderRadius: 10,
                padding: "10px 14px",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Open Telegram
            </a>
          ) : null}
          <button
            onClick={async () => {
              if (!shareLink) return;
              try {
                await navigator.clipboard.writeText(shareLink);
                alert("Link copied");
              } catch {
                alert(shareLink);
              }
            }}
            style={{
              background: "#111a2d",
              color: "#eaf0ff",
              border: "1px solid #2b3f60",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Copy Share Link
          </button>
        </div>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #2b3f60",
  background: "#111a2d",
  color: "#eaf0ff",
  borderRadius: 10,
  padding: "10px 12px",
};

function Stat({ label, value }) {
  return (
    <div style={{ border: "1px solid #2b3f60", background: "#0b1220", borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#9aa5bf", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}
