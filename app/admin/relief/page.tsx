'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface ReliefDistribution {
  id: string
  quantity: number
  recipientCount: number
  status: string
  distributedDate: string
  reliefGood: {
    name: string
    unit: string
  }
  barangay: {
    name: string
  }
  distributedBy: {
    name: string
  }
}

export default function AdminReliefPage() {
  const [distributions, setDistributions] = useState<ReliefDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    fetchDistributions()
  }, [filterStatus])

  const fetchDistributions = async () => {
    try {
      const url = filterStatus
        ? `/api/relief-distribution?status=${filterStatus}`
        : '/api/relief-distribution'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setDistributions(data)
      }
    } catch (error) {
      toast.error('Failed to fetch distributions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/relief-distribution/${id}/approve`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Distribution approved')
        fetchDistributions()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to approve')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/relief-distribution/${id}/reject`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Distribution rejected')
        fetchDistributions()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to reject')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'DISTRIBUTED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const pendingDistributions = distributions.filter(d => d.status === 'PENDING')

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relief Distribution</h1>
        <p className="text-gray-600 mt-1">Manage and approve relief distribution requests</p>
      </div>

      {/* Pending Requests */}
      {pendingDistributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600">Pending Approval ({pendingDistributions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDistributions.map((distribution) => (
                <div
                  key={distribution.id}
                  className="p-4 border-2 border-yellow-300 rounded-lg bg-yellow-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{distribution.reliefGood.name}</h3>
                      <p className="text-sm text-gray-600">
                        Barangay: {distribution.barangay.name} | 
                        Quantity: {distribution.quantity} {distribution.reliefGood.unit} | 
                        Recipients: {distribution.recipientCount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested by: {distribution.distributedBy.name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(distribution.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(distribution.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Distributions */}
      <Card>
        <CardHeader>
          <CardTitle>All Distributions</CardTitle>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No distributions</p>
          ) : (
            <div className="space-y-4">
              {distributions.map((distribution) => (
                <div
                  key={distribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold">{distribution.reliefGood.name}</h3>
                    <p className="text-sm text-gray-600">
                      Barangay: {distribution.barangay.name} | 
                      Quantity: {distribution.quantity} {distribution.reliefGood.unit} | 
                      Recipients: {distribution.recipientCount}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(distribution.distributedDate).toLocaleDateString()} | 
                      By: {distribution.distributedBy.name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(distribution.status)}`}>
                    {distribution.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

