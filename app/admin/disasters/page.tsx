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

interface DisasterEvent {
  id: string
  type: string
  severity: string
  status: string
  startDate: string
  endDate?: string
  description?: string
  affectedBarangays: Array<{
    barangay: {
      name: string
    }
  }>
}

interface Barangay {
  id: string
  name: string
}

export default function DisastersPage() {
  const [disasters, setDisasters] = useState<DisasterEvent[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    type: '',
    severity: '',
    startDate: '',
    endDate: '',
    description: '',
    affectedBarangays: [] as string[]
  })

  useEffect(() => {
    fetchDisasters()
    fetchBarangays()
  }, [])

  const fetchDisasters = async () => {
    try {
      const response = await fetch('/api/disasters')
      if (response.ok) {
        const data = await response.json()
        setDisasters(data)
      }
    } catch (error) {
      toast.error('Failed to fetch disasters')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBarangays = async () => {
    try {
      const response = await fetch('/api/barangays')
      if (response.ok) {
        const data = await response.json()
        setBarangays(data)
      }
    } catch (error) {
      console.error('Failed to fetch barangays:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/disasters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Disaster event created successfully')
        setIsDialogOpen(false)
        setFormData({
          type: '',
          severity: '',
          startDate: '',
          endDate: '',
          description: '',
          affectedBarangays: []
        })
        fetchDisasters()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create disaster event')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-100 text-red-800'
      case 'RESOLVED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED':
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
          <h1 className="text-3xl font-bold text-gray-900">Disaster Events</h1>
          <p className="text-gray-600 mt-1">Manage disaster events across all barangays</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Disaster Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Disaster Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Disaster Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TYPHOON">Typhoon</SelectItem>
                      <SelectItem value="STORM">Storm</SelectItem>
                      <SelectItem value="FLOOD">Flood</SelectItem>
                      <SelectItem value="EARTHQUAKE">Earthquake</SelectItem>
                      <SelectItem value="FIRE">Fire</SelectItem>
                      <SelectItem value="LANDSLIDE">Landslide</SelectItem>
                      <SelectItem value="VOLCANIC_ERUPTION">Volcanic Eruption</SelectItem>
                      <SelectItem value="DROUGHT">Drought</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity/Alert Level</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIGNAL_1">Signal 1</SelectItem>
                      <SelectItem value="SIGNAL_2">Signal 2</SelectItem>
                      <SelectItem value="SIGNAL_3">Signal 3</SelectItem>
                      <SelectItem value="SIGNAL_4">Signal 4</SelectItem>
                      <SelectItem value="SIGNAL_5">Signal 5</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the disaster"
                />
              </div>
              <div className="space-y-2">
                <Label>Affected Barangays</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                  {barangays.map((barangay) => (
                    <label key={barangay.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.affectedBarangays.includes(barangay.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              affectedBarangays: [...formData.affectedBarangays, barangay.id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              affectedBarangays: formData.affectedBarangays.filter(id => id !== barangay.id)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{barangay.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Event</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Disaster Events</CardTitle>
        </CardHeader>
        <CardContent>
          {disasters.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No disaster events</p>
          ) : (
            <div className="space-y-4">
              {disasters.map((disaster) => (
                <div
                  key={disaster.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{disaster.type}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(disaster.status)}`}>
                          {disaster.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Severity: {disaster.severity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(disaster.startDate).toLocaleString()}
                        {disaster.endDate && ` | Ended: ${new Date(disaster.endDate).toLocaleString()}`}
                      </p>
                      {disaster.description && (
                        <p className="text-sm text-gray-500 mt-2">{disaster.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Affected Barangays: {disaster.affectedBarangays.map(ab => ab.barangay.name).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

