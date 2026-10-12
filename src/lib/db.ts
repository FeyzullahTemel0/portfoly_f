import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// Geliştirme sırasında sıcak yenilemede bağlantının tekrar açılmasını önler.
const globalCache = globalThis as unknown as { _mongoose?: Cache };
const cached: Cache = (globalCache._mongoose ??= { conn: null, promise: null });

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI tanımlı değil.");
  if (cached.conn) return cached.conn;

  cached.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}
