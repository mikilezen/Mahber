import { ensureSessionUser } from "@/lib/auth/session";

const FALLBACK_SUPER_ADMINS = ["mikilezen", "mikile"];

export function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

export function getSuperAdminUsernames() {
  const fromEnv = String(process.env.SUPER_ADMIN_USERNAME || "")
    .split(/[\s,]+/)
    .map((item) => normalizeUsername(item))
    .filter(Boolean);

  return Array.from(new Set([...fromEnv, ...FALLBACK_SUPER_ADMINS.map((item) => normalizeUsername(item))]));
}

export function getSuperAdminUsername() {
  return getSuperAdminUsernames()[0] || "mikilezen";
}

export function isSuperAdminUsername(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;
  return getSuperAdminUsernames().includes(normalized);
}

export function ensureSuperAdmin(request) {
  const user = ensureSessionUser(request);
  if (!isSuperAdminUsername(user.username)) {
    const error = new Error("forbidden");
    error.code = "FORBIDDEN";
    throw error;
  }
  return user;
}
