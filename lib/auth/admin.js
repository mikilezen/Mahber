import { ensureSessionUser } from "@/lib/auth/session";

export function getSuperAdminUsername() {
  return String(process.env.SUPER_ADMIN_USERNAME || "mikilezen").trim().toLowerCase();
}

export function ensureSuperAdmin(request) {
  const user = ensureSessionUser(request);
  const superAdmin = getSuperAdminUsername();
  if (String(user.username || "").toLowerCase() !== superAdmin) {
    const error = new Error("forbidden");
    error.code = "FORBIDDEN";
    throw error;
  }
  return user;
}
