import { getMongoDb } from "@/lib/mongodb";

const SITE_URL = "https://www.mahber.social";
const FALLBACK_IMAGE = "/assets/Group.png";

function cleanText(value, max = 160) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function normalizeExternalUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

async function getMahberBySlug(slug) {
  const db = await getMongoDb();
  if (!db || !slug) return null;
  return db.collection("mahbers").findOne({ slug });
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = String(resolvedParams?.slug || "").trim();
  const canonicalPath = `/mahber/${encodeURIComponent(slug)}`;
  const canonicalUrl = toAbsoluteUrl(canonicalPath);

  const item = await getMahberBySlug(slug);

  if (!item) {
    return {
      title: "Mahber Not Found",
      description: "This mahber page is not available.",
      alternates: { canonical: canonicalPath },
      robots: { index: false, follow: true },
    };
  }

  const name = cleanText(item.name || "Mahber", 80) || "Mahber";
  const category = cleanText(item.category || "community", 40);
  const creator = cleanText(item.creator || "", 50);
  const descBase = cleanText(item.desc || "", 180);
  const description =
    descBase ||
    `${name} is an Ethiopian mahber community on Mahber Social.${category ? ` Category: ${category}.` : ""}`;

  const socialLinks = [normalizeExternalUrl(item.tiktok), normalizeExternalUrl(item.telegram)].filter(Boolean);

  return {
    title: `${name} | Mahber`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    keywords: [
      name,
      "mahber",
      "ethiopian community",
      category,
      creator ? `@${creator}` : "",
    ].filter(Boolean),
    openGraph: {
      title: `${name} | Mahber`,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "Mahber",
      images: [
        {
          url: FALLBACK_IMAGE,
          width: 512,
          height: 512,
          alt: `${name} on Mahber`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Mahber`,
      description,
      images: [FALLBACK_IMAGE],
    },
    other: socialLinks.length
      ? {
          "mahber:social_links": socialLinks.join(","),
        }
      : undefined,
  };
}

export default function MahberSlugLayout({ children }) {
  return children;
}
