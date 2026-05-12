import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

// Default provider: PostgreSQL via @prisma/adapter-pg + pg.
//
// To switch providers, install the adapter and replace the pool + adapter below:
//   MySQL  → npm install mysql2 @prisma/adapter-mysql2
//            import { createPool } from 'mysql2/promise'
//            import { PrismaMySQL } from '@prisma/adapter-mysql2'
//   SQLite → npm install @libsql/client @prisma/adapter-libsql
//            import { createClient } from '@libsql/client'
//            import { PrismaLibSQL } from '@prisma/adapter-libsql'
//
// Run `node scripts/db.mjs generate --provider=<mysql|sqlite>` to regenerate types.

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/tatomir',
})

function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

const g = globalThis as unknown as { __prisma?: PrismaClient }
export const prisma = g.__prisma ?? createClient()
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma
