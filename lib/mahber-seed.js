function slugify(v) {
  return String(v || "mahber")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BASE = [
  {
    name: "Arsenal Mahber",
    emoji: "🔴",
    creator: "Fitsum_ATD",
    desc: "The official home of Arsenal fans in Ethiopia.",
    category: "football",
    members: 3840,
    heat: 18700,
    verified: true,
  },
  {
    name: "Habesha Singles",
    emoji: "💘",
    creator: "Love_ET",
    desc: "Find your Habesha match with weekly community games.",
    category: "dating",
    members: 6100,
    heat: 22400,
    verified: true,
  },
  {
    name: "Amharic Comedy Club",
    emoji: "😂",
    creator: "Comedian_ET",
    desc: "Daily roasts, skits and comedy reactions.",
    category: "comedy",
    members: 5300,
    heat: 16700,
    verified: false,
  },
  {
    name: "Real Madrid Mahber",
    emoji: "⚪",
    creator: "Dawit_Madridista",
    desc: "Madridista community in Ethiopia.",
    category: "football",
    members: 4200,
    heat: 14200,
    verified: false,
  },
  {
    name: "Buna Ceremony Mahber",
    emoji: "☕",
    creator: "Birtukan_ET",
    desc: "Ethiopian coffee ceremony lovers and creators.",
    category: "culture",
    members: 2800,
    heat: 9100,
    verified: false,
  },
  {
    name: "Chelsea Mahber",
    emoji: "🔵",
    creator: "Abel_CFC",
    desc: "Ethiopian Blues community.",
    category: "football",
    members: 2910,
    heat: 11800,
    verified: false,
  },
];

export function getSeedMahbers() {
  const now = new Date().toISOString();
  return BASE.map((item, index) => ({
    id: 1000 + index,
    slug: slugify(item.name),
    city: "Addis Ababa",
    tiktok: "https://tiktok.com",
    warWins: 0,
    polls: [],
    lb: [],
    updatedAt: now,
    ...item,
  }));
}
