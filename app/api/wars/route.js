import { NextResponse } from "next/server";
import { getMongoDbOrThrow } from "@/lib/mongodb";
import { ensureSessionUser } from "@/lib/auth/session";
import { ensureSuperAdmin } from "@/lib/auth/admin";

export async function GET(request) {
  try {
    ensureSessionUser(request);
    const db = await getMongoDbOrThrow();
    const war = await db.collection("wars").findOne({ active: true });
    return NextResponse.json({ item: war || null });
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
    const db = await getMongoDbOrThrow();

    const aSlug = typeof body.aSlug === "string" ? body.aSlug : "";
    const bSlug = typeof body.bSlug === "string" ? body.bSlug : "";

    if (!aSlug || !bSlug || aSlug === bSlug) {
      return NextResponse.json({ ok: false, error: "two_distinct_mahbers_required" }, { status: 400 });
    }

    const [aMahber, bMahber] = await Promise.all([
      db.collection("mahbers").findOne({ slug: aSlug }),
      db.collection("mahbers").findOne({ slug: bSlug }),
    ]);

    if (!aMahber || !bMahber) {
      return NextResponse.json({ ok: false, error: "mahber_not_found" }, { status: 404 });
    }

    const aName = aMahber.name || body.aName || "Team A";
    const bName = bMahber.name || body.bName || "Team B";

    const generatedTitle = `${aName} vs ${bName}`;
    const payload = {
      title: body.title || generatedTitle,
      aName,
      bName,
      aSlug,
      bSlug,
      endsAt: Number(body.endsAt) || Date.now() + 1000 * 60 * 60 * 24,
      active: true,
      postType: "war",
      postText: body.postText || `⚔️ ${generatedTitle}`,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("wars").updateMany({ active: true }, { $set: { active: false } });
    await db.collection("wars").insertOne(payload);
    return NextResponse.json({ ok: true, item: payload });
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
