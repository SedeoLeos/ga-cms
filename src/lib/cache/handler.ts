// Cache handler — works on every platform
// - No REDIS_URL: in-memory per process (fine for single-instance)
// - REDIS_URL set: Redis-backed (works on Railway, Fly.io, Render, self-hosted)
// - On Vercel: Next.js uses Vercel's built-in distributed cache automatically

let redis: import('ioredis').Redis | null = null

async function getRedis() {
  if (!process.env.REDIS_URL) return null
  if (redis) return redis

  const { default: Redis } = await import('ioredis')
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })

  redis.on('error', (err) => {
    console.error('[cache] Redis connection error:', err.message)
  })

  return redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = await getRedis()
  if (!client) return null

  try {
    const value = await client.get(key)
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  const client = await getRedis()
  if (!client) return

  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // Non-fatal — gracefully degrade to no cache
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  const client = await getRedis()
  if (!client) return

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch {
    // Non-fatal
  }
}
