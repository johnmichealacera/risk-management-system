import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Sidebar, barangaySidebarItems } from '@/components/sidebar'

export default async function BarangayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'BARANGAY_STAFF') {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={barangaySidebarItems} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

