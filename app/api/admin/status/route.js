import { NextResponse } from "next/server";
import { getMongoDbOrThrow } from "@/lib/mongodb";
import { ensureSessionUser } from "@/lib/auth/session";
import { getSuperAdminUsername } from "@/lib/auth/admin";

export async function GET(request) {
  try {
    const user = ensureSessionUser(request);
    const db = await getMongoDbOrThrow();
    await db.command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      mongoConnected: true,
      user: {
        username: user.username,
        name: user.name,
      },
      isSuperAdmin: String(user.username || "").toLowerCase() === getSuperAdminUsername(),
      superAdminUsername: getSuperAdminUsername(),
    });
  } catch (error) {
    if (error?.code === "LOGIN_REQUIRED") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: error.message, mongoConnected: false }, { status: 500 });
  }
}
