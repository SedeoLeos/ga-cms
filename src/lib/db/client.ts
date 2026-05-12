import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

// Default provider: PostgreSQL via @prisma/adapter-pg + pg.
//
// To switch providers, set DATABASE_PROVIDER in your .env.local:
//   sqlite     → DATABASE_PROVIDER=sqlite  DATABASE_URL=file:./dev.db
//   postgresql → DATABASE_PROVIDER=postgresql  DATABASE_URL=postgresql://...
//   mysql      → install mysql2 + @prisma/adapter-mysql2, add branch below

function createPrismaClient(): PrismaClient {
  const provider = process.env.DATABASE_PROVIDER ?? 'postgresql'
  const log: ('query' | 'error' | 'warn')[] =
    process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']

  if (provider === 'sqlite') {
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL ?? 'file:./dev.db',
    })
    return new PrismaClient({ adapter, log })
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/tatomir',
  })
  return new PrismaClient({ adapter: new PrismaPg(pool), log })
}

const g = globalThis as unknown as { __prisma?: PrismaClient }
export const prisma = g.__prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma
