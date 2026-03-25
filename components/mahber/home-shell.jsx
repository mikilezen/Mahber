"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProfileDock from "@/components/ui/profile-dock";
import FeedTab from "./feed-tab";
import TrendingTab from "./trending-tab";
import WarsTab from "./wars-tab";
import CreateTab from "./create-tab";
import { ET_GREEN, ET_RED, ET_YELLOW, FIRE, FONTS } from "./constants";
import { slugify } from "./utils";

const PAGE_SIZE = 15;
const REQUEST_TIMEOUT_MS = 12000;
const REQUEST_RETRIES = 1;
const MAX_CREATE_NAME_LEN = 80;
const MAX_CREATE_DESC_LEN = 600;
const MAX_CREATE_LINK_LEN = 220;
const DEFAULT_EMOJI_OPTIONS = ["🔥", "⚽", "🎵", "💘", "😂", "📚", "☕", "🚀"];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}) {
  const { timeoutMs = REQUEST_TIMEOUT_MS, retries = REQUEST_RETRIES, ...fetchOptions } = options;

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ok: false, status: 0, error: "no_connection", data: null };
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        cache: "no-store",
        ...fetchOptions,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: data?.error || `request_failed_${res.status}`,
          data,
        };
      }

      return { ok: true, status: res.status, data };
    } catch (error) {
      const isAbort = error?.name === "AbortError";
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const reason = isOffline ? "no_connection" : isAbort ? "request_timeout" : "network_error";

      if (attempt < retries) {
        await wait(350 * (attempt + 1));
        continue;
      }

      return { ok: false, status: 0, error: reason, data: null };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, status: 0, error: "network_error", data: null };
}

const CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#07070A;--s1:#0E0E13;--s2:#16161D;--s3:#1C1C25;--border:rgba(255,255,255,0.07);--green:${ET_GREEN};--yellow:${ET_YELLOW};--red:${ET_RED};--fire:${FIRE};--txt:#F0EDE6;--muted:#7A7775;--soft:#B0ADA6}
:root[data-theme='light']{--bg:#F6F8FD;--s1:#FFFFFF;--s2:#FFFFFF;--s3:#EEF3FF;--border:rgba(18,31,56,0.14);--txt:#0F1B33;--muted:#536381;--soft:#304163}
body{background:var(--bg);color:var(--txt);font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
.app{min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}
.app::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 60% 40% at 10% 0%,rgba(218,18,26,0.06) 0%,transparent 60%),radial-gradient(ellipse 50% 35% at 90% 100%,rgba(7,137,48,0.07) 0%,transparent 60%),radial-gradient(ellipse 70% 50% at 50% 50%,rgba(252,221,9,0.03) 0%,transparent 70%);pointer-events:none;z-index:0}
.nav{position:sticky;top:0;z-index:200;background:color-mix(in srgb, var(--s2) 82%, transparent);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 18px;height:58px}
.brand{display:flex;align-items:center;gap:10px}
.brand-logo{width:30px;height:30px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(252,221,9,.2))}
.logo{font-family:'Black Han Sans',sans-serif;font-size:22px;letter-spacing:3px;background:linear-gradient(90deg,var(--yellow),var(--fire));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.logo-sub{font-size:11px;display:block;color:var(--muted);letter-spacing:1.5px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;margin-top:-2px}
.tabs{display:flex;gap:2px;padding:12px 18px 0;border-bottom:1px solid var(--border);background:var(--bg);position:sticky;top:58px;z-index:190}
.tab{flex:1;text-align:center;padding:9px 6px;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.5px;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;text-transform:uppercase}
.tab.active{color:var(--yellow);border-bottom-color:var(--yellow)}
.tab:hover:not(.active){color:var(--txt)}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--yellow);color:#000;font-weight:800;font-size:14px;padding:12px 26px;border-radius:30px;z-index:999;box-shadow:0 8px 32px rgba(252,221,9,0.35)}
.feed-header{padding:20px 18px 0;position:relative;z-index:1}
.feed-title{font-family:'Black Han Sans',sans-serif;font-size:clamp(30px,7vw,56px);letter-spacing:3px;line-height:.95;background:linear-gradient(135deg,#fff 0%,var(--yellow) 60%,var(--fire) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.feed-sub{font-size:13px;color:var(--muted);font-weight:500;margin-bottom:16px}
.search-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.search{flex:1;min-width:140px;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:10px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--txt);outline:none}
.tag-strip{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding-bottom:14px}
.tag-strip::-webkit-scrollbar{display:none}
.tag-btn{flex-shrink:0;padding:5px 13px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid var(--border);color:var(--muted);cursor:pointer;background:transparent;font-family:'Plus Jakarta Sans',sans-serif}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;padding:4px 18px 100px;position:relative;z-index:1}
.card{background:var(--s2);border:1px solid var(--border);border-radius:20px;padding:0;cursor:pointer;transition:transform .22s;position:relative;overflow:hidden}
.card:hover{transform:translateY(-5px)}
.card-stripe{height:3px;width:100%}
.card-body{padding:18px}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.card-emoji{font-size:38px;line-height:1}
.tier-badge{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.heat-val{font-family:'Black Han Sans',sans-serif;font-size:13px;letter-spacing:1px}
.card-name{font-family:'Black Han Sans',sans-serif;font-size:20px;letter-spacing:1px;margin-bottom:3px;line-height:1.1}
.card-creator{font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.3px;margin-bottom:14px}
.card-stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:14px;padding:10px 0}
.cstat{text-align:center}.cstat-v{font-family:'Black Han Sans',sans-serif;font-size:18px;letter-spacing:.5px}.cstat-l{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:1px}
.card-btns{display:flex;gap:8px;flex-wrap:wrap}
.btn{border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;border-radius:11px;transition:all .18s;letter-spacing:.3px}
.btn-join{flex:1;padding:10px;font-size:13px;background:var(--yellow);color:#000}
.btn-join.on{background:var(--s3);color:var(--muted);border:1px solid var(--border)}
.btn-icon{padding:10px 13px;font-size:14px;background:var(--s3);border:1px solid var(--border);color:var(--txt)}
.trend-wrap{padding:20px 18px 100px;position:relative;z-index:1}
.section-title-big{font-family:'Black Han Sans',sans-serif;font-size:clamp(28px,6vw,48px);letter-spacing:3px;margin-bottom:4px}
.section-sub{font-size:13px;color:var(--muted);margin-bottom:20px}
.rank-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--s2);border:1px solid var(--border);border-left:3px solid;border-radius:14px;margin-bottom:10px;cursor:pointer;transition:transform .2s,border-color .2s}
.rank-row:hover{transform:translateX(5px)}
.rank-num{font-family:'Black Han Sans',sans-serif;font-size:22px;color:var(--muted);width:28px;flex-shrink:0}
.rank-num.top3{color:var(--yellow)}
.rank-emoji{font-size:28px;flex-shrink:0}
.rank-info{flex:1}.rank-name{font-weight:700;font-size:15px;margin-bottom:2px}.rank-heat-text{font-size:12px;color:var(--muted)}
.heat-bar-bg{height:4px;background:var(--s1);border-radius:4px;margin-top:6px;overflow:hidden}.heat-bar-fill{height:100%;border-radius:4px;transition:width 1s ease}
.rank-tier-badge{font-size:10px;font-weight:800;letter-spacing:1.5px;padding:3px 8px;border-radius:6px;flex-shrink:0}
.wars-wrap{padding:20px 18px 100px;position:relative;z-index:1}
.war-card{background:var(--s2);border:1px solid var(--border);border-radius:20px;overflow:hidden;margin-bottom:24px}
.war-top{background:linear-gradient(135deg,rgba(218,18,26,.1),rgba(252,221,9,.05),rgba(7,137,48,.08));border-bottom:1px solid var(--border);padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
.war-label{font-size:10px;font-weight:800;color:var(--red);letter-spacing:2px;text-transform:uppercase}
.war-timer{font-family:'Black Han Sans',sans-serif;font-size:14px;color:var(--yellow);letter-spacing:1px}
.war-body{padding:20px}
.war-fighters{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-bottom:20px}
.fighter{text-align:center}.fighter-name{font-family:'Black Han Sans',sans-serif;font-size:18px;letter-spacing:1px;line-height:1.1}.fighter-votes{font-size:12px;color:var(--muted);margin-top:3px}
.vs-badge{font-family:'Black Han Sans',sans-serif;font-size:22px;color:var(--fire);background:rgba(255,92,0,.1);border:2px solid rgba(255,92,0,.3);border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center}
.war-bar-wrap{background:var(--s1);border-radius:12px;height:16px;overflow:hidden;margin-bottom:12px;display:flex}
.war-bar-a{background:linear-gradient(90deg,var(--red),#FF6060);height:100%}
.war-bar-b{background:linear-gradient(90deg,var(--green),#00D45A);height:100%}
.war-pcts{display:flex;justify-content:space-between;font-family:'Black Han Sans',sans-serif;font-size:14px;margin-bottom:16px}
.war-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.war-btn{padding:13px;border-radius:13px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:14px;border:none;cursor:pointer;letter-spacing:.3px}
.war-btn-a{background:var(--red);color:#fff}.war-btn-b{background:var(--green);color:#fff}.war-btn.voted-state{opacity:.55;cursor:not-allowed}
.create-wrap{padding:20px 18px 100px;position:relative;z-index:1}
.create-preview{background:var(--s2);border:1px solid rgba(252,221,9,.2);border-radius:20px;padding:20px;margin-bottom:20px;position:relative;overflow:hidden}
.create-preview::after{content:'PREVIEW';position:absolute;top:12px;right:14px;font-size:10px;font-weight:800;color:rgba(252,221,9,.35);letter-spacing:2px}
.form-group{margin-bottom:16px}.form-label{font-size:12px;font-weight:700;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;display:block}
.form-input{width:100%;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--txt);outline:none}
textarea.form-input{resize:vertical;min-height:80px}
.emoji-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
.emoji-opt{font-size:22px;cursor:pointer;padding:6px;border-radius:10px;border:2px solid transparent;background:var(--s1)}
.emoji-opt.on{border-color:var(--yellow);background:rgba(252,221,9,.1)}
.btn-create{width:100%;padding:14px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:16px;background:linear-gradient(135deg,var(--green),#00C85A);color:#fff;border:none;border-radius:14px;cursor:pointer;letter-spacing:.5px;margin-top:8px}
.create-success{text-align:center;padding:40px 20px;background:var(--s2);border:1px solid rgba(7,137,48,.3);border-radius:20px}
.create-success-emoji{font-size:56px;margin-bottom:12px}
.create-success h2{font-family:'Black Han Sans',sans-serif;font-size:28px;letter-spacing:2px;color:var(--green);margin-bottom:8px}
.create-success p{font-size:14px;color:var(--muted);line-height:1.6}
@media(max-width:480px){.grid{grid-template-columns:1fr;padding:4px 12px 100px}.feed-header,.wars-wrap,.trend-wrap,.create-wrap{padding-left:12px;padding-right:12px}.tabs .tab{font-size:11px;padding:9px 4px}.brand-logo{width:26px;height:26px}}
`;

function mapItem(item) {
  const stableId = item.id || item._id || item.slug;
  return {
    id: stableId,
    slug: item.slug || slugify(item.name),
    name: item.name,
    emoji: item.emoji,
    creator: item.creator,
    members: Number(item.members || 0),
    heat: Number(item.heat || 0),
    joined: Boolean(item.joined),
    boosted: Boolean(item.boosted),
    tiktok: item.tiktok || "",
    telegram: item.telegram || "",
    desc: item.desc || "",
    tags: item.category ? [String(item.category)] : [],
    warWins: Number(item.warWins || 0),
    joinCount: Number(item.joinCount || 0),
    boostPoints: Number(item.boostPoints || 0),
    polls: Array.isArray(item.polls) ? item.polls : [],
    lb: Array.isArray(item.lb) ? item.lb : [],
    verified: Boolean(item.verified),
  };
}

function toEmojiOptions(items) {
  if (!Array.isArray(items)) return DEFAULT_EMOJI_OPTIONS;
  const unique = Array.from(new Set(items.map((x) => String(x?.emoji || "").trim()).filter(Boolean)));
  return unique.length > 0 ? unique : DEFAULT_EMOJI_OPTIONS;
}

export default function HomeShell() {
  const [mahbers, setMahbers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [nextCursor, setNextCursor] = useState("0");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState("feed");
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [toastMsg, setToastMsg] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [profile, setProfile] = useState(null);
  const [emojiOptions, setEmojiOptions] = useState(DEFAULT_EMOJI_OPTIONS);
  const [createForm, setCreateForm] = useState({ name: "", emoji: DEFAULT_EMOJI_OPTIONS[0], desc: "", tiktok: "", telegram: "" });
  const [createDone, setCreateDone] = useState(false);
  const [war, setWar] = useState(null);
  const [warJustVoted, setWarJustVoted] = useState(null);

  useEffect(() => {
    const next = typeof window !== "undefined" && localStorage.getItem("mahber-theme") === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncOnline = () => setIsOnline(navigator.onLine);
    syncOnline();

    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);

    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function bootstrap() {
      setInitialLoading(true);
      setLoadError("");

      const [profileRes, mahbersRes, warRes, emojisRes] = await Promise.all([
        requestJson("/api/auth/tiktok/me", { signal: controller.signal }),
        requestJson(`/api/mahbers?cursor=0&limit=${PAGE_SIZE}`, { signal: controller.signal }),
        requestJson("/api/wars", { signal: controller.signal }),
        requestJson("/api/emojis", { signal: controller.signal }),
      ]);

      if (!mounted) return;

      let hadCriticalError = false;

      if (profileRes.ok) {
        setProfile(profileRes.data?.user || null);
      } else {
        setProfile(null);
      }

      if (mahbersRes.ok) {
        const data = mahbersRes.data || {};
        setMahbers(Array.isArray(data.items) ? data.items.map(mapItem) : []);
        setNextCursor(data?.nextCursor ?? null);
        setHasMore(Boolean(data?.hasMore));
      } else {
        hadCriticalError = true;
        setMahbers([]);
        setNextCursor(null);
        setHasMore(false);
      }

      if (warRes.ok) {
        setWar(warRes.data?.item || null);
      } else {
        setWar(null);
      }

      if (emojisRes.ok) {
        const data = emojisRes.data || {};
        const next = toEmojiOptions(data.items);
        setEmojiOptions(next);
        setCreateForm((prev) => ({ ...prev, emoji: prev.emoji || next[0] || DEFAULT_EMOJI_OPTIONS[0] }));
      } else {
        setEmojiOptions(DEFAULT_EMOJI_OPTIONS);
        setCreateForm((prev) => ({ ...prev, emoji: prev.emoji || DEFAULT_EMOJI_OPTIONS[0] }));
      }

      if (hadCriticalError) {
        setLoadError("Main live feed failed to load. Check server environment and refresh.");
      }
    }

    bootstrap()
      .catch((error) => {
        if (error?.name === "AbortError") return;
        if (!mounted) return;
        setLoadError("Failed to load live data.");
      })
      .finally(() => {
        if (mounted) setInitialLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const loadMoreMahbers = useCallback(async () => {
    if (initialLoading || loadingMore || !hasMore || !nextCursor) return;

    setLoadingMore(true);
    try {
      const result = await requestJson(`/api/mahbers?cursor=${encodeURIComponent(String(nextCursor))}&limit=${PAGE_SIZE}`);
      if (!result.ok) {
        toast(result.error === "no_connection" ? "No internet connection" : "Failed to load more mahbers");
        return;
      }

      const data = result.data || {};

      const incoming = Array.isArray(data?.items) ? data.items.map(mapItem) : [];
      setMahbers((prev) => {
        const seen = new Set(prev.map((x) => `${x.slug}:${x.id}`));
        const merged = [...prev];
        for (const item of incoming) {
          const key = `${item.slug}:${item.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
          }
        }
        return merged;
      });

      setNextCursor(data?.nextCursor ?? null);
      setHasMore(Boolean(data?.hasMore));
    } catch {
      toast("Failed to load more mahbers");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, initialLoading, loadingMore, nextCursor]);

  useEffect(() => {
    function onScroll() {
      if (tab !== "feed") return;
      if (initialLoading || loadingMore || !hasMore || !nextCursor) return;

      const documentHeight = document.documentElement.scrollHeight;
      const scrolledBottom = window.innerHeight + window.scrollY;
      const remaining = documentHeight - scrolledBottom;

      if (remaining < 320) {
        loadMoreMahbers();
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMore, initialLoading, loadMoreMahbers, loadingMore, nextCursor, tab]);

  function toast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mahber-theme", next);
  }

  async function handleJoin(id) {
    const target = mahbers.find((x) => x.id === id);
    if (!target?.slug) {
      toast("Mahber route is missing");
      return;
    }

    try {
      const result = await requestJson("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "interact", slug: target.slug, kind: "join" }),
      });
      if (!result.ok) {
        toast(result.error === "no_connection" ? "No internet connection" : (result.data?.error || "Join failed"));
        return;
      }

      const data = result.data || {};
      const joinedNow = Boolean(data?.active);
      const nextItem = data?.item || {};
      setMahbers((prev) =>
        prev.map((m) => (m.id !== id && m.slug !== target.slug
          ? m
          : {
              ...m,
              joined: joinedNow,
              members: Number(nextItem.members ?? m.members),
              heat: Number(nextItem.heat ?? m.heat),
              joinCount: Number(nextItem.joinCount ?? m.joinCount),
            }))
      );
      toast(joinedNow ? `Joined ${target.name}` : `Left ${target.name}`);
    } catch {
      toast("Join failed");
    }
  }

  async function handleWarVote(side) {
    if (!war || warJustVoted) return;

    try {
      const targetId = war.slug || war.id || war._id;
      if (!targetId) {
        toast("War is missing id");
        return;
      }
      const result = await requestJson("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "war", targetId: String(targetId), side }),
      });

      if (!result.ok) {
        toast(result.error === "no_connection" ? "No internet connection" : (result.data?.error || "Vote failed"));
        return;
      }

      setWarJustVoted(side);
      setWar((prev) => {
        if (!prev) return prev;
        const aVotes = Number(prev.aVotes || 0);
        const bVotes = Number(prev.bVotes || 0);
        return side === "a" ? { ...prev, aVotes: aVotes + 1 } : { ...prev, bVotes: bVotes + 1 };
      });
      toast("War vote submitted");
    } catch {
      toast("Vote failed");
    }
  }

  async function handleCreate() {
    if (!isOnline) {
      toast("No internet connection");
      return;
    }

    const safeName = String(createForm.name || "").trim();
    const safeDesc = String(createForm.desc || "").trim();
    const safeTikTok = String(createForm.tiktok || "").trim();
    const safeTelegram = String(createForm.telegram || "").trim();

    if (!safeName) {
      toast("Name is required");
      return;
    }
    if (safeName.length > MAX_CREATE_NAME_LEN) {
      toast(`Name too long (max ${MAX_CREATE_NAME_LEN})`);
      return;
    }
    if (safeDesc.length > MAX_CREATE_DESC_LEN) {
      toast(`Description too long (max ${MAX_CREATE_DESC_LEN})`);
      return;
    }
    if (safeTikTok.length > MAX_CREATE_LINK_LEN || safeTelegram.length > MAX_CREATE_LINK_LEN) {
      toast(`Link too long (max ${MAX_CREATE_LINK_LEN})`);
      return;
    }

    try {
      const result = await requestJson("/api/mahbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          name: safeName,
          desc: safeDesc,
          tiktok: safeTikTok,
          telegram: safeTelegram,
        }),
      });
      if (!result.ok) {
        if (result.error === "no_connection") {
          toast("No internet connection");
        } else if (result.status === 409 || result.data?.error === "slug_exists") {
          toast("That mahber name is already used. Try a different name.");
        } else {
          toast(result.data?.error || "Create failed");
        }
        return;
      }

      const data = result.data || {};
      if (data?.item) {
        setMahbers((prev) => [mapItem(data.item), ...prev]);
      }
      setCreateDone(true);
      setTab("feed");
      setCreateForm({ name: "", emoji: emojiOptions[0] || DEFAULT_EMOJI_OPTIONS[0], desc: "", tiktok: "", telegram: "" });
      toast("Mahber created");
    } catch {
      toast("Create failed");
    }
  }

  const allTags = useMemo(() => {
    const tags = new Set(["all"]);
    for (const m of mahbers) {
      for (const tag of m.tags || []) tags.add(String(tag));
    }
    return Array.from(tags);
  }, [mahbers]);

  const tagColors = ["#f2c94c", "#eb5757", "#27ae60", "#f2994a", "#2d9cdb", "#bb6bd9", "#56ccf2", "#6fcf97"];

  const filtered = useMemo(() => {
    return mahbers
      .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
      .filter((m) => filterTag === "all" || (m.tags || []).includes(filterTag))
      .sort((a, b) => b.heat - a.heat);
  }, [mahbers, search, filterTag]);

  const warCountdown = Math.max(0, Math.floor((Number(war?.endsAt || 0) - Date.now()) / 1000));

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="nav">
          <div className="brand">
            <img src="/assets/Group.png" alt="Mahber logo" className="brand-logo" />
            <div className="logo">MAHBER<span className="logo-sub">ETHIOPIAN MAHBERS</span></div>
          </div>
          <div />
        </nav>

        <div className="tabs">
          {[
            ["feed", "🔥 Feed"],
            ["wars", "⚔️ Wars"],
            ["trending", "📈 Trending"],
            ...(profile ? [["create", "➕ Create"]] : []),
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {initialLoading ? (
          <div style={{ margin: "10px 18px 0", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--s2)", color: "var(--muted)", fontSize: 13 }}>
            Loading live data...
          </div>
        ) : null}

        {loadError ? (
          <div style={{ margin: "10px 18px 0", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(218,18,26,0.35)", background: "rgba(218,18,26,0.08)", color: "#ffb6b6", fontSize: 13 }}>
            {loadError}
          </div>
        ) : null}

        {!isOnline ? (
          <div style={{ margin: "10px 18px 0", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,153,0,0.35)", background: "rgba(255,153,0,0.12)", color: "#ffd38f", fontSize: 13 }}>
            No internet connection. Actions will fail until you reconnect.
          </div>
        ) : null}

        {tab === "feed" && (
          <>
            <FeedTab
              filtered={filtered}
              search={search}
              setSearch={setSearch}
              filterTag={filterTag}
              setFilterTag={setFilterTag}
              allTags={allTags}
              tagColors={tagColors}
              onJoin={handleJoin}
              onShare={(m) => {
                const key = m?.slug;
                const link = key ? `${window.location.origin}/mahber/${key}` : window.location.origin;
                navigator.clipboard.writeText(link).then(() => toast("Link copied")).catch(() => toast(link));
              }}
              toast={toast}
            />

            <div style={{ padding: "0 18px 108px", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
              {loadingMore ? "Loading more mahbers..." : hasMore ? "Scroll down to load more" : "All mahbers loaded"}
            </div>
          </>
        )}

        {tab === "wars" && (
          <WarsTab
            war={war}
            warVotes={{ a: Number(war?.aVotes || 0), b: Number(war?.bVotes || 0) }}
            warJustVoted={warJustVoted}
            warCountdown={warCountdown}
            onWarVote={handleWarVote}
          />
        )}

        {tab === "trending" && <TrendingTab mahbers={mahbers} toast={toast} />}

        {tab === "create" && (
          <CreateTab
            createForm={createForm}
            setCreateForm={setCreateForm}
            emojiOptions={emojiOptions}
            createDone={createDone}
            setCreateDone={setCreateDone}
            onCreate={handleCreate}
          />
        )}

        {toastMsg && <div className="toast">{toastMsg}</div>}

        <ProfileDock
          theme={theme}
          profile={profile}
          onThemeToggle={toggleTheme}
          onCreate={() => setTab("create")}
          onLogin={() => {
            window.location.href = "/login";
          }}
          onProfile={() => {
            window.location.href = "/user";
          }}
        />
      </div>
    </>
  );
}
