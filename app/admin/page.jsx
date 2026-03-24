import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { decodeProfileCookie } from "@/lib/auth/tiktok";
import { getSuperAdminUsername } from "@/lib/auth/admin";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const encoded = cookieStore.get("tiktok_profile")?.value;
  const user = encoded ? decodeProfileCookie(encoded) : null;

  if (String(user?.username || "").toLowerCase() !== getSuperAdminUsername()) {
    notFound();
  }

  return <AdminClient />;
}
