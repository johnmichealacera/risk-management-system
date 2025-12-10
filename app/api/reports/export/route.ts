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

    // Only admins can export reports
    if (!['MUNICIPAL_ADMIN', 'MDRRMC_OFFICER', 'MAYOR', 'DEPARTMENT_HEAD'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const format = searchParams.get('format')
    const barangayId = searchParams.get('barangayId')

    // This is a placeholder - in production, you would generate actual PDF/Excel files
    // For now, return JSON data that can be processed client-side
    
    let data: any = {}

    switch (type) {
      case 'evacuees':
        const evacueesWhere: any = {}
        if (barangayId) evacueesWhere.barangayId = barangayId
        data = await prisma.evacuee.findMany({
          where: evacueesWhere,
          include: {
            barangay: true,
            evacuationCenter: true
          }
        })
        break
      case 'relief':
        const reliefWhere: any = {}
        if (barangayId) reliefWhere.barangayId = barangayId
        data = await prisma.reliefDistribution.findMany({
          where: reliefWhere,
          include: {
            barangay: true,
            reliefGood: true
          }
        })
        break
      case 'sitrep':
        const sitrepWhere: any = {}
        if (barangayId) sitrepWhere.barangayId = barangayId
        data = await prisma.sITREP.findMany({
          where: sitrepWhere,
          include: {
            barangay: true,
            disasterEvent: true
          }
        })
        break
      case 'disasters':
        data = await prisma.disasterEvent.findMany({
          include: {
            affectedBarangays: {
              include: {
                barangay: true
              }
            }
          }
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    if (format === 'excel') {
      // In production, use xlsx library to generate Excel file
      // For now, return JSON
      return NextResponse.json(data, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="report-${type}.json"`
        }
      })
    } else {
      // In production, use jsPDF or similar to generate PDF
      // For now, return JSON
      return NextResponse.json(data, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="report-${type}.json"`
        }
      })
    }
  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}

