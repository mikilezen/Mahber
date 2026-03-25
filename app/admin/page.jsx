import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { decodeProfileCookie } from "@/lib/auth/tiktok";
import { isSuperAdminUsername } from "@/lib/auth/admin";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const encoded = cookieStore.get("tiktok_profile")?.value;
  const user = encoded ? decodeProfileCookie(encoded) : null;

  if (!isSuperAdminUsername(user?.username)) {
    notFound();
  }

  return <AdminClient />;
}
