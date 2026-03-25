import { fmt, fmtHeat, getMahberRouteKey, getTier } from "./utils";

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

export default function TrendingTab({ mahbers, toast }) {
  const sorted = [...mahbers].sort((a, b) => b.heat - a.heat);
  const maxHeat = sorted.reduce((mx, x) => Math.max(mx, x.heat || 0), 1);

  return (
    <section className="trend-wrap">
      <div
        className="section-title-big"
        style={{
          background: "linear-gradient(90deg,var(--fire),var(--yellow))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        TRENDING
        <br />
        NOW
      </div>
      <div className="section-sub">Real-time heat rankings from your database.</div>
      {sorted.map((m, i) => {
        const tier = getTier(m.heat);
        const pct = Math.round(((m.heat || 0) / maxHeat) * 100);
        const tiktokUrl = getTikTokProfileUrl(m.tiktok);
        const tiktokUsername = getTikTokUsername(m.tiktok);
        return (
          <div
            key={m.id}
            className="rank-row"
            style={{ borderLeftColor: tier.color }}
            onClick={() => {
              const key = getMahberRouteKey(m);
              if (!key) {
                toast("Mahber route is missing");
                return;
              }
              window.location.href = `/mahber/${key}`;
            }}
          >
            <div className={`rank-num ${i < 3 ? "top3" : ""}`}>#{i + 1}</div>
            <div className="rank-emoji">{m.emoji}</div>
            <div className="rank-info">
              <div className="rank-name-row">
                <a href={tiktokUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} title="Open TikTok profile">
                  <img src={getAvatarUrl(m)} alt={`@${tiktokUsername} profile`} className="rank-avatar" loading="lazy" />
                </a>
                <div className="rank-name">
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: "inherit", textDecoration: "none" }}
                    title="Open TikTok profile"
                  >
                    @{tiktokUsername}
                  </a>
                </div>
              </div>
              <div className="rank-heat-text">{fmtHeat(m.heat)} · {fmt(m.members)} members</div>
              <div className="heat-bar-bg">
                <div
                  className="heat-bar-fill"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg,${tier.color},${tier.color}88)` }}
                />
              </div>
            </div>
            <div className="rank-tier-badge" style={{ background: `${tier.color}20`, color: tier.color }}>
              {tier.icon} {tier.name}
            </div>
          </div>
        );
      })}
    </section>
  );
}
