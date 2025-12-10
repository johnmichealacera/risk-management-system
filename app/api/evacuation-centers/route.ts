import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const barangayId = searchParams.get('barangayId')

    const where: any = {}
    if (barangayId) {
      where.barangayId = barangayId
    } else if (session.user.role === 'BARANGAY_STAFF' && session.user.barangayId) {
      where.barangayId = session.user.barangayId
    }

    const centers = await prisma.evacuationCenter.findMany({
      where,
      include: {
        barangay: true,
        _count: {
          select: {
            evacuees: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(centers)
  } catch (error) {
    console.error('Error fetching evacuation centers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evacuation centers' },
      { status: 500 }
    )
  }
}

