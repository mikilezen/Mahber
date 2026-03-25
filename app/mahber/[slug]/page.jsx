"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ET_GREEN, ET_RED, ET_YELLOW, FIRE, FONTS } from "@/components/mahber/constants";

function fmt(n) {
  if (n == null) return "0";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box}
:root{--p-bg:#07070A;--p-text:#F0EDE6;--p-shell:#0f1017;--p-shell-top:#13131b;--p-border:rgba(255,255,255,.08);--p-soft:#A6B2CF;--p-desc:#CDD4E9;--p-panel:#0c111a;--p-panel-2:#111827;--p-input:#111a2d;--p-input-border:#2b3f60;--p-btn-ghost:#111a2d;--p-btn-ghost-border:#2b3f60;--p-empty:#B8C2DC;--p-muted:#9AA6C3}
:root[data-theme='light']{--p-bg:#F6F8FD;--p-text:#0F1B33;--p-shell:#FFFFFF;--p-shell-top:#F8FAFF;--p-border:rgba(15,27,51,.12);--p-soft:#4D6288;--p-desc:#2A3E60;--p-panel:#F4F7FF;--p-panel-2:#EFF4FF;--p-input:#FFFFFF;--p-input-border:#C3D1EA;--p-btn-ghost:#FFFFFF;--p-btn-ghost-border:#C3D1EA;--p-empty:#425D86;--p-muted:#5E749C}
.page{min-height:100vh;background:radial-gradient(ellipse 60% 35% at 0% 0%,rgba(218,18,26,.12) 0%,transparent 55%),radial-gradient(ellipse 55% 40% at 100% 100%,rgba(7,137,48,.12) 0%,transparent 55%),var(--p-bg);color:var(--p-text);padding:24px 16px 120px;font-family:'Plus Jakarta Sans',sans-serif}
.top{padding:18px 20px;border-bottom:1px solid var(--p-border);display:flex;align-items:center;justify-content:space-between;gap:10px;background:linear-gradient(90deg,rgba(252,221,9,.08),rgba(255,92,0,.07),rgba(7,137,48,.08))}
.brandWrap{display:flex;align-items:center;gap:10px}
.brandLogo{width:30px;height:30px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(252,221,9,.22))}
.brand{font-family:'Black Han Sans',sans-serif;letter-spacing:2px;font-size:22px;background:linear-gradient(90deg,${ET_YELLOW},${FIRE});-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.back{border:1px solid var(--p-border);padding:8px 12px;border-radius:999px;color:var(--p-text);text-decoration:none;font-size:13px;font-weight:700;background:rgba(255,255,255,.03)}
.body{padding:18px;display:grid;gap:14px}
.hero{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:flex-start}
.emojiOrb{width:86px;height:86px;border-radius:24px;display:grid;place-items:center;font-size:46px;background:linear-gradient(160deg,rgba(252,221,9,.22),rgba(255,92,0,.16));border:1px solid rgba(252,221,9,.28)}
.title{margin:0;font-family:'Black Han Sans',sans-serif;font-size:clamp(26px,5vw,42px);letter-spacing:1px;line-height:1}
.creator{margin-top:8px;display:flex;align-items:center;gap:8px;color:var(--p-soft);font-size:13px;font-weight:600}
.verify{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#2EA6FF;box-shadow:0 0 0 3px rgba(46,166,255,.16)}
.joinedChip{display:inline-flex;align-items:center;gap:6px;height:20px;padding:0 8px;border-radius:999px;background:rgba(7,137,48,.2);border:1px solid rgba(7,137,48,.35);color:#7CFFAE;font-size:11px;font-weight:800;letter-spacing:.4px;text-transform:uppercase}
.desc{margin:0;color:var(--p-desc);line-height:1.7;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
.stat{border-bottom:1px solid var(--p-border);padding:10px 2px 12px;background:transparent}
.statL{font-size:11px;color:var(--p-muted);margin-bottom:5px;letter-spacing:.6px;text-transform:uppercase}
.statV{font-weight:800;color:var(--p-text)}
.actions{display:flex;flex-wrap:wrap;gap:10px}
.btn{border-radius:12px;padding:10px 14px;border:1px solid transparent;cursor:pointer;font-weight:800;font-size:13px;transition:transform .15s ease,filter .15s ease}
.btn:hover{filter:brightness(1.05)}
.btn:active{transform:translateY(1px)}
.btnJoin{background:${ET_YELLOW};color:#111}
.btnJoinOn{background:#1f2635;color:#d7e5ff;border-color:#30486b}
.btnBoost{background:${ET_GREEN};color:#fff}
.btnBoostOn{background:#1f2c3f;color:#d7e5ff;border-color:#38507e}
.section{padding:8px 0}
.h2{margin:0 0 10px;font-size:18px;font-family:'Black Han Sans',sans-serif;letter-spacing:1px}
.poll{border-bottom:1px solid var(--p-border);padding:12px 0;margin-bottom:6px;animation:fadeUp .35s ease both}
.pollTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.pollQ{font-weight:800}
.pollTime{font-size:12px;color:var(--p-muted)}
.pollOpts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
.pollOpt{width:100%;text-align:left;border:1px solid var(--p-input-border);background:var(--p-input);color:var(--p-text);border-radius:10px;padding:10px 12px;cursor:pointer;font-size:13px;line-height:1.5;word-break:break-word;white-space:normal}
.pollOpt:disabled{opacity:.62;cursor:not-allowed}
.pollMeta{margin-top:6px;font-size:11px;color:var(--p-muted)}
.grid{display:grid;gap:8px}
.pollFormGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}
.input{width:100%;border:1px solid var(--p-input-border);background:var(--p-input);color:var(--p-text);border-radius:10px;padding:10px 12px;outline:none}
.input:focus{border-color:${ET_YELLOW}}
.hint{margin-top:8px;color:var(--p-muted);font-size:12px;line-height:1.45}
.emptyPoll{display:flex;align-items:center;gap:10px;padding:10px 0;color:var(--p-empty);font-size:13px}
.emptyPollIcon{font-size:20px;animation:bob 1.8s ease-in-out infinite}
.chip{display:inline-flex;align-items:center;justify-content:center;height:24px;padding:0 10px;border-radius:999px;background:rgba(252,221,9,.14);border:1px solid rgba(252,221,9,.35);color:${ET_YELLOW};font-size:11px;font-weight:800;letter-spacing:.4px;text-transform:uppercase}
.countInline{margin-left:8px;color:var(--p-muted);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700}
.hoursRow{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}
.btnBusy{opacity:.75;cursor:not-allowed}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.links{display:flex;gap:10px;flex-wrap:wrap}
.linkBtn{display:inline-flex;align-items:center;gap:7px;padding:10px 14px;border-radius:10px;font-weight:700;text-decoration:none;border:1px solid transparent;font-size:13px;cursor:pointer}
.tiktok{background:#FE2C55;color:#fff;border-color:#FE2C55}
.telegram{background:#1D9BF0;color:#fff;border-color:#1D9BF0}
.ghost{background:var(--p-btn-ghost);color:var(--p-text);border-color:var(--p-btn-ghost-border)}
.center{min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px;background:#07070A;color:#fff;font-family:'Plus Jakarta Sans',sans-serif}
.msgCard{max-width:420px;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:22px;background:#11131a}
.msgTitle{margin:0 0 8px;font-size:24px;font-family:'Black Han Sans',sans-serif}
.msgText{margin:0 0 14px;color:#9AA5BF;line-height:1.6}
.msgLink{color:${ET_YELLOW};font-weight:700;text-decoration:none}
@media (max-width:900px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){
  .hero{grid-template-columns:1fr}
  .emojiOrb{width:72px;height:72px;font-size:38px}
  .title{font-size:30px}
  .section{padding:8px 0}
  .poll{padding:10px 0}
  .pollOpts{grid-template-columns:1fr}
  .pollFormGrid{grid-template-columns:1fr}
  .pollTop{flex-direction:column;align-items:flex-start}
  .hoursRow{flex-direction:column;align-items:flex-start}
  .countInline{display:block;margin-left:0;margin-top:4px}
}
@media (max-width:480px){
  .stats{grid-template-columns:1fr}
}
`;

export default function MahberProfilePage() {
  const params = useParams();
  const [item, setItem] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [pollDraft, setPollDraft] = useState({ question: "", a: "", b: "", c: "", d: "", durationHours: 24 });
  const [busy, setBusy] = useState(false);
  const [pollError, setPollError] = useState("");
  const [actionState, setActionState] = useState({ joined: false, boosted: false });
  const [tick, setTick] = useState(Date.now());
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const pageCacheKey = `mahber-page-cache:${slug}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("mahber-theme") === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

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
    if (!slug) return;

    let mounted = true;

    async function trackView() {
      try {
        const res = await fetch("/api/mahbers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "track_metric", slug, kind: "view" }),
        });
        if (!res.ok || !mounted) return;
        const data = await res.json().catch(() => ({}));
        if (data?.item && mounted) {
          setItem(data.item);
          if (typeof window !== "undefined") {
            localStorage.setItem(pageCacheKey, JSON.stringify(data.item));
          }
        }
      } catch {
        // best effort metric tracking
      }
    }

    trackView();

    return () => {
      mounted = false;
    };
  }, [slug, pageCacheKey]);

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
    setPollError("");

    const q = pollDraft.question.trim();
    const options = [pollDraft.a, pollDraft.b, pollDraft.c, pollDraft.d].map((x) => x.trim()).filter(Boolean);
    const parsedHours = Number.parseInt(String(pollDraft.durationHours || 24), 10);
    const safeHours = Number.isFinite(parsedHours) ? Math.max(1, Math.min(168, parsedHours)) : 24;

    if (!q || options.length < 2) {
      setPollError("Add a question and at least 2 choices.");
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
          durationHours: safeHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPollError(data?.error || "Failed to create poll.");
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
        body: JSON.stringify({ action: "vote_poll", slug: item.slug, pollId, optionIndex }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "already_voted") setPollError("You already voted on this poll.");
        else if (data?.error === "poll_expired") setPollError("This poll has ended.");
        else if (data?.error === "login_required") setPollError("Login required.");
        else setPollError(data?.error || "Vote failed");
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
      <main className="center">
        <style>{CSS}</style>
        Loading mahber...
      </main>
    );
  }

  if (!item) {
    if (authRequired) {
      return (
        <main className="center">
          <style>{CSS}</style>
          <div className="msgCard">
            <h1 className="msgTitle">Login required</h1>
            <p className="msgText">Please login first to open this mahber page.</p>
            <a href="/login" className="msgLink">Go to Login</a>
          </div>
        </main>
      );
    }

    return (
      <main className="center">
        <style>{CSS}</style>
        <div className="msgCard">
          <h1 className="msgTitle">Mahber not found</h1>
          <p className="msgText">This card exists in UI but no DB record was found for this slug yet.</p>
          <a href="/" className="msgLink">Go Home</a>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <style>{CSS}</style>

      <section className="shell">
        <div className="top">
          <div className="brandWrap">
            <img src="/assets/Group.png" alt="Mahber logo" className="brandLogo" />
            <div className="brand">MAHBER PROFILE</div>
          </div>
          <a href="/" className="back">Back</a>
        </div>

        <div className="body">
          <div className="hero">
            <div className="emojiOrb">{item.emoji || "🔥"}</div>
            <div>
              <h1 className="title">{item.name}</h1>
              <div className="creator">
                <span>@{item.creator || "guest"}</span>
                {item.verified ? (
                  <span className="verify" title="Verified" aria-label="Verified">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9.2 12.8L11.1 14.7L14.9 10.9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : null}
                {actionState.joined ? <span className="joinedChip">Joined</span> : null}
              </div>
              <p className="desc">{item.desc || "No description added yet."}</p>
            </div>
          </div>

          <div className="stats">
            <Stat label="Members" value={fmt(item.members)} />
            <Stat label="Heat" value={`${fmt(item.heat)} 🔥`} />
            <Stat label="Joins" value={fmt(item.joinCount || 0)} />
            <Stat label="Boosts" value={fmt(item.boostPoints || 0)} />
            <Stat label="Shares" value={fmt(item.shareCount || item.copyCount || 0)} />
            <Stat label="Views" value={fmt(item.viewCount || item.views || 0)} />
            <Stat label="Category" value={item.category || "community"} />
          </div>

          <div className="actions">
            <button
              disabled={busy}
              onClick={() => handleInteract("join")}
              className={`btn ${actionState.joined ? "btnJoinOn" : "btnJoin"}`}
            >
              {actionState.joined ? "Unjoin Mahber" : "Join Mahber"}
            </button>
            <button
              disabled={busy}
              onClick={() => handleInteract("boost")}
              className={`btn ${actionState.boosted ? "btnBoostOn" : "btnBoost"}`}
            >
              {actionState.boosted ? "Unboost" : "Boost Point"}
            </button>
          </div>

          <section className="section">
            <h2 className="h2">
              Polls
              <span className="countInline">{Array.isArray(item.polls) ? item.polls.length : 0}</span>
            </h2>

            {Array.isArray(item.polls) && item.polls.length > 0 ? (
              item.polls.map((poll) => {
                const total = (poll.opts || []).reduce((s, o) => s + (o.v || 0), 0);
                const ended = poll.expiresAt ? Date.now() > new Date(poll.expiresAt).getTime() : false;

                return (
                  <div key={poll.id} className="poll">
                    <div className="pollTop">
                      <div className="pollQ">{poll.q}</div>
                      <div className="pollTime" style={{ color: ended ? ET_RED : "var(--p-muted)" }}>{pollRemaining(poll.expiresAt)}</div>
                    </div>

                    <div className="pollOpts">
                      {(poll.opts || []).map((opt, i) => {
                        const pct = total > 0 ? Math.round(((opt.v || 0) / total) * 100) : 0;
                        return (
                          <button
                            key={`${poll.id}-${i}`}
                            disabled={ended || busy}
                            onClick={() => handleVotePoll(poll.id, i)}
                            className="pollOpt"
                          >
                            <strong>{String.fromCharCode(65 + i)}.</strong> {opt.l}
                            <div className="pollMeta">{fmt(opt.v || 0)} votes • {pct}%</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="emptyPoll">
                <span className="emptyPollIcon">🗳</span>
                <span>No poll yet. Create one from your mahber.</span>
              </div>
            )}

            {isOwner ? (
              <div className="poll" style={{ marginTop: 14 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Create Poll</span>
                </h3>

                <input
                  value={pollDraft.question}
                  onChange={(e) => setPollDraft((p) => ({ ...p, question: e.target.value }))}
                  placeholder="Poll question"
                  className="input"
                />
                <div className="pollFormGrid">
                  <input value={pollDraft.a} onChange={(e) => setPollDraft((p) => ({ ...p, a: e.target.value }))} placeholder="A choice" className="input" />
                  <input value={pollDraft.b} onChange={(e) => setPollDraft((p) => ({ ...p, b: e.target.value }))} placeholder="B choice" className="input" />
                  <input value={pollDraft.c} onChange={(e) => setPollDraft((p) => ({ ...p, c: e.target.value }))} placeholder="C choice (optional)" className="input" />
                  <input value={pollDraft.d} onChange={(e) => setPollDraft((p) => ({ ...p, d: e.target.value }))} placeholder="D choice (optional)" className="input" />
                </div>

                <div className="hoursRow">
                  <label style={{ fontSize: 12, color: "var(--p-muted)" }}>Hours:</label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={pollDraft.durationHours}
                    onChange={(e) => {
                      const v = Number.parseInt(String(e.target.value || 24), 10);
                      setPollDraft((p) => ({ ...p, durationHours: Number.isFinite(v) ? Math.max(1, Math.min(168, v)) : 24 }));
                    }}
                    className="input"
                    style={{ maxWidth: 110 }}
                  />
                </div>
                {pollError ? <div className="hint" style={{ color: ET_RED }}>{pollError}</div> : null}

                <button disabled={busy} onClick={handleCreatePoll} className={`btn btnBoost ${busy ? "btnBusy" : ""}`} style={{ marginTop: 10 }}>
                  {busy ? "Creating..." : "Create Poll"}
                </button>
              </div>
            ) : null}
          </section>

          <div className="links">
            <a
              href={item.tiktok || "https://tiktok.com"}
              target="_blank"
              rel="noreferrer"
              className="linkBtn tiktok"
            >
              Open TikTok
            </a>

            {item.telegram ? (
              <a
                href={item.telegram}
                target="_blank"
                rel="noreferrer"
                className="linkBtn telegram"
              >
                Open Telegram
              </a>
            ) : null}

            <button
              onClick={async () => {
                if (!shareLink) return;
                try {
                  await navigator.clipboard.writeText(shareLink);
                  const res = await fetch("/api/mahbers", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "track_metric", slug: item.slug, kind: "share" }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (res.ok && data?.item) {
                    setItem(data.item);
                    if (typeof window !== "undefined") {
                      localStorage.setItem(pageCacheKey, JSON.stringify(data.item));
                    }
                  }
                  alert("Link copied");
                } catch {
                  alert(shareLink);
                }
              }}
              className="linkBtn ghost"
            >
              Copy Share Link
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="statL">{label}</div>
      <div className="statV">{value}</div>
    </div>
  );
}
