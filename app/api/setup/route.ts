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
    // Try to get token from URL params first, then from request body
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token')
    
    // If not in URL, try request body
    if (!token) {
      try {
        const body = await request.json().catch(() => ({}))
        token = body?.token
      } catch {
        // Body parsing failed, continue with null token
      }
    }
    
    // Decode URL-encoded token (handles + becoming %2B, = becoming %3D)
    if (token) {
      try {
        token = decodeURIComponent(token)
      } catch {
        // If decoding fails, use token as-is
      }
    }
    
    const setupSecret = process.env.SETUP_SECRET || 'change-me-in-production'

    // Basic security check
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Unauthorized. Token is required.',
          hint: 'Add ?token=YOUR_SETUP_SECRET to the URL'
        },
        { status: 401 }
      )
    }

    // Trim whitespace and compare
    const normalizedToken = token.trim()
    const normalizedSecret = setupSecret.trim()

    if (normalizedToken !== normalizedSecret) {
      return NextResponse.json(
        { 
          error: 'Unauthorized. Token does not match.',
          hint: 'Make sure SETUP_SECRET environment variable in Vercel exactly matches the token in the URL. Check for any extra spaces or encoding issues.',
          troubleshooting: [
            '1. Verify SETUP_SECRET is set in Vercel project settings → Environment Variables',
            '2. Make sure the token in the URL matches exactly (copy-paste to avoid typos)',
            '3. Check that there are no extra spaces before/after the token',
            '4. If using special characters, ensure they are properly URL-encoded in the URL'
          ]
        },
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
      const migrationOutput = execSync('npx prisma migrate deploy', { 
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      results.push('✅ Database migrations applied')
      if (migrationOutput) {
        results.push(`   ${migrationOutput.trim()}`)
      }
    } catch (error: any) {
      const errorMessage = error.message || error.toString()
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || errorMessage
      return NextResponse.json(
        { 
          error: 'Migration failed',
          details: errorOutput,
          results 
        },
        { status: 500 }
      )
    }

    // 3. Check if seeding is needed (only after migrations are done)
    try {
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
    } catch (error: any) {
      // If tables don't exist yet (shouldn't happen after migrations, but just in case)
      results.push('⚠️  Could not check user count, attempting seed anyway...')
      try {
        execSync('npx tsx prisma/seed.ts', { stdio: 'pipe' })
        results.push('✅ Database seeded with initial data')
      } catch (seedError: any) {
        results.push(`⚠️  Seed failed: ${seedError.message}`)
      }
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
    // Try to check if tables exist
    try {
      const userCount = await prisma.user.count()
      const barangayCount = await prisma.barangay.count()
      
      return NextResponse.json({
        status: 'ok',
        database: {
          users: userCount,
          barangays: barangayCount,
          isSeeded: userCount > 0,
          tablesExist: true
        }
      })
    } catch (error: any) {
      // Tables don't exist yet - migrations haven't been run
      return NextResponse.json({
        status: 'pending',
        message: 'Database tables do not exist. Run migrations first by calling POST /api/setup?token=YOUR_SETUP_SECRET',
        database: {
          tablesExist: false,
          needsMigration: true
        }
      })
    }
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

