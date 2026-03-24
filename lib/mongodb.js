import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

let cached = global.__mongoClientPromise;

if (!cached && uri) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  cached = client.connect();
  global.__mongoClientPromise = cached;
}

export async function getMongoDb() {
  if (!uri || !cached) return null;
  const client = await cached;
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
