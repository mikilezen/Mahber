import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeProfileCookie } from "@/lib/auth/tiktok";
import { isSuperAdminUsername } from "@/lib/auth/admin";
import AdminClient from "../admin/admin-client";

export default async function AdminOidaPage() {
  const cookieStore = await cookies();
  const encoded = cookieStore.get("tiktok_profile")?.value;
  const user = encoded ? decodeProfileCookie(encoded) : null;

  if (!user?.username) {
    redirect("/");
  }

  if (!isSuperAdminUsername(user?.username)) {
    redirect("/");
  }

  return <AdminClient />;
}
