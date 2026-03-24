import { NextResponse } from "next/server";
import { getMongoDbOrThrow } from "@/lib/mongodb";
import { ensureSessionUser } from "@/lib/auth/session";
import { ensureSuperAdmin } from "@/lib/auth/admin";

export async function GET(request) {
  try {
    ensureSessionUser(request);
    const db = await getMongoDbOrThrow();
    const items = await db.collection("emojis").find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json({ items: items.map((item) => ({ emoji: item.emoji })) });
  } catch (error) {
    if (error?.code === "LOGIN_REQUIRED") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    ensureSuperAdmin(request);
    const body = await request.json();
    const emoji = String(body.emoji || "").trim();

    if (!emoji) {
      return NextResponse.json({ ok: false, error: "emoji_required" }, { status: 400 });
    }

    const db = await getMongoDbOrThrow();
    await db.collection("emojis").updateOne(
      { emoji },
      { $setOnInsert: { emoji, createdAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, item: { emoji } });
  } catch (error) {
    if (error?.code === "LOGIN_REQUIRED") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    if (error?.code === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    ensureSuperAdmin(request);
    const body = await request.json();
    const emoji = String(body.emoji || "").trim();

    if (!emoji) {
      return NextResponse.json({ ok: false, error: "emoji_required" }, { status: 400 });
    }

    const db = await getMongoDbOrThrow();
    await db.collection("emojis").deleteOne({ emoji });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error?.code === "LOGIN_REQUIRED") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    if (error?.code === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
