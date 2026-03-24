"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminClient() {
  const [status, setStatus] = useState({ loading: true, mongoConnected: false, user: null, superAdminUsername: "mikile" });
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("Battle of the Week");
  const [aSlug, setASlug] = useState("");
  const [bSlug, setBSlug] = useState("");
  const [postText, setPostText] = useState("");

  const [groups, setGroups] = useState([]);
  const [emojiInput, setEmojiInput] = useState("");
  const [emojiList, setEmojiList] = useState([]);

  const [query, setQuery] = useState("");
  const [verifyFilter, setVerifyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("heat_desc");

  const stats = useMemo(() => {
    const total = groups.length;
    const pending = groups.filter((g) => g.verifyRequested && !g.verified).length;
    const verified = groups.filter((g) => g.verified).length;
    return { total, pending, verified };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    let out = groups.filter((g) => {
      const hit =
        !q ||
        String(g.name || "").toLowerCase().includes(q) ||
        String(g.creator || "").toLowerCase().includes(q) ||
        String(g.ownerUsername || "").toLowerCase().includes(q);
      if (!hit) return false;

      if (verifyFilter === "pending") return Boolean(g.verifyRequested) && !g.verified;
      if (verifyFilter === "verified") return Boolean(g.verified);
      if (verifyFilter === "unverified") return !g.verified;
      return true;
    });

    out = out.sort((a, b) => {
      if (sortBy === "heat_desc") return Number(b.heat || 0) - Number(a.heat || 0);
      if (sortBy === "members_desc") return Number(b.members || 0) - Number(a.members || 0);
      if (sortBy === "name_asc") return String(a.name || "").localeCompare(String(b.name || ""));
      return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    });

    return out;
  }, [groups, query, verifyFilter, sortBy]);

  const warOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => String(g.name || "").toLowerCase().includes(q));
  }, [groups, query]);

  useEffect(() => {
    async function init() {
      const statusRes = await fetch("/api/admin/status", { cache: "no-store" });
      const statusData = await statusRes.json().catch(() => ({}));
      setStatus({
        loading: false,
        mongoConnected: Boolean(statusData.mongoConnected),
        user: statusData.user || null,
        superAdminUsername: statusData.superAdminUsername || "mikile",
      });

      const [groupsRes, emojisRes] = await Promise.all([
        fetch("/api/mahbers?cursor=0&limit=100", { cache: "no-store" }),
        fetch("/api/emojis", { cache: "no-store" }),
      ]);

      const groupsData = await groupsRes.json().catch(() => ({}));
      const emojisData = await emojisRes.json().catch(() => ({}));

      setGroups(Array.isArray(groupsData.items) ? groupsData.items : []);
      setEmojiList(Array.isArray(emojisData.items) ? emojisData.items.map((x) => x.emoji) : []);
    }

    init().catch(() => {
      setStatus((prev) => ({ ...prev, loading: false }));
      setMessage("Failed to load admin data");
    });
  }, []);

  useEffect(() => {
    const a = groups.find((g) => g.slug === aSlug);
    const b = groups.find((g) => g.slug === bSlug);
    if (a?.name && b?.name) {
      const generated = `${a.name} vs ${b.name}`;
      setTitle(generated);
      setPostText(`⚔️ ${generated}`);
    }
  }, [aSlug, bSlug, groups]);

  async function handleCreateWar() {
    if (!aSlug || !bSlug) {
      setMessage("Select both mahbers for war");
      return;
    }

    const endsAt = Date.now() + 1000 * 60 * 60 * 24;
    const res = await fetch("/api/wars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, aSlug, bSlug, postText, endsAt }),
    });

    if (res.ok) {
      setMessage("War round created");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setMessage(data?.error || "Failed to create war");
  }

  async function handleAddEmoji() {
    const emoji = emojiInput.trim();
    if (!emoji) {
      setMessage("Emoji input is required");
      return;
    }

    const res = await fetch("/api/emojis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });

    if (!res.ok) {
      setMessage("Failed to add emoji");
      return;
    }

    setEmojiInput("");
    setEmojiList((prev) => (prev.includes(emoji) ? prev : [...prev, emoji]));
    setMessage("Emoji added");
  }

  async function handleDeleteEmoji(emoji) {
    const res = await fetch("/api/emojis", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });

    if (!res.ok) {
      setMessage("Failed to remove emoji");
      return;
    }

    setEmojiList((prev) => prev.filter((x) => x !== emoji));
    setMessage("Emoji removed");
  }

  async function handleApproveAllRequests() {
    const res = await fetch("/api/mahbers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_all_verify_requests" }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data?.error || "Failed to approve requests");
      return;
    }

    setGroups((prev) =>
      prev.map((g) => (g.verifyRequested && !g.verified ? { ...g, verified: true, verifyRequested: false } : g))
    );
    setMessage(`Approved ${data.modifiedCount || 0} request(s)`);
  }

  async function handleToggleVerified(item, nextVerified) {
    const res = await fetch("/api/mahbers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, slug: item.slug, verified: nextVerified }),
    });

    if (!res.ok) {
      setMessage("Failed to update verification");
      return;
    }

    setGroups((prev) => prev.map((g) => (g.id === item.id ? { ...g, verified: nextVerified } : g)));
    setMessage(nextVerified ? "Verification enabled" : "Verification removed");
  }

  return (
    <main style={{ padding: 24, color: "#eaf0ff", background: "#07070A", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 10 }}>Admin Panel</h1>
      <p style={{ color: "#9aa5bf", marginBottom: 20 }}>
        Super-admin only controls for wars, verification, and emoji management.
      </p>

      <div style={statusBoxStyle}>
        <div style={{ fontSize: 13, color: "#9aa5bf" }}>Admin Status</div>
        <div style={{ marginTop: 4, fontWeight: 800, color: status.mongoConnected ? "#79f2a8" : "#ff97ab" }}>
          {status.loading ? "Checking..." : status.mongoConnected ? "Connected to MongoDB" : "MongoDB unavailable"}
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "#9aa5bf" }}>
          Logged in: {status.user?.username ? `@${status.user.username}` : "No"} | Super Admin: @{status.superAdminUsername}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 980 }}>
        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>War Control</h2>
          <label style={labelStyle}>Search mahber</label>
          <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or creator" />

          <label style={labelStyle}>Mahber A</label>
          <select style={inputStyle} value={aSlug} onChange={(e) => setASlug(e.target.value)}>
            <option value="">Select first mahber</option>
            {warOptions.map((group) => (
              <option key={`a-${group.slug || group.id}`} value={group.slug}>{group.name}</option>
            ))}
          </select>

          <label style={labelStyle}>Mahber B</label>
          <select style={inputStyle} value={bSlug} onChange={(e) => setBSlug(e.target.value)}>
            <option value="">Select second mahber</option>
            {warOptions.map((group) => (
              <option key={`b-${group.slug || group.id}`} value={group.slug}>{group.name}</option>
            ))}
          </select>

          <label style={labelStyle}>War title</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />

          <label style={labelStyle}>War post text</label>
          <input style={inputStyle} value={postText} onChange={(e) => setPostText(e.target.value)} />

          <button onClick={handleCreateWar} style={primaryBtnStyle}>Create War Round</button>
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Emoji Control</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, maxWidth: 220 }} value={emojiInput} onChange={(e) => setEmojiInput(e.target.value)} placeholder="Add emoji" />
            <button onClick={handleAddEmoji} style={primaryBtnStyle}>Add Emoji</button>
          </div>

          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {emojiList.map((emoji) => (
              <div key={emoji} style={chipWrapStyle}>
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <button onClick={() => handleDeleteEmoji(emoji)} style={chipDangerBtnStyle}>Remove</button>
              </div>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Verification Control</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={statChipStyle}>Total: {stats.total}</div>
            <div style={statChipStyle}>Pending: {stats.pending}</div>
            <div style={statChipStyle}>Verified: {stats.verified}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px", gap: 10 }}>
            <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search user/mahber/owner" />
            <select style={inputStyle} value={verifyFilter} onChange={(e) => setVerifyFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            <select style={inputStyle} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="heat_desc">Sort: Heat</option>
              <option value="members_desc">Sort: Members</option>
              <option value="name_asc">Sort: Name</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={handleApproveAllRequests}
              disabled={stats.pending === 0}
              style={{ ...primaryBtnStyle, width: "auto", opacity: stats.pending === 0 ? 0.5 : 1, cursor: stats.pending === 0 ? "not-allowed" : "pointer" }}
            >
              One Click Apply All
            </button>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {filteredGroups.length === 0 ? (
              <div style={{ color: "#9aa5bf", fontSize: 13 }}>No mahbers match current filters.</div>
            ) : (
              filteredGroups.map((item) => (
                <div key={item.id || item.slug} style={rowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{item.emoji || "🔥"}</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                      {item.verified ? <span style={{ color: "#2ea6ff", fontWeight: 800 }}>✓ Blue Tick</span> : null}
                    </div>
                    <div style={{ fontSize: 12, color: "#9aa5bf" }}>
                      creator: @{item.creator || "guest"} • owner: @{item.ownerUsername || "-"}
                      {item.verifyRequested && !item.verified ? " • requested" : ""}
                    </div>
                  </div>
                  <button onClick={() => handleToggleVerified(item, !item.verified)} style={item.verified ? chipDangerBtnStyle : chipGoodBtnStyle}>
                    {item.verified ? "Remove Badge" : "Add Badge"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {message ? <p style={{ marginTop: 14, color: "#9aa5bf" }}>{message}</p> : null}
    </main>
  );
}

const statusBoxStyle = {
  border: "1px solid #23344f",
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
  background: "#0e1626",
  maxWidth: 980,
};

const panelStyle = {
  border: "1px solid #23344f",
  borderRadius: 16,
  padding: 18,
  background: "#0e1626",
};

const sectionTitleStyle = {
  fontSize: 18,
  marginBottom: 4,
};

const labelStyle = {
  display: "block",
  marginTop: 12,
  marginBottom: 6,
  color: "#9aa5bf",
  fontSize: 13,
};

const inputStyle = {
  width: "100%",
  border: "1px solid #2f4465",
  background: "#0b1220",
  color: "#eaf0ff",
  borderRadius: 10,
  padding: "10px 12px",
};

const primaryBtnStyle = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 10,
  background: "#f8d44d",
  color: "#111",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

const chipWrapStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#0b1220",
  border: "1px solid #2f4465",
  borderRadius: 999,
  padding: "6px 10px",
};

const statChipStyle = {
  border: "1px solid #2f4465",
  background: "#0b1220",
  color: "#d4e3ff",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 700,
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  background: "#0b1220",
  border: "1px solid #2f4465",
  borderRadius: 10,
  padding: "10px 12px",
};

const chipDangerBtnStyle = {
  border: "1px solid #62424c",
  background: "#241419",
  color: "#ff97ab",
  borderRadius: 8,
  fontSize: 12,
  padding: "5px 8px",
  cursor: "pointer",
};

const chipGoodBtnStyle = {
  border: "1px solid #2b5a72",
  background: "#102030",
  color: "#7bd4ff",
  borderRadius: 8,
  fontSize: 12,
  padding: "5px 8px",
  cursor: "pointer",
};
