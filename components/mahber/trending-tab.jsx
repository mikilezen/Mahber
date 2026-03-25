import { fmt, fmtHeat, getMahberRouteKey, getTier } from "./utils";

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
              <div className="rank-name">{m.name}</div>
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
