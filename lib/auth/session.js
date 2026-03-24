import { decodeProfileCookie } from "@/lib/auth/tiktok";

export function getSessionUser(request) {
  const encoded = request.cookies.get("tiktok_profile")?.value;
  if (!encoded) return null;
  return decodeProfileCookie(encoded);
}

export function ensureSessionUser(request) {
  const user = getSessionUser(request);
  if (!user?.username) {
    const error = new Error("login_required");
    error.code = "LOGIN_REQUIRED";
    throw error;
  }
  return user;
}
