import 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      barangayId: string | null
    }
  }

  interface User {
    role: UserRole
    barangayId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    barangayId: string | null
  }
}

