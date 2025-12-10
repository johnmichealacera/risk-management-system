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
    const status = searchParams.get('status')

    const where: any = {}

    if (session.user.role === 'BARANGAY_STAFF') {
      if (!session.user.barangayId) {
        return NextResponse.json({ error: 'Barangay not assigned' }, { status: 400 })
      }
      where.barangayId = session.user.barangayId
    } else if (barangayId) {
      where.barangayId = barangayId
    }

    if (status) {
      where.status = status
    }

    const distributions = await prisma.reliefDistribution.findMany({
      where,
      include: {
        barangay: true,
        reliefGood: true,
        disasterEvent: true,
        distributedBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        distributedDate: 'desc'
      }
    })

    return NextResponse.json(distributions)
  } catch (error) {
    console.error('Error fetching relief distributions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch relief distributions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      barangayId,
      disasterEventId,
      reliefGoodId,
      quantity,
      recipientCount,
      distributionPoint,
      notes
    } = body

    const finalBarangayId = session.user.role === 'BARANGAY_STAFF'
      ? session.user.barangayId!
      : barangayId

    if (!finalBarangayId) {
      return NextResponse.json(
        { error: 'Barangay ID is required' },
        { status: 400 }
      )
    }

    // Check stock availability
    const reliefGood = await prisma.reliefGood.findUnique({
      where: { id: reliefGoodId }
    })

    if (!reliefGood) {
      return NextResponse.json(
        { error: 'Relief good not found' },
        { status: 404 }
      )
    }

    if (reliefGood.currentStock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Create distribution (pending approval for barangay staff)
    const status = session.user.role === 'BARANGAY_STAFF' ? 'PENDING' : 'APPROVED'

    const distribution = await prisma.reliefDistribution.create({
      data: {
        barangayId: finalBarangayId,
        disasterEventId: disasterEventId || null,
        reliefGoodId,
        quantity,
        recipientCount,
        distributionPoint: distributionPoint || null,
        notes: notes || null,
        distributedById: session.user.id,
        status
      },
      include: {
        barangay: true,
        reliefGood: true,
        disasterEvent: true
      }
    })

    // If approved, update stock
    if (status === 'APPROVED') {
      await prisma.reliefGood.update({
        where: { id: reliefGoodId },
        data: {
          currentStock: {
            decrement: quantity
          }
        }
      })
    }

    return NextResponse.json(distribution, { status: 201 })
  } catch (error) {
    console.error('Error creating relief distribution:', error)
    return NextResponse.json(
      { error: 'Failed to create relief distribution' },
      { status: 500 }
    )
  }
}

