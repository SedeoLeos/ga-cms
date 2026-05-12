import { defineConfig } from 'prisma/config'

const provider = (process.env.DATABASE_PROVIDER ?? 'postgresql') as
  | 'postgresql'
  | 'mysql'
  | 'sqlite'

const SCHEMAS = {
  postgresql: './prisma/postgresql/schema.prisma',
  mysql: './prisma/mysql/schema.prisma',
  sqlite: './prisma/sqlite/schema.prisma',
} as const

export default defineConfig({
  schema: SCHEMAS[provider],
})
