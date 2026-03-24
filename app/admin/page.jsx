"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const [title, setTitle] = useState("Battle of the Week");
  const [aSlug, setASlug] = useState("");
  const [bSlug, setBSlug] = useState("");
  const [postText, setPostText] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ loading: true, ok: false, mongoConnected: false, isSuperAdmin: false, user: null, superAdminUsername: "mikile" });

  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("🔥");
  const [groupDesc, setGroupDesc] = useState("");

  const [emojiInput, setEmojiInput] = useState("");
  const [emojiList, setEmojiList] = useState([]);

  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [pollGroupSlug, setPollGroupSlug] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState("");

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => String(g.name || "").toLowerCase().includes(q));
  }, [groups, search]);

  const pendingRequests = useMemo(
    () => groups.filter((g) => Boolean(g.verifyRequested) && !g.verified),
    [groups]
  );

  async function loadEmojis() {
    const res = await fetch("/api/emojis", { cache: "no-store" });
    const data = await res.json();
    setEmojiList(Array.isArray(data.items) ? data.items.map((item) => item.emoji) : []);
  }

  async function loadGroups() {
    const res = await fetch("/api/mahbers?cursor=0&limit=50", { cache: "no-store" });
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    setGroups(items.filter((item) => Boolean(item.creator)));
  }

  async function loadStatus() {
    const res = await fetch("/api/admin/status", { cache: "no-store" });
    const data = await res.json();
    setStatus({
      loading: false,
      ok: res.ok,
      mongoConnected: Boolean(data.mongoConnected),
      isSuperAdmin: Boolean(data.isSuperAdmin),
      user: data.user || null,
      superAdminUsername: data.superAdminUsername || "mikile",
    });
  }

  const selectedA = groups.find((g) => g.slug === aSlug);
  const selectedB = groups.find((g) => g.slug === bSlug);

  useEffect(() => {
    if (selectedA?.name && selectedB?.name) {
      const generatedTitle = `${selectedA.name} vs ${selectedB.name}`;
      setTitle(generatedTitle);
      setPostText(`⚔️ ${generatedTitle}`);
    }
  }, [selectedA?.name, selectedB?.name]);

  useEffect(() => {
    loadStatus().catch(() => {
      setStatus((prev) => ({ ...prev, loading: false, ok: false }));
    });
    loadEmojis().catch(() => {});
    loadGroups().catch(() => {});
  }, []);

  async function handleCreateWar() {
    if (!aSlug || !bSlug) {
      setMessage("Select both mahbers for the war");
      return;
    }
    const endsAt = Date.now() + 1000 * 60 * 60 * 24;
    const res = await fetch("/api/wars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, aSlug, bSlug, postText, endsAt }),
    });
    if (res.ok) {
      setMessage("War round created successfully");
    } else {
      const data = await res.json().catch(() => ({}));
      if (data.error === "forbidden") {
        setMessage(`Only @${status.superAdminUsername} can create wars`);
      } else {
        setMessage("Failed to create war");
      }
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) {
      setMessage("Group name is required");
      return;
    }

    const res = await fetch("/api/mahbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: groupName,
        emoji: groupEmoji || "🔥",
        desc: groupDesc,
      }),
    });

    if (res.ok) {
      setMessage("Group created successfully");
      setGroupName("");
      setGroupDesc("");
      await loadGroups();
    } else {
      setMessage("Failed to create group");
    }
  }

  async function handleCreatePoll() {
    const options = pollOptions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!pollGroupSlug || !pollQuestion.trim() || options.length < 2) {
      setMessage("Pick group, add question, and at least 2 options");
      return;
    }

    const res = await fetch("/api/mahbers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_poll",
        slug: pollGroupSlug,
        question: pollQuestion.trim(),
        options,
      }),
    });

    if (res.ok) {
      setMessage("Poll created successfully");
      setPollQuestion("");
      setPollOptions("");
      await loadGroups();
    } else {
      setMessage("Failed to create poll");
    }
  }

  async function handleAddEmoji() {
    if (!emojiInput.trim()) {
      setMessage("Emoji input cannot be empty");
      return;
    }

    const res = await fetch("/api/emojis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji: emojiInput.trim() }),
    });

    if (res.ok) {
      setEmojiInput("");
      setMessage("Emoji added");
      await loadEmojis();
    } else {
      setMessage("Failed to add emoji");
    }
  }

  async function handleDeleteEmoji(emoji) {
    const res = await fetch("/api/emojis", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });

    if (res.ok) {
      setMessage("Emoji removed");
      await loadEmojis();
    } else {
      setMessage("Failed to remove emoji");
    }
  }

  async function handleToggleVerified(item, nextVerified) {
    const res = await fetch("/api/mahbers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, slug: item.slug, verified: nextVerified }),
    });

    if (res.ok) {
      setGroups((prev) =>
        prev.map((g) => (g.id === item.id ? { ...g, verified: nextVerified } : g))
      );
      setMessage(nextVerified ? "Verification badge added" : "Verification badge removed");
    } else {
      setMessage("Failed to update verification badge");
    }
  }

  async function handleApproveAllRequests() {
    const res = await fetch("/api/mahbers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_all_verify_requests" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage(`Approved ${data.modifiedCount || 0} request(s)`);
      await loadGroups();
    } else if (data?.error === "forbidden") {
      setMessage(`Only @${status.superAdminUsername} can approve all requests`);
    } else {
      setMessage("Failed to approve all requests");
    }
  }

  return (
    <main style={{ padding: 24, color: "#eaf0ff", background: "#07070A", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 10 }}>Admin Panel</h1>
      <p style={{ color: "#9aa5bf", marginBottom: 20 }}>
        Control war rounds, create groups, manage emoji options, and add verification badges.
      </p>

      <div style={{ border: "1px solid #23344f", borderRadius: 12, padding: 12, marginBottom: 16, background: "#0e1626", maxWidth: 980 }}>
        <div style={{ fontSize: 13, color: "#9aa5bf" }}>DB Status</div>
        <div style={{ marginTop: 4, fontWeight: 800, color: status.mongoConnected ? "#79f2a8" : "#ff97ab" }}>
          {status.loading ? "Checking..." : status.mongoConnected ? "Connected to MongoDB" : "Not connected"}
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "#9aa5bf" }}>
          Logged in: {status.user?.username ? `@${status.user.username}` : "No"} | Super Admin: @{status.superAdminUsername}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 980 }}>
        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>War Control</h2>
          <label style={labelStyle}>Mahber A</label>
          <select style={inputStyle} value={aSlug} onChange={(e) => setASlug(e.target.value)}>
            <option value="">Select first mahber</option>
            {groups.map((group) => (
              <option key={`a-${group.slug || group.id}`} value={group.slug}>{group.name}</option>
            ))}
          </select>

          <label style={labelStyle}>Mahber B</label>
          <select style={inputStyle} value={bSlug} onChange={(e) => setBSlug(e.target.value)}>
            <option value="">Select second mahber</option>
            {groups.map((group) => (
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
          <h2 style={sectionTitleStyle}>Create Group</h2>
          <label style={labelStyle}>Group name</label>
          <input style={inputStyle} value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Addis Creators" />

          <label style={labelStyle}>Group emoji</label>
          <input style={inputStyle} value={groupEmoji} onChange={(e) => setGroupEmoji(e.target.value)} placeholder="🔥" />

          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 84 }} value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Short group description" />

          <button onClick={handleCreateGroup} style={primaryBtnStyle}>Create Group</button>
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Emoji Control</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, maxWidth: 200 }} value={emojiInput} onChange={(e) => setEmojiInput(e.target.value)} placeholder="Add emoji" />
            <button onClick={handleAddEmoji} style={primaryBtnStyle}>Add Emoji</button>
          </div>

          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {emojiList.map((emoji) => (
              <div key={emoji} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0b1220", border: "1px solid #2f4465", borderRadius: 999, padding: "6px 10px" }}>
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <button onClick={() => handleDeleteEmoji(emoji)} style={chipDangerBtnStyle}>Remove</button>
              </div>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Verification Badge Control</h2>
          <p style={{ color: "#9aa5bf", marginBottom: 8, fontSize: 13 }}>
            Blue tick means verified by super admin.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ color: "#9aa5bf", fontSize: 13 }}>Pending requests: {pendingRequests.length}</div>
            <button
              onClick={handleApproveAllRequests}
              disabled={!status.isSuperAdmin || pendingRequests.length === 0}
              style={{
                ...primaryBtnStyle,
                width: "auto",
                opacity: !status.isSuperAdmin || pendingRequests.length === 0 ? 0.5 : 1,
                cursor: !status.isSuperAdmin || pendingRequests.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              One Click Apply All
            </button>
          </div>
          <input
            style={inputStyle}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
          />

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {filteredGroups.length === 0 ? (
              <div style={{ color: "#9aa5bf", fontSize: 13 }}>No created groups yet.</div>
            ) : (
              filteredGroups.map((item) => (
                <div key={item.id || item.slug} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#0b1220", border: "1px solid #2f4465", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{item.emoji || "🔥"}</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                      {item.verified ? <span style={{ color: "#2ea6ff", fontWeight: 800 }}>✓ Blue Tick</span> : null}
                    </div>
                    <div style={{ fontSize: 12, color: "#9aa5bf" }}>
                      @{item.creator || "guest"}
                      {item.verifyRequested && !item.verified ? " • requested" : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleVerified(item, !item.verified)}
                    style={item.verified ? chipDangerBtnStyle : chipGoodBtnStyle}
                  >
                    {item.verified ? "Remove Badge" : "Add Badge"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Poll Creation</h2>
          <label style={labelStyle}>Group</label>
          <select
            style={inputStyle}
            value={pollGroupSlug}
            onChange={(e) => setPollGroupSlug(e.target.value)}
          >
            <option value="">Select group</option>
            {groups.map((group) => (
              <option key={group.slug || group.id} value={group.slug}>
                {group.name}
              </option>
            ))}
          </select>

          <label style={labelStyle}>Question</label>
          <input
            style={inputStyle}
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Best song this week?"
          />

          <label style={labelStyle}>Options (comma separated)</label>
          <input
            style={inputStyle}
            value={pollOptions}
            onChange={(e) => setPollOptions(e.target.value)}
            placeholder="Option A, Option B, Option C"
          />

          <button onClick={handleCreatePoll} style={primaryBtnStyle}>Create Poll</button>
        </section>
      </div>

      {message ? <p style={{ marginTop: 14, color: "#9aa5bf" }}>{message}</p> : null}
    </main>
  );
}

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
