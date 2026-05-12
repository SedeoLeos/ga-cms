import { prisma } from '@/lib/db/client'
import { type NextRequest, NextResponse } from 'next/server'

// Serves site design tokens as CSS custom properties
// Loaded by the editor canvas and the public site renderer
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params

  const tokens = await prisma.designToken.findMany({
    where: { siteId },
    select: { name: true, value: true, type: true },
  })

  const vars = tokens
    .map((t: { name: string; value: string }) => `  --token-${t.name}: ${t.value};`)
    .join('\n')
  const css = `:root {\n${vars}\n}\n`

  return new NextResponse(css, {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}
