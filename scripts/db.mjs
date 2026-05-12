#!/usr/bin/env node
/**
 * Tatomir DB CLI — cross-platform Prisma wrapper
 *
 * Usage:
 *   node scripts/db.mjs <prisma-command> [args]
 *
 * Examples:
 *   node scripts/db.mjs generate
 *   node scripts/db.mjs migrate dev --name add_users
 *   node scripts/db.mjs migrate deploy
 *   node scripts/db.mjs migrate reset
 *   node scripts/db.mjs db push
 *   node scripts/db.mjs studio
 *   node scripts/db.mjs migrate dev --provider=mysql
 *
 * Provider resolution order:
 *   1. --provider=<value> flag on the command line
 *   2. DATABASE_PROVIDER environment variable
 *   3. DATABASE_PROVIDER in .env.local
 *   4. DATABASE_PROVIDER in .env
 *   5. Default: postgresql
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SUPPORTED_PROVIDERS = ['postgresql', 'mysql', 'sqlite']

function resolveProvider() {
  // 1. CLI flag
  const flag = process.argv.find((a) => a.startsWith('--provider='))
  if (flag) {
    const p = flag.split('=')[1]
    if (!SUPPORTED_PROVIDERS.includes(p)) {
      console.error(`[db] Unknown provider "${p}". Supported: ${SUPPORTED_PROVIDERS.join(', ')}`)
      process.exit(1)
    }
    return p
  }

  // 2. Environment variable
  if (process.env.DATABASE_PROVIDER) {
    return process.env.DATABASE_PROVIDER
  }

  // 3. .env files
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file)
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf8')
      const match = content.match(/^DATABASE_PROVIDER\s*=\s*(.+)$/m)
      if (match) return match[1].trim().replace(/^["']|["']$/g, '')
    }
  }

  return 'postgresql'
}

function main() {
  // Strip --provider=... from args before passing to prisma
  const rawArgs = process.argv.slice(2).filter((a) => !a.startsWith('--provider='))

  if (rawArgs.length === 0) {
    console.log('Usage: node scripts/db.mjs <prisma-command> [args]')
    console.log('Examples:')
    console.log('  node scripts/db.mjs generate')
    console.log('  node scripts/db.mjs migrate dev --name init')
    console.log('  node scripts/db.mjs migrate deploy')
    console.log('  node scripts/db.mjs studio')
    console.log('  node scripts/db.mjs migrate dev --provider=mysql')
    process.exit(0)
  }

  const provider = resolveProvider()
  const schemaPath = `prisma/${provider}/schema.prisma`
  const configPath = 'prisma.config.ts'

  if (!existsSync(resolve(process.cwd(), schemaPath))) {
    console.error(`[db] Schema not found: ${schemaPath}`)
    process.exit(1)
  }

  // Prisma 7: use --config for commands that need DB connection (migrate, studio)
  // For generate, --schema still works and is faster (no adapter needed)
  const isGenerateCmd = rawArgs[0] === 'generate'
  const flag = isGenerateCmd ? `--schema=${schemaPath}` : `--config=${configPath}`

  const command = `npx prisma ${rawArgs.join(' ')} ${flag}`

  console.log(`[db] Provider : ${provider}`)
  console.log(`[db] Schema   : ${schemaPath}`)
  console.log(`[db] Running  : ${command}\n`)

  execSync(command, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_PROVIDER: provider },
  })
}

main()
