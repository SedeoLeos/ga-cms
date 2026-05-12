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

const DEFAULT_URLS = {
  postgresql: 'postgresql://localhost:5432/tatomir',
  mysql: 'mysql://localhost:3306/tatomir',
  sqlite: 'file:./dev.db',
} as const

export default defineConfig({
  schema: SCHEMAS[provider],
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_URLS[provider],
  },
})
