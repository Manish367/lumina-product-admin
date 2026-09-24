import mongoose from "mongoose";

const uri: string = process.env.MONGODB_URI ?? "";

if (!uri.trim()) {
  throw new Error("MONGODB_URI is not configured. Add it to .env.local.");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongoose || {
  conn: null,
  promise: null,
};

global.__mongoose = cached;

export async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}