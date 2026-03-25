import { ET_GREEN, ET_RED, ET_YELLOW } from "./constants";
import { fmt, fmtHeat, getMahberRouteKey, getTier } from "./utils";

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
                <div className="card-creator">@{m.creator}</div>

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
                    className={`btn btn-join ${m.joined ? "on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoin(m.id, e);
                    }}
                  >
                    {m.joined ? "✓ Joined" : "+ Join"}
                  </button>
                  <button
                    className="btn btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(m);
                    }}
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
