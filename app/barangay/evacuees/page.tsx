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

interface Evacuee {
  id: string
  name: string
  age: number
  gender: string
  status: string
  entryDate: string
  evacuationCenter?: {
    name: string
  }
  barangay: {
    name: string
  }
}

interface EvacuationCenter {
  id: string
  name: string
  capacity: number
  currentOccupancy: number
}

export default function EvacueesPage() {
  const [evacuees, setEvacuees] = useState<Evacuee[]>([])
  const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenter[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    evacuationCenterId: '',
    contactInfo: '',
    specialNeeds: [] as string[]
  })

  useEffect(() => {
    fetchEvacuees()
    fetchEvacuationCenters()
  }, [])

  const fetchEvacuees = async () => {
    try {
      const response = await fetch('/api/evacuees')
      if (response.ok) {
        const data = await response.json()
        setEvacuees(data)
      }
    } catch (error) {
      toast.error('Failed to fetch evacuees')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEvacuationCenters = async () => {
    try {
      const response = await fetch('/api/evacuation-centers')
      if (response.ok) {
        const data = await response.json()
        setEvacuationCenters(data)
      }
    } catch (error) {
      console.error('Failed to fetch evacuation centers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/evacuees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Evacuee registered successfully')
        setIsDialogOpen(false)
        setFormData({
          name: '',
          age: '',
          gender: '',
          evacuationCenterId: '',
          contactInfo: '',
          specialNeeds: []
        })
        fetchEvacuees()
        fetchEvacuationCenters()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to register evacuee')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evacuees</h1>
          <p className="text-gray-600 mt-1">Manage evacuees in your barangay</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register Evacuee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Evacuee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evacuationCenter">Evacuation Center</Label>
                  <Select
                    value={formData.evacuationCenterId}
                    onValueChange={(value) => setFormData({ ...formData, evacuationCenterId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select center" />
                    </SelectTrigger>
                    <SelectContent>
                      {evacuationCenters.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name} ({center.currentOccupancy}/{center.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  placeholder="Phone number or email"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Register</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Evacuees</CardTitle>
        </CardHeader>
        <CardContent>
          {evacuees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No evacuees registered yet</p>
          ) : (
            <div className="space-y-4">
              {evacuees.map((evacuee) => (
                <div
                  key={evacuee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold">{evacuee.name}</h3>
                    <p className="text-sm text-gray-600">
                      Age: {evacuee.age} | Gender: {evacuee.gender} | Status: {evacuee.status}
                    </p>
                    {evacuee.evacuationCenter && (
                      <p className="text-sm text-gray-500">
                        Center: {evacuee.evacuationCenter.name}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(evacuee.entryDate).toLocaleDateString()}
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

