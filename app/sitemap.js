const SITE_URL = "https://mahber.platform";

export default function sitemap() {
  const now = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/api/mahbers`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.6,
    },
  ];
}
