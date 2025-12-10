import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, AlertTriangle, FileText, MapPin } from 'lucide-react'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  // Get overall statistics
  const [
    totalEvacuees,
    activeEvacuees,
    totalBarangays,
    activeDisasters,
    totalDistributions,
    totalSITREPs
  ] = await Promise.all([
    prisma.evacuee.count(),
    prisma.evacuee.count({ where: { status: 'EVACUATED' } }),
    prisma.barangay.count(),
    prisma.disasterEvent.count({ where: { status: 'ACTIVE' } }),
    prisma.reliefDistribution.count({ where: { status: 'DISTRIBUTED' } }),
    prisma.sITREP.count({ where: { status: 'SUBMITTED' } })
  ])

  // Get evacuees by barangay
  const evacueesByBarangay = await prisma.evacuee.groupBy({
    by: ['barangayId'],
    _count: true,
    where: { status: 'EVACUATED' }
  })

  const barangayIds = evacueesByBarangay.map(e => e.barangayId)
  const barangays = await prisma.barangay.findMany({
    where: { id: { in: barangayIds } }
  })

  const barangayMap = new Map(barangays.map(b => [b.id, b.name]))

  // Get recent disasters
  const recentDisasters = await prisma.disasterEvent.findMany({
    where: { status: 'ACTIVE' },
    include: {
      affectedBarangays: {
        include: {
          barangay: true
        }
      }
    },
    orderBy: { startDate: 'desc' },
    take: 5
  })

  // Get pending relief requests
  const pendingRelief = await prisma.reliefDistribution.count({
    where: { status: 'PENDING' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Municipal Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of all barangays and disaster management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evacuees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvacuees}</div>
            <p className="text-xs text-muted-foreground">
              {activeEvacuees} currently evacuated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Disasters</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDisasters}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing disaster events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barangays</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBarangays}</div>
            <p className="text-xs text-muted-foreground">
              Total barangays
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Relief</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRelief}</div>
            <p className="text-xs text-muted-foreground">
              Requests awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Disasters */}
        <Card>
          <CardHeader>
            <CardTitle>Active Disaster Events</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDisasters.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active disasters</p>
            ) : (
              <div className="space-y-4">
                {recentDisasters.map((disaster) => (
                  <div
                    key={disaster.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{disaster.type}</h3>
                        <p className="text-sm text-gray-600">
                          Severity: {disaster.severity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Started: {new Date(disaster.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Affected Barangays: {disaster.affectedBarangays.length}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evacuees by Barangay */}
        <Card>
          <CardHeader>
            <CardTitle>Evacuees by Barangay</CardTitle>
          </CardHeader>
          <CardContent>
            {evacueesByBarangay.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No evacuees</p>
            ) : (
              <div className="space-y-3">
                {evacueesByBarangay.map((item) => (
                  <div
                    key={item.barangayId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">
                      {barangayMap.get(item.barangayId) || 'Unknown'}
                    </span>
                    <span className="text-lg font-bold">{item._count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

