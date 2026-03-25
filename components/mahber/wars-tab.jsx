export default function WarsTab({ war, warVotes, warJustVoted, warCountdown, onWarVote }) {
  const total = warVotes.a + warVotes.b;
  const aPct = total > 0 ? Math.round((warVotes.a / total) * 100) : 0;
  const bPct = 100 - aPct;

  const h = Math.floor(warCountdown / 3600);
  const m = String(Math.floor((warCountdown % 3600) / 60)).padStart(2, "0");
  const s = String(warCountdown % 60).padStart(2, "0");

  if (!war) {
    return (
      <section className="wars-wrap">
        <div className="section-title-big" style={{ background: "linear-gradient(90deg,var(--red),var(--yellow))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          MAHBER<br />WARS
        </div>
        <div className="section-sub">No active war found in database.</div>
      </section>
    );
  }

  const aName = war.aName || "A";
  const bName = war.bName || "B";

  return (
    <section className="wars-wrap">
      <div className="section-title-big" style={{ background: "linear-gradient(90deg,var(--red),var(--yellow))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        MAHBER<br />WARS
      </div>
      <div className="section-sub">Live battle from your MongoDB war document.</div>

      <div className="war-card">
        <div className="war-top">
          <span className="war-label">BATTLE</span>
          <span className="war-timer">⏱ {h}h {m}m {s}s</span>
        </div>

        <div className="war-body">
          <div className="war-fighters">
            <div className="fighter">
              <div className="fighter-name">{aName}</div>
              <div className="fighter-votes">{warVotes.a} votes</div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="fighter">
              <div className="fighter-name">{bName}</div>
              <div className="fighter-votes">{warVotes.b} votes</div>
            </div>
          </div>

          <div className="war-bar-wrap">
            <div className="war-bar-a" style={{ width: `${aPct}%` }} />
            <div className="war-bar-b" style={{ width: `${bPct}%` }} />
          </div>

          <div className="war-pcts">
            <span style={{ color: "var(--red)" }}>{aPct}%</span>
            <span style={{ color: "var(--green)" }}>{bPct}%</span>
          </div>

          <div className="war-btns">
            <button className={`war-btn war-btn-a ${warJustVoted ? "voted-state" : ""}`} onClick={(e) => onWarVote("a", e)}>
              {warJustVoted === "a" ? "✓ Voted" : `Vote ${aName}`}
            </button>
            <button className={`war-btn war-btn-b ${warJustVoted ? "voted-state" : ""}`} onClick={(e) => onWarVote("b", e)}>
              {warJustVoted === "b" ? "✓ Voted" : `Vote ${bName}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
