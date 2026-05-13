import { prisma } from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET() {
  const tokens = await prisma.designToken.findMany({
    select: { name: true, value: true },
    orderBy: { name: 'asc' },
  })

  const vars = tokens.map((t) => `  --token-${t.name}: ${t.value};`).join('\n')
  const css = `:root {\n${vars}\n}\n`

  return new NextResponse(css, {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}
