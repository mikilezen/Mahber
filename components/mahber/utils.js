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
