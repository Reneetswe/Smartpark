import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Toast from '../components/Toast'
import axios from '../api/axios'
import { MapPinned, CarFront, Building2, RefreshCcw, ArrowLeft, Loader2, AlertCircle, X, Calendar, Clock } from 'lucide-react'

const SiteLayout = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const filterSiteId = searchParams.get('site_id')
  const filterCategory = searchParams.get('category')
  const filterDate = searchParams.get('booking_date') || new Date().toISOString().split('T')[0]
  const filterStartTime = searchParams.get('start_time') || '08:00'
  const filterEndTime = searchParams.get('end_time') || '17:00'

  const [sites, setSites] = useState([])
  const [allSpaces, setAllSpaces] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_company: '',
    booking_date: filterDate,
    start_time: filterStartTime,
    end_time: filterEndTime
  })
  const [loading, setLoading] = useState({ sites: false, spaces: false, booking: false })
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchSites()
    fetchAllSpaces()
    fetchCategories()
  }, [])

  const fetchSites = async () => {
    try {
      setLoading(prev => ({ ...prev, sites: true }))
      const response = await axios.get('/api/sites')
      setSites(response.data)
    } catch (err) {
      setError('Failed to load sites')
      setToast({ message: 'Failed to load sites', type: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, sites: false }))
    }
  }

  const fetchAllSpaces = async () => {
    try {
      setLoading(prev => ({ ...prev, spaces: true }))
      setError('')
      const response = await axios.get('/api/spaces')
      setAllSpaces(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load parking spaces')
      setToast({ message: 'Failed to load parking spaces', type: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, spaces: false }))
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const handleSpaceClick = (space) => {
    if (space.status === 'available' && space.is_active) {
      setSelectedSpace(space)
      setShowBookingModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowBookingModal(false)
    setSelectedSpace(null)
    setBookingForm({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_company: '',
      booking_date: new Date().toISOString().split('T')[0],
      start_time: '08:00',
      end_time: '17:00'
    })
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!selectedSpace) return

    try {
      setLoading(prev => ({ ...prev, booking: true }))
      await axios.post('/api/bookings', {
        ...bookingForm,
        site_id: selectedSpace.site_id,
        space_id: selectedSpace.id,
        booking_type: selectedSpace.category
      })
      setToast({ message: 'Booking created successfully!', type: 'success' })
      handleCloseModal()
      fetchAllSpaces()
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Failed to create booking', type: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, booking: false }))
    }
  }

  const getCategoryColor = (space) => {
    if (space.category_id) {
      const cat = categories.find(c => c.id === space.category_id)
      return cat?.color_code || '#3B82F6'
    }
    // Fallback to old category string
    const colorMap = {
      'standard': '#3B82F6',
      'disabled': '#EF4444',
      'ev': '#10B981',
      'visitor': '#F59E0B',
      'vip': '#8B5CF6'
    }
    return colorMap[space.category?.toLowerCase()] || '#3B82F6'
  }

  const getSpaceStyle = (space) => {
    const categoryColor = getCategoryColor(space)
    
    if (!space.is_active || ['blocked', 'maintenance'].includes(space.status)) {
      // Blocked/Maintenance: Very dark with low opacity
      return { 
        backgroundColor: categoryColor, 
        color: '#FFFFFF', 
        cursor: 'not-allowed', 
        opacity: 0.3,
        filter: 'grayscale(50%)'
      }
    }
    if (['occupied', 'reserved'].includes(space.status)) {
      // Occupied/Reserved: Show category color but darker and with diagonal stripes
      return { 
        backgroundColor: categoryColor, 
        color: '#FFFFFF', 
        cursor: 'not-allowed', 
        opacity: 0.5,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
      }
    }
    // Available: Full bright category color
    return { 
      backgroundColor: categoryColor, 
      color: '#FFFFFF', 
      cursor: 'pointer' 
    }
  }

  const getSpaceClasses = (space) => {
    if (!space.is_active || ['blocked', 'maintenance'].includes(space.status)) {
      return 'cursor-not-allowed'
    }
    if (['occupied', 'reserved'].includes(space.status)) {
      return 'cursor-not-allowed'
    }
    return 'hover:ring-2 hover:ring-white hover:shadow-lg cursor-pointer transform hover:scale-105 transition-all'
  }

  const groupSpacesForSite = (siteId) => {
    let siteSpaces = allSpaces
      .filter(s => s.site_id === siteId)
      .sort((a, b) => (a.bay_code || '').localeCompare(b.bay_code || '', undefined, { numeric: true }))

    if (filterCategory) {
      siteSpaces = siteSpaces.filter(s => s.category === filterCategory)
    }

    const byCategory = {}
    const categoryLabels = {
      ev: 'EV Charging',
      standard: 'Standard',
      disabled: 'Disabled',
      visitor: 'Visitor'
    }

    siteSpaces.forEach(space => {
      const cat = space.category || 'standard'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(space)
    })

    const blocks = []
    const BLOCK_SIZE = 20
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let letterIdx = 0

    Object.entries(byCategory).forEach(([cat, spaces]) => {
      for (let i = 0; i < spaces.length; i += BLOCK_SIZE) {
        const chunk = spaces.slice(i, i + BLOCK_SIZE)
        const label = letters[letterIdx % 26]
        blocks.push({
          key: `${cat}-${i}`,
          label: `${label} BLOCK`,
          subtitle: categoryLabels[cat] || cat,
          spaces: chunk
        })
        letterIdx++
      }
    })

    return blocks
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <h1 className="text-2xl font-bold text-gray-900">Parking Lot</h1>
              <p className="mt-1 text-sm text-gray-600">Click on available parking to book</p>
            </div>
          </div>

          <button
            onClick={fetchAllSpaces}
            disabled={loading.spaces}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {loading.spaces ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        {/* Filter indicator + Legend */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900">Legend:</span>
              <span className="flex items-center gap-2">
                <span className="h-5 w-8 rounded border border-white" style={{ backgroundColor: '#3B82F6' }}></span>
                <span className="text-gray-700">Available</span>
              </span>
              <span className="flex items-center gap-2">
                <span 
                  className="h-5 w-8 rounded border border-white" 
                  style={{ 
                    backgroundColor: '#3B82F6', 
                    opacity: 0.5,
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,.2) 4px, rgba(255,255,255,.2) 8px)'
                  }}
                ></span>
                <span className="text-gray-700">Occupied/Reserved</span>
              </span>
            </div>
            {categories.length > 0 && (
              <div className="flex items-center gap-3 border-l border-gray-300 pl-6">
                <span className="text-xs font-medium text-gray-600">Categories:</span>
                {categories.map(cat => (
                  <span key={cat.id} className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded border border-white" style={{ backgroundColor: cat.color_code }}></span>
                    <span className="text-xs text-gray-700">{cat.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {filterSiteId && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
              <span>Filtered: {sites.find(s => s.id === parseInt(filterSiteId))?.name || 'Site'}</span>
              {filterCategory && <span>| {filterCategory}</span>}
              <span>| {filterDate}</span>
              <span>| {filterStartTime} - {filterEndTime}</span>
              <button onClick={() => navigate('/reception/layout')} className="ml-1 rounded-full p-0.5 hover:bg-blue-100">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* All Sites Layout */}
        <div className="space-y-8">
          {loading.spaces ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Unable to load parking spaces</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : (
            (filterSiteId ? sites.filter(s => s.id === parseInt(filterSiteId)) : sites).map(site => {
              const blocks = groupSpacesForSite(site.id)
              
              if (!blocks.length) return null

              return (
                <Card key={site.id} className="p-6">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">{site.name}</h2>
                  
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                      {blocks.map(block => (
                        <div key={block.key} className="flex-shrink-0 rounded-lg border border-gray-200 bg-white p-4" style={{ width: '180px' }}>
                          <h4 className="text-center text-sm font-bold text-gray-900">{block.label}</h4>
                          <p className="mb-3 text-center text-xs text-gray-500">{block.subtitle}</p>
                          
                          <div className="grid grid-cols-2 gap-1.5">
                            {block.spaces.map(space => (
                              <button
                                key={space.id}
                                onClick={() => handleSpaceClick(space)}
                                disabled={space.status !== 'available' || !space.is_active}
                                style={getSpaceStyle(space)}
                                className={`rounded border border-white px-1 py-1.5 text-[10px] font-semibold transition-all ${getSpaceClasses(space)}`}
                              >
                                {space.bay_code}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-bold text-gray-900">Book Parking Space</h3>
              <button onClick={handleCloseModal} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleBooking} className="p-4 space-y-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-900">Space: {selectedSpace.bay_code}</p>
                <p className="text-xs text-blue-700">Site: {sites.find(s => s.id === selectedSpace.site_id)?.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={bookingForm.customer_name}
                  onChange={(e) => setBookingForm({...bookingForm, customer_name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={bookingForm.customer_email}
                  onChange={(e) => setBookingForm({...bookingForm, customer_email: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={bookingForm.customer_phone}
                  onChange={(e) => setBookingForm({...bookingForm, customer_phone: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                <input
                  type="text"
                  value={bookingForm.customer_company}
                  onChange={(e) => setBookingForm({...bookingForm, customer_company: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.booking_date}
                    onChange={(e) => setBookingForm({...bookingForm, booking_date: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={bookingForm.start_time}
                    onChange={(e) => setBookingForm({...bookingForm, start_time: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={bookingForm.end_time}
                  onChange={(e) => setBookingForm({...bookingForm, end_time: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.booking}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading.booking ? 'Booking...' : 'Book Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default SiteLayout
