import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var _mongoose: MongooseCache | undefined
}

const cache: MongooseCache = global._mongoose || { conn: null, promise: null }
global._mongoose = cache

export async function connectDB() {
  if (cache.conn) return cache.conn
  if (!MONGODB_URI) throw new Error('MONGODB_URI env var is not set')

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI)
  }
  cache.conn = await cache.promise
  return cache.conn
}
