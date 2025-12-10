import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can approve
    if (!['MUNICIPAL_ADMIN', 'MDRRMC_OFFICER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const distribution = await prisma.reliefDistribution.findUnique({
      where: { id: params.id },
      include: { reliefGood: true }
    })

    if (!distribution) {
      return NextResponse.json({ error: 'Distribution not found' }, { status: 404 })
    }

    if (distribution.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Distribution is not pending' },
        { status: 400 }
      )
    }

    // Check stock
    if (distribution.reliefGood.currentStock < distribution.quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Update distribution status and stock
    await prisma.$transaction([
      prisma.reliefDistribution.update({
        where: { id: params.id },
        data: { status: 'APPROVED' }
      }),
      prisma.reliefGood.update({
        where: { id: distribution.reliefGoodId },
        data: {
          currentStock: {
            decrement: distribution.quantity
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving distribution:', error)
    return NextResponse.json(
      { error: 'Failed to approve distribution' },
      { status: 500 }
    )
  }
}

