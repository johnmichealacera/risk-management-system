'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Download } from 'lucide-react'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('evacuees')
  const [barangayId, setBarangayId] = useState('')
  const [barangays, setBarangays] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchBarangays()
  }, [])

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

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        format
      })
      if (barangayId) {
        params.append('barangayId', barangayId)
      }

      const response = await fetch(`/api/reports/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${reportType}-${new Date().toISOString()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Report exported successfully')
      } else {
        toast.error('Failed to export report')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and export reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evacuees">Evacuees Report</SelectItem>
                  <SelectItem value="relief">Relief Distribution Report</SelectItem>
                  <SelectItem value="sitrep">SITREP Report</SelectItem>
                  <SelectItem value="disasters">Disaster Events Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Barangay (Optional)</label>
              <Select value={barangayId || 'all'} onValueChange={(value) => setBarangayId(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Barangays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Barangays</SelectItem>
                  {barangays.map((barangay) => (
                    <SelectItem key={barangay.id} value={barangay.id}>
                      {barangay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleExport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={() => handleExport('excel')} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

