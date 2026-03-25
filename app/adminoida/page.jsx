import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeProfileCookie } from "@/lib/auth/tiktok";
import { getSuperAdminUsernames, isSuperAdminUsername } from "@/lib/auth/admin";
import AdminClient from "../admin/admin-client";

export default async function AdminOidaPage() {
  const cookieStore = await cookies();
  const encoded = cookieStore.get("tiktok_profile")?.value;
  const user = encoded ? decodeProfileCookie(encoded) : null;

  if (!user?.username) {
    redirect("/login?next=/adminoida");
  }

  if (!isSuperAdminUsername(user?.username)) {
    const allowed = getSuperAdminUsernames();
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#07070A",
          color: "#F0EDE6",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "min(560px, 100%)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 16,
            background: "#16161D",
            padding: 24,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.1 }}>Admin Access Denied</h1>
          <p style={{ marginTop: 10, color: "#B0ADA6", lineHeight: 1.6 }}>
            Signed in as @{String(user.username || "unknown")}, but this account is not configured as a super-admin.
          </p>
          <p style={{ marginTop: 8, color: "#B0ADA6", lineHeight: 1.6 }}>
            Allowed super-admin usernames: {allowed.map((name) => `@${name}`).join(", ")}
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.12)",
              color: "#F0EDE6",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back Home
          </a>
        </div>
      </main>
    );
  }

  return <AdminClient />;
}
