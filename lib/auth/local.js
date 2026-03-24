import crypto from "crypto";

export function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

export function randomUsernameFromName(name) {
  const base = String(name || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10) || "user";
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}_${suffix}`;
}
