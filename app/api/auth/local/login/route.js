import { NextResponse } from "next/server";
import { encodeProfileCookie } from "@/lib/auth/tiktok";
import { getMongoDbOrThrow } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth/local";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const db = await getMongoDbOrThrow();

    // Temporary real local bootstrap account for quick testing.
    if (username === "miki" && password === "pass") {
      await db.collection("users").updateOne(
        { username: "miki" },
        {
          $setOnInsert: {
            name: "Miki",
            username: "miki",
            picture: "https://placehold.co/96x96/png?text=M",
            passwordHash: hashPassword("pass"),
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    const userDoc = await db.collection("users").findOne({ username });

    if (!userDoc || userDoc.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    const profile = {
      openId: `local_${Date.now()}`,
      name: userDoc.name,
      username: userDoc.username,
      picture: userDoc.picture || "https://placehold.co/96x96/png?text=U",
      mode: "local",
    };

    const response = NextResponse.json({ ok: true, user: profile });
    response.cookies.set("tiktok_profile", encodeProfileCookie(profile), {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
