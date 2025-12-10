import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Public routes
    if (path === '/login' || path === '/api/auth') {
      return NextResponse.next()
    }

    // Role-based access control
    if (token) {
      const role = token.role as string

      // Barangay staff can only access barangay routes
      if (role === 'BARANGAY_STAFF' && !path.startsWith('/barangay')) {
        return NextResponse.redirect(new URL('/barangay', req.url))
      }

      // Municipal admin, MDRRMC officer, Mayor, Department Head can access admin routes
      if (
        ['MUNICIPAL_ADMIN', 'MDRRMC_OFFICER', 'MAYOR', 'DEPARTMENT_HEAD'].includes(role) &&
        path.startsWith('/barangay')
      ) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Allow public routes
        if (path === '/login' || path.startsWith('/api/auth')) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      }
    }
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

