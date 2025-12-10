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

interface SITREP {
  id: string
  reportDate: string
  evacueeCount: number
  status: string
  notes?: string
  barangay: {
    name: string
  }
  disasterEvent?: {
    type: string
  }
}

interface DisasterEvent {
  id: string
  type: string
  severity: string
  status: string
}

export default function SITREPPage() {
  const [sitreps, setSitreps] = useState<SITREP[]>([])
  const [disasters, setDisasters] = useState<DisasterEvent[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    disasterEventId: 'none',
    evacueeCount: '',
    damages: '',
    notes: '',
    status: 'DRAFT'
  })

  useEffect(() => {
    fetchSITREPs()
    fetchDisasters()
  }, [])

  const fetchSITREPs = async () => {
    try {
      const response = await fetch('/api/sitrep')
      if (response.ok) {
        const data = await response.json()
        setSitreps(data)
      }
    } catch (error) {
      toast.error('Failed to fetch SITREPs')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDisasters = async () => {
    try {
      const response = await fetch('/api/disasters?status=ACTIVE')
      if (response.ok) {
        const data = await response.json()
        setDisasters(data)
      }
    } catch (error) {
      console.error('Failed to fetch disasters:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const damages = formData.damages ? JSON.parse(formData.damages) : null

      const response = await fetch('/api/sitrep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          evacueeCount: parseInt(formData.evacueeCount) || 0,
          damages,
          disasterEventId: formData.disasterEventId === 'none' ? null : (formData.disasterEventId || null)
        })
      })

      if (response.ok) {
        toast.success('SITREP submitted successfully')
        setIsDialogOpen(false)
        setFormData({
          disasterEventId: 'none',
          evacueeCount: '',
          damages: '',
          notes: '',
          status: 'DRAFT'
        })
        fetchSITREPs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit SITREP')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800'
      case 'REVIEWED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">SITREP</h1>
          <p className="text-gray-600 mt-1">Submit daily situation reports</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create SITREP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Situation Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disasterEvent">Disaster Event (Optional)</Label>
                <Select
                  value={formData.disasterEventId}
                  onValueChange={(value) => setFormData({ ...formData, disasterEventId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select disaster event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {disasters.map((disaster) => (
                      <SelectItem key={disaster.id} value={disaster.id}>
                        {disaster.type} - {disaster.severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evacueeCount">Current Evacuee Count</Label>
                <Input
                  id="evacueeCount"
                  type="number"
                  value={formData.evacueeCount}
                  onChange={(e) => setFormData({ ...formData, evacueeCount: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="damages">Damages (JSON format)</Label>
                <Input
                  id="damages"
                  value={formData.damages}
                  onChange={(e) => setFormData({ ...formData, damages: e.target.value })}
                  placeholder='[{"type": "infrastructure", "description": "..."}]'
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Situation Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {sitreps.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No SITREPs submitted yet</p>
          ) : (
            <div className="space-y-4">
              {sitreps.map((sitrep) => (
                <div
                  key={sitrep.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold">
                      Report Date: {new Date(sitrep.reportDate).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Evacuee Count: {sitrep.evacueeCount}
                    </p>
                    {sitrep.disasterEvent && (
                      <p className="text-sm text-gray-500">
                        Disaster: {sitrep.disasterEvent.type}
                      </p>
                    )}
                    {sitrep.notes && (
                      <p className="text-sm text-gray-500 mt-1">{sitrep.notes}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sitrep.status)}`}>
                    {sitrep.status}
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

