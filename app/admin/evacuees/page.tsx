import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminEvacueesPage({
  searchParams,
}: {
  searchParams: { barangayId?: string; status?: string }
}) {
  const session = await getServerSession(authOptions)

  const where: any = {}
  if (searchParams.barangayId) {
    where.barangayId = searchParams.barangayId
  }
  if (searchParams.status) {
    where.status = searchParams.status
  }

  const [evacuees, barangays] = await Promise.all([
    prisma.evacuee.findMany({
      where,
      include: {
        barangay: true,
        evacuationCenter: true,
        family: true
      },
      orderBy: { entryDate: 'desc' }
    }),
    prisma.barangay.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Evacuees</h1>
        <p className="text-gray-600 mt-1">View and manage evacuees across all barangays</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evacuees ({evacuees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evacuees.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No evacuees found</p>
            ) : (
              evacuees.map((evacuee) => (
                <div
                  key={evacuee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold">{evacuee.name}</h3>
                    <p className="text-sm text-gray-600">
                      Age: {evacuee.age} | Gender: {evacuee.gender} | Status: {evacuee.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      Barangay: {evacuee.barangay.name}
                      {evacuee.evacuationCenter && ` | Center: ${evacuee.evacuationCenter.name}`}
                    </p>
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

