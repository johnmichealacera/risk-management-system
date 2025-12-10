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

    const sitreps = await prisma.sITREP.findMany({
      where,
      include: {
        barangay: true,
        disasterEvent: true,
        submittedBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        reportDate: 'desc'
      }
    })

    return NextResponse.json(sitreps)
  } catch (error) {
    console.error('Error fetching SITREPs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SITREPs' },
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
      evacueeCount,
      damages,
      notes,
      status
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

    const sitrep = await prisma.sITREP.create({
      data: {
        barangayId: finalBarangayId,
        disasterEventId: disasterEventId || null,
        evacueeCount: parseInt(evacueeCount) || 0,
        damages: damages || null,
        notes: notes || null,
        status: status || 'DRAFT',
        submittedById: session.user.id
      },
      include: {
        barangay: true,
        disasterEvent: true
      }
    })

    return NextResponse.json(sitrep, { status: 201 })
  } catch (error) {
    console.error('Error creating SITREP:', error)
    return NextResponse.json(
      { error: 'Failed to create SITREP' },
      { status: 500 }
    )
  }
}

