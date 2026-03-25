import { ET_GREEN, ET_RED, ET_YELLOW } from "./constants";
import { fmt, fmtHeat, getMahberRouteKey, getTier } from "./utils";
import { useState } from "react";

function normalizeExternalUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

function getTikTokUsername(value) {
  const url = normalizeExternalUrl(value);
  const match = url.match(/tiktok\.com\/@([^/?#]+)/i);
  if (match?.[1]) return match[1].replace(/^@/, "");
  return "unknown";
}

function getTikTokProfileUrl(value) {
  const normalized = normalizeExternalUrl(value);
  const username = getTikTokUsername(value);
  if (normalized && /tiktok\.com/i.test(normalized)) {
    if (/tiktok\.com\/@[^/?#]+/i.test(normalized)) return normalized;
  }
  return `https://www.tiktok.com/@${username}`;
}

function getAvatarUrl(m) {
  const direct = String(m?.picture || m?.avatar || "").trim();
  if (direct) return direct;
  const key = encodeURIComponent(String(m?.creator || m?.name || "Mahber"));
  return `https://ui-avatars.com/api/?name=${key}&background=111827&color=F0EDE6&size=64`;
}

export default function FeedTab({
  filtered,
  search,
  setSearch,
  filterTag,
  setFilterTag,
  allTags,
  tagColors,
  onJoin,
  onShare,
  toast,
}) {
  const [joinPulseId, setJoinPulseId] = useState(null);
  const [sharePulseId, setSharePulseId] = useState(null);

  async function handleJoinClick(m, e) {
    e.stopPropagation();
    setJoinPulseId(m.id);
    setTimeout(() => setJoinPulseId((prev) => (prev === m.id ? null : prev)), 320);
    await onJoin(m.id, e);
  }

  function handleShareClick(m, e) {
    e.stopPropagation();
    setSharePulseId(m.id);
    setTimeout(() => setSharePulseId((prev) => (prev === m.id ? null : prev)), 320);
    onShare(m);
  }

  return (
    <>
      <div className="feed-header">
        <div className="feed-title">THE HOME OF<br />ETHIOPIAN<br />MAHBERS</div>
        <div className="feed-sub">Join • Vote • Vibe on TikTok</div>
        <div className="search-row">
          <input
            className="search"
            placeholder="Search mahbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tag-strip">
          {allTags.map((tag, i) => (
            <button
              key={tag}
              className="tag-btn"
              style={{
                background: filterTag === tag ? tagColors[i % tagColors.length] : "transparent",
                color: filterTag === tag ? "#000" : "var(--muted)",
                borderColor: filterTag === tag ? tagColors[i % tagColors.length] : "var(--border)",
                fontWeight: filterTag === tag ? 800 : 600,
              }}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid">
        {filtered.map((m) => {
          const tier = getTier(m.heat);
          const tiktokUrl = getTikTokProfileUrl(m.tiktok);
          const tiktokUsername = getTikTokUsername(m.tiktok);
          return (
            <article
              key={m.id}
              className="card"
              onClick={() => {
                const key = getMahberRouteKey(m);
                if (!key) {
                  toast("Mahber route is missing");
                  return;
                }
                window.location.href = `/mahber/${key}`;
              }}
            >
              <div className="card-stripe" style={{ background: "linear-gradient(90deg,var(--red),var(--yellow),var(--green))" }} />
              <div className="card-body">
                <div className="card-top">
                  <div className="card-emoji">{m.emoji}</div>
                  <div className="tier-badge">
                    <div className="heat-val" style={{ color: tier.color }}>{fmtHeat(m.heat)}</div>
                  </div>
                </div>
                <div className="card-name">
                  {m.name}
                  {m.verified ? (
                    <span
                      title="Verified"
                      aria-label="Verified"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 16,
                        height: 16,
                        marginLeft: 6,
                        borderRadius: "50%",
                        background: "#2EA6FF",
                        boxShadow: "0 0 0 2px rgba(46,166,255,.18)",
                        verticalAlign: "middle",
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M9.2 12.8L11.1 14.7L14.9 10.9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : null}
                </div>
                <div className="card-owner-row">
                  <a href={tiktokUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} title="Open TikTok profile">
                    <img src={getAvatarUrl(m)} alt={`@${tiktokUsername} profile`} className="card-owner-avatar" loading="lazy" />
                  </a>
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="card-owner-name"
                    style={{ textDecoration: "none" }}
                    title="Open TikTok profile"
                  >
                    @{tiktokUsername}
                  </a>
                </div>

                <div className="card-stats">
                  <div className="cstat">
                    <div className="cstat-v" style={{ color: ET_YELLOW }}>{fmt(m.members)}</div>
                    <div className="cstat-l">Members</div>
                  </div>
                  <div className="cstat">
                    <div className="cstat-v" style={{ color: tier.color }}>{m.polls.length}</div>
                    <div className="cstat-l">Polls</div>
                  </div>
                  <div className="cstat">
                    <div className="cstat-v" style={{ color: ET_GREEN }}>{m.warWins}</div>
                    <div className="cstat-l">War Wins</div>
                  </div>
                </div>

                <div className="card-btns">
                  <button
                    className={`btn btn-join ${m.joined ? "on" : ""} ${joinPulseId === m.id ? "click-pop" : ""}`}
                    onClick={(e) => handleJoinClick(m, e)}
                  >
                    {m.joined ? "✓ Joined" : "+ Join"}
                  </button>
                  <button
                    className={`btn btn-icon ${sharePulseId === m.id ? "click-pop" : ""}`}
                    onClick={(e) => handleShareClick(m, e)}
                  >
                    📤
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
