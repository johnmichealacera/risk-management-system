import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const barangays = await prisma.barangay.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(barangays)
  } catch (error) {
    console.error('Error fetching barangays:', error)
    return NextResponse.json(
      { error: 'Failed to fetch barangays' },
      { status: 500 }
    )
  }
}

