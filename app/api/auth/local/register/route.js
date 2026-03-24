import { NextResponse } from "next/server";
import { encodeProfileCookie } from "@/lib/auth/tiktok";
import { getMongoDbOrThrow } from "@/lib/mongodb";
import { hashPassword, randomUsernameFromName } from "@/lib/auth/local";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const password = String(body.password || "").trim();

    if (!name || password.length < 4) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const db = await getMongoDbOrThrow();

    let username = randomUsernameFromName(name);
    // Keep generating until we find a free username.
    for (let i = 0; i < 10; i += 1) {
      const exists = await db.collection("users").findOne({ username });
      if (!exists) break;
      username = randomUsernameFromName(name);
    }

    const userDoc = {
      name,
      username,
      picture: body.picture || "https://placehold.co/96x96/png?text=U",
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").insertOne(userDoc);

    const profile = {
      openId: `local_${Date.now()}`,
      name: userDoc.name,
      username: userDoc.username,
      picture: userDoc.picture,
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
