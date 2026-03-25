import { getMongoDb } from "@/lib/mongodb";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

function slugify(v) {
  return String(v || "mahber")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toSafeInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeMahber(item, index) {
  const safeName = String(item?.name || `Mahber ${index + 1}`).trim();
  const now = new Date().toISOString();

  return {
    id: toSafeInt(item?.id, index + 1),
    slug: item?.slug || slugify(safeName),
    name: safeName,
    emoji: item?.emoji || "M",
    creator: item?.creator || "unknown",
    desc: item?.desc || "",
    category: item?.category || "community",
    city: item?.city || "Addis Ababa",
    tiktok: item?.tiktok || "",
    telegram: item?.telegram || "",
    members: toSafeInt(item?.members, 0),
    heat: toSafeInt(item?.heat, 0),
    warWins: toSafeInt(item?.warWins, 0),
    joinCount: toSafeInt(item?.joinCount, 0),
    boostPoints: toSafeInt(item?.boostPoints, 0),
    polls: Array.isArray(item?.polls) ? item.polls : [],
    lb: Array.isArray(item?.lb) ? item.lb : [],
    verified: Boolean(item?.verified),
    updatedAt: item?.updatedAt || now,
  };
}

export async function getSeedMahbers({ limit = DEFAULT_LIMIT, query = {} } = {}) {
  const db = await getMongoDb();
  if (!db) return [];

  const safeLimit = Math.max(1, Math.min(MAX_LIMIT, toSafeInt(limit, DEFAULT_LIMIT)));
  const docs = await db
    .collection("mahbers")
    .find(query)
    .sort({ updatedAt: -1, _id: -1 })
    .limit(safeLimit)
    .toArray();

  return docs.map(normalizeMahber);
}
