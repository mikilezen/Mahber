export default function CreateTab({
  createForm,
  setCreateForm,
  emojiOptions,
  createDone,
  setCreateDone,
  onCreate,
}) {
  if (createDone) {
    return (
      <section className="create-wrap">
        <div className="create-success">
          <div className="create-success-emoji">{createForm.emoji}</div>
          <h2>MAHBER IS LIVE</h2>
          <p>Your mahber has been created from database-backed flow.</p>
          <button className="btn-create" style={{ maxWidth: 240, margin: "0 auto", display: "block" }} onClick={() => setCreateDone(false)}>
            Create Another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="create-wrap">
      <div className="section-title-big" style={{ background: "linear-gradient(90deg,var(--green),var(--yellow))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        START YOUR<br />MAHBER
      </div>
      <div className="section-sub">Build your tribe with real MongoDB persistence.</div>

      {createForm.name ? (
        <div className="create-preview">
          <div style={{ fontSize: 32, marginBottom: 6 }}>{createForm.emoji}</div>
          <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: 20, letterSpacing: 1, marginBottom: 4 }}>{createForm.name}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{createForm.desc || "Your description here..."}</div>
        </div>
      ) : null}

      <div className="form-group">
        <label className="form-label">Mahber Name</label>
        <input
          className="form-input"
          placeholder="e.g. Addis Fashion Mahber"
          value={createForm.name}
          onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input"
          placeholder="What is this mahber about?"
          value={createForm.desc}
          onChange={(e) => setCreateForm((f) => ({ ...f, desc: e.target.value }))}
        />
      </div>
      <div className="form-group">
        <label className="form-label">TikTok Link</label>
        <input
          className="form-input"
          placeholder="https://tiktok.com/@yourmahber"
          value={createForm.tiktok}
          onChange={(e) => setCreateForm((f) => ({ ...f, tiktok: e.target.value }))}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Telegram Link</label>
        <input
          className="form-input"
          placeholder="https://t.me/yourmahber"
          value={createForm.telegram}
          onChange={(e) => setCreateForm((f) => ({ ...f, telegram: e.target.value }))}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Pick Emoji</label>
        <div className="emoji-row">
          {emojiOptions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`emoji-opt ${createForm.emoji === emoji ? "on" : ""}`}
              onClick={() => setCreateForm((f) => ({ ...f, emoji }))}
              aria-label={`Pick ${emoji}`}
              title={`Pick ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          {emojiOptions.length === 0 ? <div style={{ fontSize: 12, color: "var(--muted)" }}>No emojis available right now.</div> : null}
        </div>
      </div>

      <button className="btn-create" onClick={onCreate}>Launch Mahber</button>
    </section>
  );
}
