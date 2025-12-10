import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Redirect based on role
  const role = session.user.role

  if (role === 'BARANGAY_STAFF') {
    redirect('/barangay')
  } else {
    redirect('/admin')
  }
}
