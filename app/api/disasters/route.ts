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
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const disasters = await prisma.disasterEvent.findMany({
      where,
      include: {
        affectedBarangays: {
          include: {
            barangay: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json(disasters)
  } catch (error) {
    console.error('Error fetching disasters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch disasters' },
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

    // Only MUNICIPAL_ADMIN, MDRRMC_OFFICER can create disasters
    if (!['MUNICIPAL_ADMIN', 'MDRRMC_OFFICER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, severity, startDate, endDate, description, affectedBarangays } = body

    const disaster = await prisma.disasterEvent.create({
      data: {
        type,
        severity,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
        affectedBarangays: {
          create: affectedBarangays.map((barangayId: string) => ({
            barangayId
          }))
        }
      },
      include: {
        affectedBarangays: {
          include: {
            barangay: true
          }
        }
      }
    })

    return NextResponse.json(disaster, { status: 201 })
  } catch (error) {
    console.error('Error creating disaster:', error)
    return NextResponse.json(
      { error: 'Failed to create disaster' },
      { status: 500 }
    )
  }
}

