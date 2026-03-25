import { NextResponse } from "next/server";
import { getMongoDbOrThrow } from "@/lib/mongodb";
import { ensureSuperAdmin } from "@/lib/auth/admin";

const MAX_IMAGE_VALUE_LEN = 400000;

function isImageValue(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  if (/^data:image\//i.test(v)) return true;
  if (/^https?:\/\//i.test(v) && /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(v)) return true;
  return false;
}

function mapEmojiDoc(item) {
  const legacyEmoji = String(item?.emoji || "").trim();
  const imageUrl = String(item?.imageUrl || "").trim();
  const value = String(item?.value || imageUrl || legacyEmoji).trim();
  const kind = item?.kind || (isImageValue(value) ? "image" : "emoji");

  return {
    value,
    emoji: kind === "emoji" ? (legacyEmoji || value) : "",
    imageUrl: kind === "image" ? (imageUrl || value) : "",
    kind,
  };
}

export async function GET(request) {
  try {
    const db = await getMongoDbOrThrow();
    const items = await db.collection("emojis").find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json({ items: items.map(mapEmojiDoc).filter((item) => item.value) });
  } catch (error) {
    if (error?.code === "MONGO_NOT_CONFIGURED") return NextResponse.json({ items: [] });
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    ensureSuperAdmin(request);
    const body = await request.json();
    const emoji = String(body.emoji || "").trim();
    const imageUrl = String(body.imageUrl || body.imageData || "").trim();

    if (!emoji && !imageUrl) {
      return NextResponse.json({ ok: false, error: "emoji_or_image_required" }, { status: 400 });
    }

    if (imageUrl && !isImageValue(imageUrl)) {
      return NextResponse.json({ ok: false, error: "invalid_image_value" }, { status: 400 });
    }

    if (imageUrl && imageUrl.length > MAX_IMAGE_VALUE_LEN) {
      return NextResponse.json({ ok: false, error: "image_too_large" }, { status: 400 });
    }

    const kind = imageUrl ? "image" : "emoji";
    const value = imageUrl || emoji;

    const db = await getMongoDbOrThrow();
    await db.collection("emojis").updateOne(
      { value },
      {
        $setOnInsert: {
          value,
          kind,
          emoji: kind === "emoji" ? emoji : "",
          imageUrl: kind === "image" ? imageUrl : "",
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, item: { value, emoji: kind === "emoji" ? emoji : "", imageUrl: kind === "image" ? imageUrl : "", kind } });
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
    const imageUrl = String(body.imageUrl || "").trim();
    const value = String(body.value || imageUrl || emoji).trim();

    if (!value) {
      return NextResponse.json({ ok: false, error: "emoji_or_image_required" }, { status: 400 });
    }

    const db = await getMongoDbOrThrow();
    await db.collection("emojis").deleteOne({
      $or: [{ value }, { emoji: value }, { imageUrl: value }],
    });

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
