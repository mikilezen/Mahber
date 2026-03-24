import { NextResponse } from "next/server";
import { getMongoDbOrThrow } from "@/lib/mongodb";
import { ensureSessionUser } from "@/lib/auth/session";

export async function POST(request) {
  try {
    const user = ensureSessionUser(request);
    const body = await request.json();
    const type = String(body.type || "").trim();
    const targetId = String(body.targetId || "").trim();

    if (!type || !targetId) {
      return NextResponse.json({ ok: false, error: "type_and_target_required" }, { status: 400 });
    }

    const db = await getMongoDbOrThrow();

    const record = {
      type,
      targetId,
      option: body.option ?? null,
      side: body.side ?? null,
      username: user.username,
      createdAt: new Date().toISOString(),
    };

    await db.collection("votes").insertOne(record);

    return NextResponse.json({ ok: true, item: record });
  } catch (error) {
    if (error?.code === "LOGIN_REQUIRED") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    ensureSessionUser(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const targetId = searchParams.get("targetId");

    if (!type || !targetId) {
      return NextResponse.json({ ok: false, error: "type_and_target_required" }, { status: 400 });
    }

    const db = await getMongoDbOrThrow();
    const total = await db.collection("votes").countDocuments({ type, targetId });

    return NextResponse.json({ ok: true, total });
  } catch (error) {
    if (error?.code === "LOGIN_REQUIRED") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
