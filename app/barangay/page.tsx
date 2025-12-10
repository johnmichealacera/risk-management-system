import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, AlertTriangle, FileText } from 'lucide-react'

export default async function BarangayDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user.barangayId) {
    return <div>Barangay not assigned</div>
  }

  const barangayId = session.user.barangayId

  // Get statistics
  const [evacueeCount, activeEvacuees, reliefDistributions, sitrepCount] = await Promise.all([
    prisma.evacuee.count({
      where: { barangayId }
    }),
    prisma.evacuee.count({
      where: {
        barangayId,
        status: 'EVACUATED'
      }
    }),
    prisma.reliefDistribution.count({
      where: {
        barangayId,
        status: 'DISTRIBUTED'
      }
    }),
    prisma.sITREP.count({
      where: { barangayId }
    })
  ])

  const recentEvacuees = await prisma.evacuee.findMany({
    where: { barangayId },
    take: 5,
    orderBy: { entryDate: 'desc' },
    include: {
      evacuationCenter: true
    }
  })

  const activeDisasters = await prisma.disasterEvent.findMany({
    where: {
      status: 'ACTIVE',
      affectedBarangays: {
        some: {
          barangayId
        }
      }
    },
    include: {
      affectedBarangays: {
        include: {
          barangay: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your barangay's disaster management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evacuees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evacueeCount}</div>
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
            <div className="text-2xl font-bold">{activeDisasters.length}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing disaster events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relief Distributions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reliefDistributions}</div>
            <p className="text-xs text-muted-foreground">
              Completed distributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SITREPs Submitted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sitrepCount}</div>
            <p className="text-xs text-muted-foreground">
              Situation reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Disasters */}
      {activeDisasters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Disaster Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeDisasters.map((disaster) => (
                <div
                  key={disaster.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{disaster.type}</h3>
                    <p className="text-sm text-gray-600">
                      Severity: {disaster.severity} | Started: {new Date(disaster.startDate).toLocaleDateString()}
                    </p>
                    {disaster.description && (
                      <p className="text-sm text-gray-500 mt-1">{disaster.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Evacuees */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Evacuees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEvacuees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No evacuees registered yet</p>
            ) : (
              recentEvacuees.map((evacuee) => (
                <div
                  key={evacuee.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{evacuee.name}</h3>
                    <p className="text-sm text-gray-600">
                      Age: {evacuee.age} | Gender: {evacuee.gender} | Status: {evacuee.status}
                    </p>
                    {evacuee.evacuationCenter && (
                      <p className="text-sm text-gray-500">
                        Evacuation Center: {evacuee.evacuationCenter.name}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(evacuee.entryDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

