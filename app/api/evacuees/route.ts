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
    const evacuationCenterId = searchParams.get('evacuationCenterId')

    const where: any = {}

    // Barangay staff can only see their barangay's evacuees
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

    if (evacuationCenterId) {
      where.evacuationCenterId = evacuationCenterId
    }

    const evacuees = await prisma.evacuee.findMany({
      where,
      include: {
        barangay: true,
        evacuationCenter: true,
        family: true,
        registeredBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        entryDate: 'desc'
      }
    })

    return NextResponse.json(evacuees)
  } catch (error) {
    console.error('Error fetching evacuees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evacuees' },
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
      name,
      age,
      gender,
      barangayId,
      evacuationCenterId,
      familyId,
      specialNeeds,
      contactInfo
    } = body

    // Barangay staff can only create evacuees for their barangay
    const finalBarangayId = session.user.role === 'BARANGAY_STAFF'
      ? session.user.barangayId!
      : barangayId

    if (!finalBarangayId) {
      return NextResponse.json(
        { error: 'Barangay ID is required' },
        { status: 400 }
      )
    }

    const evacuee = await prisma.evacuee.create({
      data: {
        name,
        age: parseInt(age),
        gender,
        barangayId: finalBarangayId,
        evacuationCenterId: evacuationCenterId || null,
        familyId: familyId || null,
        specialNeeds: specialNeeds || [],
        contactInfo: contactInfo || null,
        registeredById: session.user.id
      },
      include: {
        barangay: true,
        evacuationCenter: true,
        family: true
      }
    })

    // Update evacuation center occupancy if assigned
    if (evacuationCenterId) {
      await prisma.evacuationCenter.update({
        where: { id: evacuationCenterId },
        data: {
          currentOccupancy: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json(evacuee, { status: 201 })
  } catch (error) {
    console.error('Error creating evacuee:', error)
    return NextResponse.json(
      { error: 'Failed to create evacuee' },
      { status: 500 }
    )
  }
}

