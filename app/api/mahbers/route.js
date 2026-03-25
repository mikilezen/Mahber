import { NextResponse } from "next/server";
import { getMongoDbOrThrow } from "@/lib/mongodb";
import { ensureSessionUser, getSessionUser } from "@/lib/auth/session";
import { ensureSuperAdmin, isSuperAdminUsername, normalizeUsername } from "@/lib/auth/admin";

export const revalidate = 300;
const IS_PROD = process.env.NODE_ENV === "production";
const MAX_PAGE_LIMIT = IS_PROD ? 40 : 100;
const MAX_NAME_LEN = 80;
const MAX_DESC_LEN = 600;
const MAX_LINK_LEN = 220;

function slugify(input) {
  return String(input || "mahber")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function makeUniqueSlug(db, rawName) {
  const base = slugify(rawName || "mahber") || "mahber";
  for (let i = 0; i < 200; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const exists = await db.collection("mahbers").findOne(
      { slug: candidate },
      { projection: { _id: 1 } }
    );
    if (!exists) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function makeCreatorUsername(groupName) {
  const base = slugify(groupName).replace(/-/g, "").slice(0, 10) || "mahber";
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}_${suffix}`;
}

async function makeUniqueCreatorUsername(db, groupName) {
  for (let i = 0; i < 100; i += 1) {
    const candidate = makeCreatorUsername(groupName);
    const [userExists, creatorExists] = await Promise.all([
      db.collection("users").findOne({ username: candidate }),
      db.collection("mahbers").findOne({ creator: candidate }),
    ]);
    if (!userExists && !creatorExists) {
      return candidate;
    }
  }

  const fallback = `${slugify(groupName).replace(/-/g, "").slice(0, 10) || "mahber"}_${Date.now()}`;
  return fallback;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const owner = searchParams.get("owner");
    const parsedId = Number.parseInt(String(slug ?? ""), 10);
    const hasNumericId = Number.isFinite(parsedId) && parsedId > 0;
    const cursor = Number.parseInt(searchParams.get("cursor") ?? "0", 10);
    const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));
    const safeCursor = Number.isFinite(cursor) && cursor > 0 ? cursor : 0;

    const db = await getMongoDbOrThrow();

    if (owner === "me") {
      const user = ensureSessionUser(request);
      const items = await db
        .collection("mahbers")
        .find({ ownerUsername: user.username })
        .sort({ updatedAt: -1, _id: -1 })
        .limit(limit)
        .toArray();
      return NextResponse.json({ items });
    }

    if (slug) {
      let item = await db.collection("mahbers").findOne(
        hasNumericId ? { $or: [{ slug }, { id: parsedId }] } : { slug }
      );
      if (!item) {
        return NextResponse.json({ item: null }, { status: 404 });
      }

      const user = getSessionUser(request);
      if (user?.username && item?.slug) {
        const [joinedVote, boostedVote] = await Promise.all([
          db.collection("votes").findOne({
            type: "mahber_join",
            targetId: item.slug,
            username: user.username,
          }),
          db.collection("votes").findOne({
            type: "mahber_boost",
            targetId: item.slug,
            username: user.username,
          }),
        ]);
        item = {
          ...item,
          joined: Boolean(joinedVote),
          boosted: Boolean(boostedVote),
        };
      }

      return NextResponse.json({ item });
    }

    const updatedTotal = await db.collection("mahbers").countDocuments({});
    const items = await db
      .collection("mahbers")
      .find({})
      .sort({ updatedAt: -1, _id: -1 })
      .skip(safeCursor)
      .limit(limit)
      .toArray();

    const user = getSessionUser(request);
    let enrichedItems = items;
    if (user?.username && items.length > 0) {
      const slugs = items.map((x) => x?.slug).filter(Boolean);
      if (slugs.length > 0) {
        const votes = await db
          .collection("votes")
          .find({
            username: user.username,
            targetId: { $in: slugs },
            type: { $in: ["mahber_join", "mahber_boost"] },
          })
          .project({ type: 1, targetId: 1 })
          .toArray();

        const joinedSet = new Set(votes.filter((v) => v.type === "mahber_join").map((v) => v.targetId));
        const boostedSet = new Set(votes.filter((v) => v.type === "mahber_boost").map((v) => v.targetId));

        enrichedItems = items.map((x) => ({
          ...x,
          joined: joinedSet.has(x.slug),
          boosted: boostedSet.has(x.slug),
        }));
      }
    }

    const nextCursor = safeCursor + items.length;
    const hasMore = nextCursor < updatedTotal;

    return NextResponse.json(
      {
        total: updatedTotal,
        nextCursor: hasMore ? String(nextCursor) : null,
        hasMore,
        items: enrichedItems,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    if (error?.code === "LOGIN_REQUIRED") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    if (error?.code === "MONGO_NOT_CONFIGURED") {
      const { searchParams } = new URL(request.url);
      const slug = searchParams.get("slug");
      const owner = searchParams.get("owner");

      if (slug) {
        return NextResponse.json({ item: null }, { status: 404 });
      }
      if (owner === "me") {
        return NextResponse.json({ items: [] });
      }
      return NextResponse.json({ total: 0, nextCursor: null, hasMore: false, items: [] });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = ensureSessionUser(request);
    const db = await getMongoDbOrThrow();

    const body = await request.json();
    const rawName = String(body.name || "").trim();
    const rawDesc = String(body.desc || "").trim();
    if (!rawName || rawName.length > MAX_NAME_LEN || rawDesc.length > MAX_DESC_LEN) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const slug = await makeUniqueSlug(db, rawName);
    const creator = await makeUniqueCreatorUsername(db, body.name);
    const tiktok = String(body.tiktok || "").trim();
    const telegram = String(body.telegram || "").trim();
    if (tiktok.length > MAX_LINK_LEN || telegram.length > MAX_LINK_LEN) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const record = {
      id: Date.now(),
      slug,
      name: rawName || "Untitled Mahber",
      city: body.city || "Addis Ababa",
      category: body.category || "community",
      members: 1,
      heat: 120,
      verified: false,
      emoji: body.emoji || "🔥",
      desc: rawDesc || "",
      tiktok: tiktok || "https://tiktok.com",
      telegram: telegram || "",
      creator,
      ownerUsername: user.username,
      joinCount: 0,
      boostPoints: 0,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("mahbers").insertOne(record);
    return NextResponse.json({ ok: true, item: record });
  } catch (error) {
    if (error?.code === "LOGIN_REQUIRED") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();

    if (body.action === "create_poll") {
      const user = ensureSessionUser(request);
      const slug = typeof body.slug === "string" ? body.slug : null;
      const question = String(body.question || "").trim();
      const durationHoursRaw = Number.parseInt(String(body.durationHours ?? "24"), 10);
      const durationHours = Number.isInteger(durationHoursRaw) ? Math.min(168, Math.max(1, durationHoursRaw)) : 24;
      const options = Array.isArray(body.options)
        ? body.options.map((opt) => String(opt || "").trim()).filter(Boolean).slice(0, 4)
        : [];

      if (!slug || !question || question.length > 220 || options.length < 2) {
        return NextResponse.json({ ok: false, error: "invalid_poll_payload" }, { status: 400 });
      }

      const db = await getMongoDbOrThrow();
      const target = await db.collection("mahbers").findOne(
        { slug },
        { projection: { ownerUsername: 1 } }
      );

      if (!target) {
        return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      }

      const currentUsername = normalizeUsername(user.username);
      const ownerUsername = normalizeUsername(target.ownerUsername);
      const isOwner = ownerUsername && currentUsername === ownerUsername;
      const isSuperAdmin = isSuperAdminUsername(currentUsername);

      if (!isOwner && !isSuperAdmin) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }

      const poll = {
        id: `poll_${Date.now()}`,
        q: question,
        opts: options.map((label) => ({ l: label, v: 0 })),
        durationHours,
        createdBy: user.username,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
      };

      const result = await db.collection("mahbers").findOneAndUpdate(
        { slug },
        { $push: { polls: poll }, $set: { updatedAt: new Date().toISOString() } },
        { returnDocument: "after" }
      );

      return NextResponse.json({ ok: true, item: result, poll });
    }

    if (body.action === "vote_poll") {
      const user = ensureSessionUser(request);
      const slug = typeof body.slug === "string" ? body.slug : null;
      const pollId = typeof body.pollId === "string" ? body.pollId : null;
      const optionIndex = Number.parseInt(String(body.optionIndex), 10);

      if (!slug || !pollId || !Number.isInteger(optionIndex) || optionIndex < 0) {
        return NextResponse.json({ ok: false, error: "invalid_vote_payload" }, { status: 400 });
      }

      const db = await getMongoDbOrThrow();
      const current = await db.collection("mahbers").findOne(
        { slug },
        { projection: { polls: 1 } }
      );

      if (!current) {
        return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      }

      const poll = Array.isArray(current.polls) ? current.polls.find((p) => p?.id === pollId) : null;
      if (!poll || !Array.isArray(poll.opts) || optionIndex >= poll.opts.length) {
        return NextResponse.json({ ok: false, error: "poll_or_option_not_found" }, { status: 404 });
      }

      if (poll.expiresAt && Date.now() > new Date(poll.expiresAt).getTime()) {
        return NextResponse.json({ ok: false, error: "poll_expired" }, { status: 409 });
      }

      const existingVote = await db.collection("votes").findOne({
        type: "poll",
        targetId: `${slug}:${pollId}`,
        username: user.username,
      });
      if (existingVote) {
        return NextResponse.json({ ok: false, error: "already_voted" }, { status: 409 });
      }

      await db.collection("mahbers").updateOne(
        { slug, "polls.id": pollId },
        {
          $inc: { [`polls.$.opts.${optionIndex}.v`]: 1 },
          $set: { updatedAt: new Date().toISOString() },
        }
      );

      await db.collection("votes").insertOne({
        type: "poll",
        targetId: `${slug}:${pollId}`,
        option: optionIndex,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const updated = await db.collection("mahbers").findOne(
        { slug },
        { projection: { polls: 1 } }
      );
      const updatedPoll = Array.isArray(updated?.polls) ? updated.polls.find((p) => p?.id === pollId) : null;

      return NextResponse.json({ ok: true, poll: updatedPoll });
    }

    if (body.action === "interact") {
      const user = ensureSessionUser(request);
      const slug = typeof body.slug === "string" ? body.slug : null;
      const kind = String(body.kind || "").trim().toLowerCase();
      const DAY_MS = 24 * 60 * 60 * 1000;

      if (!slug || !["join", "boost"].includes(kind)) {
        return NextResponse.json({ ok: false, error: "invalid_interact_payload" }, { status: 400 });
      }

      const db = await getMongoDbOrThrow();
      const target = await db.collection("mahbers").findOne({ slug });

      if (!target) {
        return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      }

      const interactionFilter = {
        type: `mahber_${kind}`,
        targetId: slug,
        username: user.username,
      };
      const existing = await db.collection("votes").findOne(interactionFilter);

      if (kind === "join") {
        const isUndo = Boolean(existing);
        const inc = {
          members: isUndo && Number(target.members || 0) <= 0 ? 0 : isUndo ? -1 : 1,
          heat: isUndo ? -80 : 80,
          joinCount: isUndo && Number(target.joinCount || 0) <= 0 ? 0 : isUndo ? -1 : 1,
        };

        await db.collection("mahbers").updateOne(
          { slug },
          {
            $inc: inc,
            $set: { updatedAt: new Date().toISOString() },
          }
        );

        if (isUndo) {
          await db.collection("votes").deleteOne({ _id: existing._id });
        } else {
          await db.collection("votes").insertOne({
            ...interactionFilter,
            createdAt: new Date().toISOString(),
          });
        }

        const result = await db.collection("mahbers").findOne({ slug });
        if (!result) {
          return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, item: result, active: !isUndo, kind });
      }

      const now = Date.now();
      const lastBoostAt = existing?.createdAt ? new Date(existing.createdAt).getTime() : 0;
      const canBoost = !existing || !Number.isFinite(lastBoostAt) || now - lastBoostAt >= DAY_MS;
      const retryAt = Number.isFinite(lastBoostAt) ? lastBoostAt + DAY_MS : now + DAY_MS;

      if (!canBoost) {
        const retryInMs = Math.max(0, retryAt - now);
        const retryInHours = Math.ceil(retryInMs / (60 * 60 * 1000));
        return NextResponse.json(
          { ok: false, error: "daily_boost_limit", retryAt, retryInHours },
          { status: 409 }
        );
      }

      await db.collection("mahbers").updateOne(
        { slug },
        {
          $inc: { heat: 500, boostPoints: 1 },
          $set: { updatedAt: new Date().toISOString() },
        }
      );

      if (existing) {
        await db.collection("votes").updateOne(
          { _id: existing._id },
          { $set: { createdAt: new Date().toISOString() } }
        );
      } else {
        await db.collection("votes").insertOne({
          ...interactionFilter,
          createdAt: new Date().toISOString(),
        });
      }

      const result = await db.collection("mahbers").findOne({ slug });
      if (!result) {
        return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, item: result, active: true, kind, retryAt: now + DAY_MS });
    }

    if (body.action === "request_verify") {
      const user = ensureSessionUser(request);
      const slug = typeof body.slug === "string" ? body.slug : null;
      if (!slug) {
        return NextResponse.json({ ok: false, error: "slug_required" }, { status: 400 });
      }

      const db = await getMongoDbOrThrow();
      const current = await db.collection("mahbers").findOne(
        { slug },
        { projection: { ownerUsername: 1, verified: 1 } }
      );

      if (!current) {
        return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      }

      if (normalizeUsername(current.ownerUsername) !== normalizeUsername(user.username)) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }

      if (current.verified) {
        return NextResponse.json({ ok: true, alreadyVerified: true });
      }

      await db.collection("mahbers").updateOne(
        { slug },
        {
          $set: {
            verifyRequested: true,
            verifyRequestedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      );

      return NextResponse.json({ ok: true });
    }

    if (body.action === "approve_all_verify_requests") {
      ensureSuperAdmin(request);
      const db = await getMongoDbOrThrow();
      const now = new Date().toISOString();
      const result = await db.collection("mahbers").updateMany(
        { verifyRequested: true, verified: { $ne: true } },
        {
          $set: {
            verified: true,
            verifyRequested: false,
            verifiedAt: now,
            updatedAt: now,
          },
        }
      );
      return NextResponse.json({ ok: true, modifiedCount: result.modifiedCount || 0 });
    }

    if (body.action === "update_tag") {
      ensureSuperAdmin(request);

      const id = Number(body.id);
      const slug = typeof body.slug === "string" ? body.slug.trim() : "";
      const rawCategory = String(body.category || "").trim();
      const category = rawCategory.toLowerCase().slice(0, 40);

      if (!id && !slug) {
        return NextResponse.json({ ok: false, error: "id_or_slug_required" }, { status: 400 });
      }

      if (!category || !/^[a-z0-9_-]+$/.test(category)) {
        return NextResponse.json({ ok: false, error: "invalid_category" }, { status: 400 });
      }

      const db = await getMongoDbOrThrow();
      const filter = id ? { id } : { slug };
      const result = await db.collection("mahbers").findOneAndUpdate(
        filter,
        {
          $set: {
            category,
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, item: result });
    }

    ensureSuperAdmin(request);

    const id = Number(body.id);
    const slug = typeof body.slug === "string" ? body.slug : null;
    const verified = Boolean(body.verified);

    if (!id && !slug) {
      return NextResponse.json({ ok: false, error: "id_or_slug_required" }, { status: 400 });
    }

    const db = await getMongoDbOrThrow();
    const filter = id ? { id } : { slug };
    const result = await db.collection("mahbers").findOneAndUpdate(
      filter,
      verified
        ? {
            $set: {
              verified: true,
              verifyRequested: false,
              verifiedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        : {
            $set: {
              verified: false,
              updatedAt: new Date().toISOString(),
            },
          },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: result });
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
