'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

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
}

interface ReliefGood {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
}

export default function ReliefPage() {
  const [distributions, setDistributions] = useState<ReliefDistribution[]>([])
  const [reliefGoods, setReliefGoods] = useState<ReliefGood[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    reliefGoodId: '',
    quantity: '',
    recipientCount: '',
    distributionPoint: '',
    notes: ''
  })

  useEffect(() => {
    fetchDistributions()
    fetchReliefGoods()
  }, [])

  const fetchDistributions = async () => {
    try {
      const response = await fetch('/api/relief-distribution')
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

  const fetchReliefGoods = async () => {
    try {
      const response = await fetch('/api/relief-goods')
      if (response.ok) {
        const data = await response.json()
        setReliefGoods(data)
      }
    } catch (error) {
      console.error('Failed to fetch relief goods:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/relief-distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          recipientCount: parseInt(formData.recipientCount)
        })
      })

      if (response.ok) {
        toast.success('Relief distribution request submitted')
        setIsDialogOpen(false)
        setFormData({
          reliefGoodId: '',
          quantity: '',
          recipientCount: '',
          distributionPoint: '',
          notes: ''
        })
        fetchDistributions()
        fetchReliefGoods()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit request')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'DISTRIBUTED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relief Distribution</h1>
          <p className="text-gray-600 mt-1">Request and track relief goods distribution</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Distribution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Relief Distribution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reliefGood">Relief Good</Label>
                <Select
                  value={formData.reliefGoodId}
                  onValueChange={(value) => setFormData({ ...formData, reliefGoodId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relief good" />
                  </SelectTrigger>
                  <SelectContent>
                    {reliefGoods.map((good) => (
                      <SelectItem key={good.id} value={good.id}>
                        {good.name} ({good.currentStock} {good.unit} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientCount">Number of Recipients</Label>
                  <Input
                    id="recipientCount"
                    type="number"
                    value={formData.recipientCount}
                    onChange={(e) => setFormData({ ...formData, recipientCount: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="distributionPoint">Distribution Point</Label>
                <Input
                  id="distributionPoint"
                  value={formData.distributionPoint}
                  onChange={(e) => setFormData({ ...formData, distributionPoint: e.target.value })}
                  placeholder="Location where distribution will take place"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional information"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No distributions yet</p>
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
                      Quantity: {distribution.quantity} {distribution.reliefGood.unit} | 
                      Recipients: {distribution.recipientCount}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(distribution.distributedDate).toLocaleDateString()}
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

