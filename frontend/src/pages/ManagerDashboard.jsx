import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Toast from '../components/Toast'
import axios from '../api/axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Building, Car, AlertTriangle, TrendingUp, CheckCircle, XCircle, Lock, RefreshCcw, Ban, Loader2, Eye } from 'lucide-react'

const ManagerDashboard = () => {
  const [sites, setSites] = useState([])
  const [siteStats, setSiteStats] = useState([])
  const [bookings, setBookings] = useState([])
  const [alerts, setAlerts] = useState([])
  const [utilizationData, setUtilizationData] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleExportReport = async () => {
    try {
      const response = await axios.get('/api/reports/export/bookings', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bookings_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setToast({ message: 'Report exported successfully', type: 'success' })
    } catch (error) {
      console.error('Export error:', error)
      setToast({ message: 'Failed to export report', type: 'error' })
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [sitesRes, utilizationRes, bookingsRes, alertsRes] = await Promise.all([
        axios.get('/api/sites'),
        axios.get('/api/reports/utilization'),
        axios.get('/api/bookings'),
        axios.get('/api/reports/alerts')
      ])

      setSites(sitesRes.data)
      setUtilizationData(utilizationRes.data.sites)
      setBookings(bookingsRes.data)
      setAlerts(alertsRes.data.alerts)

      const statsPromises = sitesRes.data.map(site => 
        axios.get(`/api/sites/${site.id}/stats`)
      )
      const statsResults = await Promise.all(statsPromises)
      setSiteStats(statsResults.map(res => res.data))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setToast({ message: 'Failed to load dashboard data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveBooking = async (bookingId) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/approve`)
      setToast({ message: 'Booking approved successfully', type: 'success' })
      fetchDashboardData()
    } catch (error) {
      setToast({ message: 'Error approving booking', type: 'error' })
    }
  }

  const handleRejectBooking = async (bookingId) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/reject`)
      setToast({ message: 'Booking rejected successfully', type: 'success' })
      fetchDashboardData()
    } catch (error) {
      setToast({ message: 'Error rejecting booking', type: 'error' })
    }
  }

  const handleBlockSpace = async (spaceId) => {
    try {
      await axios.patch(`/api/spaces/${spaceId}/block`)
      setToast({ message: 'Space blocked successfully', type: 'success' })
      fetchDashboardData()
    } catch (error) {
      setToast({ message: 'Error blocking space', type: 'error' })
    }
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingId(bookingId)
      await axios.patch(`/api/bookings/${bookingId}/cancel`)
      setToast({ message: 'Booking cancelled successfully', type: 'success' })
      fetchDashboardData()
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Error cancelling booking', type: 'error' })
    } finally {
      setCancellingId(null)
    }
  }

  const totalSpaces = siteStats.reduce((sum, stat) => sum + stat.total_spaces, 0)
  const totalAvailable = siteStats.reduce((sum, stat) => sum + stat.available, 0)
  const totalOccupied = siteStats.reduce((sum, stat) => sum + stat.occupied, 0)
  const totalReserved = siteStats.reduce((sum, stat) => sum + stat.reserved, 0)
  const totalBlocked = siteStats.reduce((sum, stat) => sum + stat.blocked, 0)

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facilities Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Centralized control for all parking sites</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spaces</p>
                <p className="text-3xl font-bold text-gray-900">{totalSpaces}</p>
              </div>
              <Building className="h-10 w-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available</p>
                <p className="text-3xl font-bold text-green-600">{totalAvailable}</p>
              </div>
              <Car className="h-10 w-10 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Occupied</p>
                <p className="text-3xl font-bold text-blue-600">{totalOccupied}</p>
              </div>
              <Car className="h-10 w-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reserved</p>
                <p className="text-3xl font-bold text-yellow-600">{totalReserved}</p>
              </div>
              <Car className="h-10 w-10 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Blocked</p>
                <p className="text-3xl font-bold text-red-600">{totalBlocked}</p>
              </div>
              <Lock className="h-10 w-10 text-red-600" />
            </div>
          </Card>
        </div>

        {alerts.length > 0 && (
          <Card className="p-6 mb-8 border-l-4 border-yellow-500">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              System Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  alert.severity === 'high' ? 'bg-red-50 border border-red-200' :
                  'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.site_name}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Site Utilization</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="site_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="available" fill="#10B981" name="Available" />
                <Bar dataKey="occupied" fill="#3B82F6" name="Occupied" />
                <Bar dataKey="reserved" fill="#F59E0B" name="Reserved" />
                <Bar dataKey="blocked" fill="#EF4444" name="Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Site Comparison</h2>
            <div className="space-y-4">
              {siteStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{stat.site_name}</span>
                    <span className="text-sm text-gray-600">
                      {stat.available}/{stat.total_spaces} available
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(stat.occupied / stat.total_spaces) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <button onClick={handleExportReport} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Export Report
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Bay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.slice(0, 15).map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.customer_company || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.site_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.bay_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.booking_date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.start_time}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'active' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveBooking(booking.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {booking.status === 'active' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            title="Cancel Booking"
                          >
                            {cancellingId === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ManagerDashboard
