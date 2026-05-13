import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const blocks = await prisma.globalBlock.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, category: true, masterJson: true },
  })

  return NextResponse.json(blocks)
}
