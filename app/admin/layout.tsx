import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Sidebar, adminSidebarItems } from '@/components/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only allow admin roles
  if (session.user.role === 'BARANGAY_STAFF') {
    redirect('/barangay')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={adminSidebarItems} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

