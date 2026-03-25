"use client";

import { useEffect, useMemo, useState } from "react";

const ADMIN_GROUPS_PAGE_SIZE = 50;

function normalizeEmojiItem(item) {
  const value = String(item?.value || item?.emoji || item?.imageUrl || "").trim();
  const imageUrl = String(item?.imageUrl || "").trim();
  const emoji = String(item?.emoji || "").trim();
  const kind = item?.kind || (imageUrl ? "image" : "emoji");
  return { value, imageUrl, emoji, kind };
}

export default function AdminClient() {
  const [status, setStatus] = useState({ loading: true, mongoConnected: false, user: null, superAdminUsername: "mikilezen" });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("Battle of the Week");
  const [aSlug, setASlug] = useState("");
  const [bSlug, setBSlug] = useState("");
  const [postText, setPostText] = useState("");

  const [groups, setGroups] = useState([]);
  const [groupsTotal, setGroupsTotal] = useState(0);
  const [groupsCursor, setGroupsCursor] = useState("0");
  const [groupsHasMore, setGroupsHasMore] = useState(false);
  const [groupsCursorHistory, setGroupsCursorHistory] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [emojiInput, setEmojiInput] = useState("");
  const [emojiImageData, setEmojiImageData] = useState("");
  const [emojiList, setEmojiList] = useState([]);

  const [query, setQuery] = useState("");
  const [verifyFilter, setVerifyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("heat_desc");
  const [tagDrafts, setTagDrafts] = useState({});
  const [heatDrafts, setHeatDrafts] = useState({});

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

  const pageStart = Number.parseInt(groupsCursor || "0", 10) || 0;
  const pageEnd = pageStart + groups.length;

  async function fetchGroupsPage(nextCursor, options = {}) {
    const { pushHistory = false } = options;
    const normalizedCursor = String(nextCursor ?? "0");

    setGroupsLoading(true);
    try {
      const res = await fetch(
        `/api/mahbers?cursor=${encodeURIComponent(normalizedCursor)}&limit=${ADMIN_GROUPS_PAGE_SIZE}`,
        { cache: "no-store" }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Failed to load mahber page");
        return;
      }

      if (pushHistory) {
        setGroupsCursorHistory((prev) => [...prev, groupsCursor]);
      }

      setGroups(Array.isArray(data.items) ? data.items : []);
      setGroupsTotal(Number(data.total || 0));
      setGroupsCursor(normalizedCursor);
      setGroupsHasMore(Boolean(data.hasMore));
    } catch {
      setMessage("Failed to load mahber page");
    } finally {
      setGroupsLoading(false);
    }
  }

  async function handleNextGroupsPage() {
    if (groupsLoading || !groupsHasMore) return;
    const nextCursor = String(pageEnd);
    await fetchGroupsPage(nextCursor, { pushHistory: true });
  }

  async function handlePrevGroupsPage() {
    if (groupsLoading || groupsCursorHistory.length === 0) return;
    const previousCursor = groupsCursorHistory[groupsCursorHistory.length - 1];
    setGroupsCursorHistory((prev) => prev.slice(0, -1));
    await fetchGroupsPage(previousCursor, { pushHistory: false });
  }

  useEffect(() => {
    const controller = new AbortController();

    async function init() {
      setInitialLoading(true);
      setLoadError("");

      const [statusRes, groupsRes, emojisRes] = await Promise.all([
        fetch("/api/admin/status", { cache: "no-store", signal: controller.signal }),
        fetch(`/api/mahbers?cursor=0&limit=${ADMIN_GROUPS_PAGE_SIZE}`, { cache: "no-store", signal: controller.signal }),
        fetch("/api/emojis", { cache: "no-store", signal: controller.signal }),
      ]);

      if (!statusRes.ok || !groupsRes.ok || !emojisRes.ok) {
        throw new Error("Failed to load admin data");
      }

      const [statusData, groupsData, emojisData] = await Promise.all([
        statusRes.json().catch(() => ({})),
        groupsRes.json().catch(() => ({})),
        emojisRes.json().catch(() => ({})),
      ]);

      setStatus({
        loading: false,
        mongoConnected: Boolean(statusData.mongoConnected),
        user: statusData.user || null,
        superAdminUsername: statusData.superAdminUsername || "mikilezen",
      });

      setGroups(Array.isArray(groupsData.items) ? groupsData.items : []);
      setGroupsTotal(Number(groupsData.total || 0));
      setGroupsCursor("0");
      setGroupsCursorHistory([]);
      setGroupsHasMore(Boolean(groupsData.hasMore));
      setEmojiList(Array.isArray(emojisData.items) ? emojisData.items.map(normalizeEmojiItem).filter((x) => x.value) : []);
    }

    init()
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setStatus((prev) => ({ ...prev, loading: false }));
        setLoadError("Failed to load admin data");
        setMessage("Failed to load admin data");
      })
      .finally(() => setInitialLoading(false));

    return () => controller.abort();
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
    try {
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
    } catch {
      setMessage("Failed to create war");
    }
  }

  async function handleAddEmoji() {
    const emoji = emojiInput.trim();
    const imageUrl = emojiImageData.trim();

    if (!emoji && !imageUrl) {
      setMessage("Add emoji text or upload an image");
      return;
    }

    try {
      const res = await fetch("/api/emojis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, imageUrl }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Failed to add emoji");
        return;
      }

      setEmojiInput("");
      setEmojiImageData("");
      const nextItem = normalizeEmojiItem(data?.item || { emoji, imageUrl });
      setEmojiList((prev) => (prev.some((x) => x.value === nextItem.value) ? prev : [...prev, nextItem]));
      setMessage(nextItem.kind === "image" ? "Emoji image added" : "Emoji added");
    } catch {
      setMessage("Failed to add emoji");
    }
  }

  async function handleDeleteEmoji(item) {
    try {
      const res = await fetch("/api/emojis", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: item?.value, emoji: item?.emoji, imageUrl: item?.imageUrl }),
      });

      if (!res.ok) {
        setMessage("Failed to remove emoji");
        return;
      }

      setEmojiList((prev) => prev.filter((x) => x.value !== item?.value));
      setMessage("Emoji removed");
    } catch {
      setMessage("Failed to remove emoji");
    }
  }

  function handleEmojiImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setEmojiImageData(dataUrl);
      setMessage(`Loaded image: ${file.name}`);
    };
    reader.onerror = () => {
      setMessage("Failed to read image file");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function handleApproveAllRequests() {
    try {
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
    } catch {
      setMessage("Failed to approve requests");
    }
  }

  async function handleToggleVerified(item, nextVerified) {
    try {
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
    } catch {
      setMessage("Failed to update verification");
    }
  }

  async function handleUpdateTag(item) {
    const key = item.slug || String(item.id || "");
    const nextTag = String(tagDrafts[key] ?? item.category ?? "").trim().toLowerCase();

    if (!nextTag) {
      setMessage("Tag is required");
      return;
    }

    try {
      const res = await fetch("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_tag", id: item.id, slug: item.slug, category: nextTag }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Failed to update tag");
        return;
      }

      setGroups((prev) =>
        prev.map((g) => ((g.id === item.id || g.slug === item.slug) ? { ...g, category: nextTag } : g))
      );
      setTagDrafts((prev) => ({ ...prev, [key]: nextTag }));
      setMessage(`Updated tag to ${nextTag}`);
    } catch {
      setMessage("Failed to update tag");
    }
  }

  async function handleUpdateHeat(item) {
    const key = item.slug || String(item.id || "");
    const raw = String(heatDrafts[key] ?? item.heat ?? "").trim();
    const nextHeat = Number(raw);

    if (!Number.isFinite(nextHeat) || nextHeat < 0) {
      setMessage("Heat must be a valid non-negative number");
      return;
    }

    try {
      const res = await fetch("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_heat", id: item.id, slug: item.slug, heat: Math.round(nextHeat) }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Failed to update heat");
        return;
      }

      setGroups((prev) =>
        prev.map((g) => ((g.id === item.id || g.slug === item.slug) ? { ...g, heat: Math.round(nextHeat) } : g))
      );
      setHeatDrafts((prev) => ({ ...prev, [key]: String(Math.round(nextHeat)) }));
      setMessage(`Updated heat to ${Math.round(nextHeat)}`);
    } catch {
      setMessage("Failed to update heat");
    }
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

      <div style={pagerWrapStyle}>
        <div style={{ color: "#9aa5bf", fontSize: 12 }}>
          Mahbers page: {groupsTotal === 0 ? "0" : pageStart + 1}-{pageEnd} of {groupsTotal}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handlePrevGroupsPage}
            disabled={groupsLoading || groupsCursorHistory.length === 0}
            style={{ ...chipGoodBtnStyle, opacity: groupsLoading || groupsCursorHistory.length === 0 ? 0.5 : 1, cursor: groupsLoading || groupsCursorHistory.length === 0 ? "not-allowed" : "pointer" }}
          >
            Prev
          </button>
          <button
            onClick={handleNextGroupsPage}
            disabled={groupsLoading || !groupsHasMore}
            style={{ ...chipGoodBtnStyle, opacity: groupsLoading || !groupsHasMore ? 0.5 : 1, cursor: groupsLoading || !groupsHasMore ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
      </div>

        {initialLoading ? <p style={{ color: "#9aa5bf", marginBottom: 14 }}>Loading admin data...</p> : null}
        {groupsLoading ? <p style={{ color: "#9aa5bf", marginBottom: 14 }}>Loading mahber page...</p> : null}
        {loadError ? <p style={{ color: "#ffb3c1", marginBottom: 14 }}>{loadError}</p> : null}

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
          <div style={{ marginTop: 8, color: "#9aa5bf", fontSize: 12 }}>
            Dropdowns use the current page. Use Prev/Next above to load more mahbers.
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Emoji Control</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, maxWidth: 220 }} value={emojiInput} onChange={(e) => setEmojiInput(e.target.value)} placeholder="Add emoji text" />
            <input type="file" accept="image/*" onChange={handleEmojiImageChange} style={{ color: "#9aa5bf", maxWidth: 260 }} />
            <button onClick={handleAddEmoji} style={primaryBtnStyle}>Add Emoji</button>
            {emojiImageData ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #2f4465", borderRadius: 8, padding: "4px 8px", background: "#0b1220" }}>
                <img src={emojiImageData} alt="emoji preview" width={26} height={26} style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />
                <button onClick={() => setEmojiImageData("")} style={chipDangerBtnStyle}>Clear</button>
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {emojiList.map((item) => (
              <div key={item.value} style={chipWrapStyle}>
                {item.kind === "image" ? (
                  <img src={item.imageUrl || item.value} alt="emoji" width={22} height={22} style={{ width: 22, height: 22, borderRadius: 6, objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 18 }}>{item.emoji || item.value}</span>
                )}
                <button onClick={() => handleDeleteEmoji(item)} style={chipDangerBtnStyle}>Remove</button>
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
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <input
                        style={{ ...inputStyle, maxWidth: 180, padding: "7px 10px", fontSize: 12 }}
                        value={tagDrafts[item.slug || String(item.id || "")] ?? item.category ?? ""}
                        onChange={(e) =>
                          setTagDrafts((prev) => ({
                            ...prev,
                            [item.slug || String(item.id || "")]: e.target.value,
                          }))
                        }
                        placeholder="tag (e.g. community)"
                      />
                      <button onClick={() => handleUpdateTag(item)} style={chipGoodBtnStyle}>Save Tag</button>
                      <input
                        type="number"
                        min={0}
                        style={{ ...inputStyle, maxWidth: 140, padding: "7px 10px", fontSize: 12 }}
                        value={heatDrafts[item.slug || String(item.id || "")] ?? String(item.heat ?? 0)}
                        onChange={(e) =>
                          setHeatDrafts((prev) => ({
                            ...prev,
                            [item.slug || String(item.id || "")]: e.target.value,
                          }))
                        }
                        placeholder="heat"
                      />
                      <button onClick={() => handleUpdateHeat(item)} style={chipGoodBtnStyle}>Save Heat</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <button onClick={() => handleToggleVerified(item, !item.verified)} style={item.verified ? chipDangerBtnStyle : chipGoodBtnStyle}>
                      {item.verified ? "Remove Badge" : "Add Badge"}
                    </button>
                  </div>
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

const pagerWrapStyle = {
  border: "1px solid #23344f",
  borderRadius: 12,
  padding: "10px 12px",
  marginBottom: 12,
  background: "#0e1626",
  maxWidth: 980,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
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
