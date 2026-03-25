import { getMongoDb } from "@/lib/mongodb";

const SITE_URL = "https://www.mahber.social";

export default async function sitemap() {
  const now = new Date();
  const staticPages = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/llm`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const db = await getMongoDb();
    if (!db) return staticPages;

    const items = await db
      .collection("mahbers")
      .find({}, { projection: { slug: 1, updatedAt: 1 } })
      .limit(5000)
      .toArray();

    const dynamicPages = items
      .map((item) => {
        const slug = String(item?.slug || "").trim();
        if (!slug) return null;

        const updatedAtValue = item?.updatedAt ? new Date(item.updatedAt) : now;
        const lastModified = Number.isNaN(updatedAtValue.getTime()) ? now : updatedAtValue;

        return {
          url: `${SITE_URL}/mahber/${encodeURIComponent(slug)}`,
          lastModified,
          changeFrequency: "daily",
          priority: 0.8,
        };
      })
      .filter(Boolean);

    return [...staticPages, ...dynamicPages];
  } catch {
    return staticPages;
  }
}
