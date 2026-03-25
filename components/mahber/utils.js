import { TIERS } from "./constants";

export function getTier(heat) {
  for (let i = TIERS.length - 1; i >= 0; i -= 1) {
    if (heat >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export function fmt(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function fmtHeat(n) {
  return `${fmt(n)} 🔥`;
}

export function slugify(v) {
  return (
    String(v || "mahber")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "mahber"
  );
}

export function getMahberRouteKey(m) {
  return String(m?.slug || m?.id || "").trim();
}

export function isImageEmojiValue(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  if (/^data:image\//i.test(v)) return true;
  if (/^https?:\/\//i.test(v) && /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(v)) return true;
  return false;
}

function toNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Multi-signal ranking score used by feed/trending.
export function computeRankScore(item) {
  const heat = toNum(item?.heat);
  const joins = toNum(item?.joinCount);
  const boosts = toNum(item?.boostPoints);
  const views = toNum(item?.viewCount ?? item?.views);
  const copies = toNum(item?.copyCount ?? item?.shareCount);
  const warWins = toNum(item?.warWins);
  const isVerified = Boolean(item?.verified);
  const adminWeight = toNum(item?.adminWeight);

  const updatedAt = item?.updatedAt ? new Date(item.updatedAt).getTime() : 0;
  const ageHours = updatedAt > 0 ? Math.max(0, (Date.now() - updatedAt) / (1000 * 60 * 60)) : 48;
  const recencyBoost = Math.max(0, 260 - ageHours * 6);

  return (
    heat * 0.5 +
    joins * 115 +
    boosts * 210 +
    views * 2 +
    copies * 300 +
    warWins * 35 +
    (isVerified ? 420 : 0) +
    adminWeight * 180 +
    recencyBoost
  );
}
