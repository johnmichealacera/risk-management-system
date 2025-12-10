'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  AlertTriangle,
  Settings,
  BarChart3,
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  items: SidebarItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-gray-50 p-4">
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export const barangaySidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/barangay', icon: LayoutDashboard },
  { title: 'Evacuees', href: '/barangay/evacuees', icon: Users },
  { title: 'Relief Distribution', href: '/barangay/relief', icon: Package },
  { title: 'SITREP', href: '/barangay/sitrep', icon: FileText },
]

export const adminSidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Disaster Events', href: '/admin/disasters', icon: AlertTriangle },
  { title: 'All Evacuees', href: '/admin/evacuees', icon: Users },
  { title: 'Relief Distribution', href: '/admin/relief', icon: Package },
  { title: 'SITREPs', href: '/admin/sitreps', icon: FileText },
  { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { title: 'Users', href: '/admin/users', icon: Settings },
]

