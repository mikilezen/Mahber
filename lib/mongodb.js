import { MongoClient, ServerApiVersion } from "mongodb";

const uri = String(process.env.MONGODB_URI || "").trim();

if (!global.__mongoCache) {
  global.__mongoCache = { promise: null };
}

function hasValidMongoScheme(value) {
  return value.startsWith("mongodb://") || value.startsWith("mongodb+srv://");
}

function getClientPromise() {
  if (!uri || !hasValidMongoScheme(uri)) return null;
  if (!global.__mongoCache.promise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    global.__mongoCache.promise = client.connect();
  }
  return global.__mongoCache.promise;
}

export async function getMongoDb() {
  const promise = getClientPromise();
  if (!promise) return null;
  const client = await promise;
  return client.db(process.env.MONGODB_DB || "mahber");
}

export async function getMongoDbOrThrow() {
  const db = await getMongoDb();
  if (!db) {
    const error = new Error("MongoDB is not configured. Set MONGODB_URI and MONGODB_DB.");
    error.code = "MONGO_NOT_CONFIGURED";
    throw error;
  }
  return db;
}
