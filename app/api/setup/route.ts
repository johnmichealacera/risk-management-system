import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Database setup endpoint
 * This endpoint can be called after deployment to run migrations and seed data
 * 
 * Security: In production, you should protect this endpoint with a secret token
 * Add ?token=YOUR_SECRET_TOKEN to the URL
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const setupSecret = process.env.SETUP_SECRET || 'change-me-in-production'

    // Basic security check
    if (token !== setupSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide valid token.' },
        { status: 401 }
      )
    }

    const results: string[] = []

    // 1. Generate Prisma Client
    try {
      execSync('npx prisma generate', { stdio: 'pipe' })
      results.push('✅ Prisma Client generated')
    } catch (error) {
      results.push('⚠️  Prisma Client generation skipped (may already be done)')
    }

    // 2. Run migrations
    try {
      execSync('npx prisma migrate deploy', { stdio: 'pipe' })
      results.push('✅ Database migrations applied')
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: 'Migration failed',
          details: error.message,
          results 
        },
        { status: 500 }
      )
    }

    // 3. Check if seeding is needed
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      try {
        execSync('npx tsx prisma/seed.ts', { stdio: 'pipe' })
        results.push('✅ Database seeded with initial data')
      } catch (error: any) {
        results.push(`⚠️  Seed failed: ${error.message}`)
      }
    } else {
      results.push(`ℹ️  Database already has ${userCount} user(s), skipping seed`)
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      results
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Setup failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for status check
export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const barangayCount = await prisma.barangay.count()
    
    return NextResponse.json({
      status: 'ok',
      database: {
        users: userCount,
        barangays: barangayCount,
        isSeeded: userCount > 0
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message 
      },
      { status: 500 }
    )
  }
}

