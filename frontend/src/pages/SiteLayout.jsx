import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Toast from '../components/Toast'
import axios from '../api/axios'
import { MapPinned, CarFront, Building2, RefreshCcw, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

const SiteLayout = () => {
  const navigate = useNavigate()
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState('')
  const [layoutSpaces, setLayoutSpaces] = useState([])
  const [loading, setLoading] = useState({ sites: false, layout: false })
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchSites()
  }, [])

  useEffect(() => {
    if (selectedSite) {
      fetchLayoutSpaces(selectedSite)
    }
  }, [selectedSite])

  const fetchSites = async () => {
    try {
      setLoading(prev => ({ ...prev, sites: true }))
      const response = await axios.get('/api/sites')
      setSites(response.data)
      if (response.data.length > 0) {
        setSelectedSite(response.data[0].id)
      }
    } catch (err) {
      setError('Failed to load sites')
      setToast({ message: 'Failed to load sites', type: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, sites: false }))
    }
  }

  const fetchLayoutSpaces = async (siteId) => {
    try {
      setLoading(prev => ({ ...prev, layout: true }))
      setError('')
      const response = await axios.get(`/api/spaces?site_id=${siteId}`)
      setLayoutSpaces(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load layout')
      setToast({ message: 'Failed to load site layout', type: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, layout: false }))
    }
  }

  const getLayoutClasses = (space) => {
    if (!space.is_active || ['blocked', 'maintenance'].includes(space.status)) {
      return 'bg-slate-200 text-slate-600 border-slate-300'
    }

    if (space.category === 'ev') {
      return 'bg-blue-100 text-blue-700 border-blue-200'
    }

    if (space.category === 'disabled') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }

    if (space.category === 'visitor') {
      return 'bg-purple-100 text-purple-700 border-purple-200'
    }

    if (['occupied', 'reserved'].includes(space.status)) {
      return 'bg-red-100 text-red-700 border-red-200'
    }

    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  const getCategoryLabel = (category) => {
    const labels = {
      standard: 'Standard',
      ev: 'Electric',
      disabled: 'Disabled',
      visitor: 'Visitor'
    }
    return labels[category] || category
  }

  const getSiteName = (siteId) => {
    const site = sites.find(s => s.id === parseInt(siteId))
    return site?.name || 'Unknown Site'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reception')}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Site Layout</h1>
              <p className="mt-1 text-sm text-gray-600">Visual overview of parking spaces by site</p>
            </div>
          </div>

          <button
            onClick={() => fetchLayoutSpaces(selectedSite)}
            disabled={loading.layout}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {loading.layout ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        {/* Site Selector */}
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Site:</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              disabled={loading.sites}
              className="flex-1 max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
            >
              {loading.sites ? (
                <option>Loading sites...</option>
              ) : (
                sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))
              )}
            </select>
          </div>
        </Card>

        {/* Legend */}
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Occupied
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Unavailable
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Electric
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Disabled
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Visitor
            </span>
          </div>
        </Card>

        {/* Layout Display */}
        <Card className="p-6">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Unable to load site layout</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : loading.layout ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !layoutSpaces.length ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <MapPinned className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No parking spaces found</h3>
              <p className="mt-2 text-sm text-gray-500">The selected site does not have any parking spaces configured.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-6">
              {/* Entry */}
              <div className="mb-4 text-center">
                <div className="inline-block rounded-lg bg-emerald-500 px-6 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-md">
                  Entry
                </div>
              </div>

              {/* Parking Lot Layout */}
              <div className="relative mx-auto max-w-4xl">
                <div className="grid grid-cols-[1fr_80px_1fr] gap-4">
                  {/* Left Side Parking */}
                  <div className="space-y-3">
                    {layoutSpaces.filter((_, idx) => idx % 2 === 0).map((space) => (
                      <div
                        key={space.id}
                        className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 shadow-sm transition-all hover:shadow-md ${getLayoutClasses(space)}`}
                      >
                        <div className="flex items-center gap-2">
                          <CarFront className="h-4 w-4" />
                          <span className="text-sm font-bold">{space.bay_code}</span>
                        </div>
                        <span className="text-xs font-medium uppercase">{space.category}</span>
                      </div>
                    ))}
                  </div>

                  {/* Central Driveway */}
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="absolute inset-0 border-x-4 border-dashed border-blue-300 bg-blue-50/30"></div>
                    <div className="relative z-10 flex h-full flex-col items-center justify-center">
                      <div className="rounded-full bg-blue-500 p-3 shadow-lg">
                        <MapPinned className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Right Side Parking */}
                  <div className="space-y-3">
                    {layoutSpaces.filter((_, idx) => idx % 2 === 1).map((space) => (
                      <div
                        key={space.id}
                        className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 shadow-sm transition-all hover:shadow-md ${getLayoutClasses(space)}`}
                      >
                        <span className="text-xs font-medium uppercase">{space.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{space.bay_code}</span>
                          <CarFront className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exit */}
              <div className="mt-4 text-center">
                <div className="inline-block rounded-lg bg-rose-500 px-6 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-md">
                  Exit
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default SiteLayout
