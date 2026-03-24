export const TOTAL_MAHBERS = 1000000;

const CITIES = ["Addis Ababa", "Adama", "Bahir Dar", "Hawassa", "Mekelle", "Dire Dawa", "Jimma", "Dessie"];
const CATEGORIES = ["sports", "culture", "business", "education", "community"];

function hash32(seed) {
  let x = seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

function pad6(id) {
  return String(id).padStart(6, "0");
}

export function buildMahber(id) {
  const h = hash32(id * 2654435761);
  const category = CATEGORIES[h % CATEGORIES.length];
  const city = CITIES[(h >>> 3) % CITIES.length];

  const baseMembers = 120 + ((h >>> 6) % 120000);
  const trendBoost = Math.max(0, 5000 - id) * 3;
  const members = baseMembers + trendBoost;

  const heatNoise = (h >>> 11) % 8000;
  const heat = Math.floor(members * 0.62 + heatNoise);

  return {
    id,
    slug: `mahber-${pad6(id)}`,
    name: `Mahber ${pad6(id)}`,
    city,
    category,
    members,
    heat,
    verified: (h & 7) === 0,
    updatedAt: new Date(Date.now() - ((h >>> 14) % 86400000)).toISOString(),
  };
}

function clampLimit(limit) {
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(100, Math.floor(limit));
}

function parseCursor(cursor) {
  if (!cursor) return 0;
  const parsed = Number.parseInt(cursor, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return Math.min(parsed, TOTAL_MAHBERS);
}

export function getMahbersPage({ cursor = null, limit = 20 } = {}) {
  const safeLimit = clampLimit(limit);
  const start = parseCursor(cursor);
  const end = Math.min(start + safeLimit, TOTAL_MAHBERS);

  const items = [];
  for (let i = start; i < end; i += 1) {
    items.push(buildMahber(i + 1));
  }

  const hasMore = end < TOTAL_MAHBERS;

  return {
    total: TOTAL_MAHBERS,
    nextCursor: hasMore ? String(end) : null,
    hasMore,
    items,
  };
}

export function getTopMahbers(limit = 12) {
  const sample = getMahbersPage({ cursor: "0", limit: Math.max(1, Math.min(24, limit)) * 3 }).items;
  return sample.sort((a, b) => b.heat - a.heat).slice(0, Math.max(1, Math.min(24, limit)));
}
