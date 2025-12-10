import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminSITREPsPage() {
  const session = await getServerSession(authOptions)

  const sitreps = await prisma.sITREP.findMany({
    include: {
      barangay: true,
      disasterEvent: true,
      submittedBy: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { reportDate: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SITREPs</h1>
        <p className="text-gray-600 mt-1">View all situation reports from barangays</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Situation Reports ({sitreps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sitreps.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No SITREPs submitted</p>
            ) : (
              sitreps.map((sitrep) => (
                <div
                  key={sitrep.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {sitrep.barangay.name} - {new Date(sitrep.reportDate).toLocaleDateString()}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sitrep.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                          sitrep.status === 'REVIEWED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sitrep.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Evacuee Count: {sitrep.evacueeCount}
                      </p>
                      {sitrep.disasterEvent && (
                        <p className="text-sm text-gray-500">
                          Disaster: {sitrep.disasterEvent.type}
                        </p>
                      )}
                      {sitrep.notes && (
                        <p className="text-sm text-gray-500 mt-2">{sitrep.notes}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Submitted by: {sitrep.submittedBy.name}
                      </p>
                    </div>
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

