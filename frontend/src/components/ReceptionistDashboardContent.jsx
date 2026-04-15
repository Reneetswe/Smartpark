import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Ban,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MapPinned,
  Phone,
  RefreshCcw,
  Search,
  X,
} from 'lucide-react'
import Navbar from './Navbar'
import Card from './Card'
import Toast from './Toast'
import axios from '../api/axios'

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'standard', label: 'Standard' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'ev', label: 'Electric Charging' },
  { value: 'visitor', label: 'Visitor Bay' },
]

const INITIAL_BOOKING_FORM = {
  customer_name: '',
  customer_phone: '',
  customer_company: '',
  customer_email: '',
  customer_employee_number: '',
}

const getToday = () => new Date().toISOString().split('T')[0]

const toMinutes = (value) => {
  if (!value) {
    return 0
  }

  const [hours, minutes] = value.split(':').map(Number)
  return (hours * 60) + minutes
}

const formatDate = (value) => {
  if (!value) {
    return 'Not set'
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString()
}

const formatTime = (value) => {
  if (!value) {
    return '--:--'
  }

  return value.slice(0, 5)
}

const formatDateTimeWindow = (date, start, end) => `${formatDate(date)} · ${formatTime(start)} - ${formatTime(end)}`

const getDurationLabel = (start, end) => {
  const minutes = Math.max(toMinutes(end) - toMinutes(start), 0)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours && remainingMinutes) {
    return `${hours}h ${remainingMinutes}m`
  }

  if (hours) {
    return `${hours}h`
  }

  return `${remainingMinutes}m`
}

const compareBayCodes = (left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })

const ReceptionistDashboardContent = () => {
  const [sites, setSites] = useState([])
  const [bookings, setBookings] = useState([])
  const [availableSpaceCount, setAvailableSpaceCount] = useState(0)
  const [layoutSpaces, setLayoutSpaces] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [viewBooking, setViewBooking] = useState(null)
  const [searched, setSearched] = useState(false)
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState(null)
  const [toast, setToast] = useState(null)
  const [searchForm, setSearchForm] = useState({
    site_id: '',
    booking_date: getToday(),
    start_time: '08:00',
    end_time: '17:00',
    category: '',
  })
  const [bookingForm, setBookingForm] = useState(INITIAL_BOOKING_FORM)
  const [resultControls, setResultControls] = useState({
    sort: 'bay',
    category: '',
  })
  const [loading, setLoading] = useState({
    initial: true,
    sites: false,
    bookings: false,
    summary: false,
    results: false,
    layout: false,
    creating: false,
    cancellingId: null,
  })
  const [errors, setErrors] = useState({
    sites: '',
    bookings: '',
    results: '',
    layout: '',
  })

  const siteMap = useMemo(() => Object.fromEntries(sites.map((site) => [site.id, site])), [sites])
  const availableResultIds = useMemo(() => new Set(searchResults.map((space) => space.id)), [searchResults])

  const summary = useMemo(() => {
    const today = getToday()

    return {
      availableSpacesToday: availableSpaceCount,
      activeBookingsToday: bookings.filter((booking) => booking.booking_date === today && booking.status === 'active').length,
      cancelledBookingsToday: bookings.filter((booking) => booking.booking_date === today && booking.status === 'cancelled').length,
    }
  }, [availableSpaceCount, bookings])

  const recentBookings = useMemo(() => bookings.slice(0, 10), [bookings])

  const filteredResults = useMemo(() => {
    let items = [...searchResults]

    if (resultControls.category) {
      items = items.filter((space) => space.category === resultControls.category)
    }

    if (resultControls.sort === 'bay') {
      items.sort((a, b) => compareBayCodes(a.bay_code, b.bay_code))
    }

    return items
  }, [resultControls.category, resultControls.sort, searchResults])

  const groupedLayoutSpaces = useMemo(() => {
    const groups = CATEGORY_OPTIONS.filter((option) => option.value).map((option) => ({
      key: option.value,
      label: option.label,
      spaces: layoutSpaces
        .filter((space) => space.category === option.value)
        .sort((a, b) => compareBayCodes(a.bay_code, b.bay_code)),
    }))

    const uncategorized = layoutSpaces
      .filter((space) => !CATEGORY_OPTIONS.some((option) => option.value === space.category))
      .sort((a, b) => compareBayCodes(a.bay_code, b.bay_code))

    if (uncategorized.length) {
      groups.push({ key: 'other', label: 'Other', spaces: uncategorized })
    }

    return groups
  }, [layoutSpaces])

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading((current) => ({ ...current, initial: true }))
      await Promise.all([fetchSites(), fetchBookings(), fetchAvailableSpaceSummary()])
      setLoading((current) => ({ ...current, initial: false }))
    }

    loadDashboard()
  }, [])

  useEffect(() => {
    if (!searchForm.site_id) {
      setLayoutSpaces([])
      setErrors((current) => ({ ...current, layout: '' }))
      return
    }

    fetchLayoutSpaces(searchForm.site_id)
  }, [searchForm.site_id])

  const fetchSites = async () => {
    setLoading((current) => ({ ...current, sites: true }))
    setErrors((current) => ({ ...current, sites: '' }))

    try {
      const response = await axios.get('/api/sites')
      setSites(response.data)
    } catch (error) {
      setSites([])
      setErrors((current) => ({ ...current, sites: error.response?.data?.detail || 'Unable to load sites.' }))
    } finally {
      setLoading((current) => ({ ...current, sites: false }))
    }
  }

  const fetchBookings = async () => {
    setLoading((current) => ({ ...current, bookings: true }))
    setErrors((current) => ({ ...current, bookings: '' }))

    try {
      const response = await axios.get('/api/bookings')
      setBookings(response.data)
    } catch (error) {
      setBookings([])
      setErrors((current) => ({ ...current, bookings: error.response?.data?.detail || 'Unable to load bookings.' }))
    } finally {
      setLoading((current) => ({ ...current, bookings: false }))
    }
  }

  const fetchAvailableSpaceSummary = async () => {
    setLoading((current) => ({ ...current, summary: true }))

    try {
      const response = await axios.get('/api/spaces', { params: { status: 'available' } })
      setAvailableSpaceCount(response.data.length)
    } catch (error) {
      setAvailableSpaceCount(0)
      setToast({ message: error.response?.data?.detail || 'Unable to load dashboard counts.', type: 'error' })
    } finally {
      setLoading((current) => ({ ...current, summary: false }))
    }
  }

  const fetchLayoutSpaces = async (siteId) => {
    if (!siteId) {
      setLayoutSpaces([])
      return
    }

    setLoading((current) => ({ ...current, layout: true }))
    setErrors((current) => ({ ...current, layout: '' }))

    try {
      const response = await axios.get('/api/spaces', { params: { site_id: Number(siteId) } })
      setLayoutSpaces(response.data)
    } catch (error) {
      setLayoutSpaces([])
      setErrors((current) => ({ ...current, layout: error.response?.data?.detail || 'Unable to load the site layout.' }))
    } finally {
      setLoading((current) => ({ ...current, layout: false }))
    }
  }

  const validateSearchForm = () => {
    if (!searchForm.site_id) {
      setToast({ message: 'Select a site before searching.', type: 'warning' })
      return false
    }

    if (!searchForm.booking_date || !searchForm.start_time || !searchForm.end_time) {
      setToast({ message: 'Date, start time, and end time are required.', type: 'warning' })
      return false
    }

    if (toMinutes(searchForm.end_time) <= toMinutes(searchForm.start_time)) {
      setToast({ message: 'End time must be after the start time.', type: 'warning' })
      return false
    }

    return true
  }

  const runSearch = async ({ silent = false } = {}) => {
    if (!validateSearchForm()) {
      return false
    }

    setLoading((current) => ({ ...current, results: true }))
    setErrors((current) => ({ ...current, results: '' }))
    setSearched(true)

    try {
      const payload = {
        site_id: Number(searchForm.site_id),
        booking_date: searchForm.booking_date,
        start_time: searchForm.start_time,
        end_time: searchForm.end_time,
      }

      if (searchForm.category) {
        payload.category = searchForm.category
      }

      const response = await axios.post('/api/spaces/search', payload)
      setSearchResults(response.data)

      if (!silent) {
        setToast({
          message: response.data.length ? `Found ${response.data.length} available bay${response.data.length > 1 ? 's' : ''}.` : 'No available bays found for this time window.',
          type: response.data.length ? 'success' : 'warning',
        })
      }

      return true
    } catch (error) {
      setSearchResults([])
      setErrors((current) => ({ ...current, results: error.response?.data?.detail || 'Unable to search available spaces.' }))

      if (!silent) {
        setToast({ message: error.response?.data?.detail || 'Unable to search available spaces.', type: 'error' })
      }

      return false
    } finally {
      setLoading((current) => ({ ...current, results: false }))
    }
  }

  const handleSearchSubmit = async (event) => {
    event.preventDefault()
    await runSearch()
  }

  const handleOpenBookingModal = (space) => {
    setSelectedSpace(space)
    setBookingForm(INITIAL_BOOKING_FORM)
    setShowBookingModal(true)
  }

  const handleCloseBookingModal = () => {
    setSelectedSpace(null)
    setShowBookingModal(false)
    setBookingForm(INITIAL_BOOKING_FORM)
  }

  const handleCreateBooking = async (event) => {
    event.preventDefault()

    if (!selectedSpace) {
      setToast({ message: 'Select a parking bay before booking.', type: 'warning' })
      return
    }

    if (!bookingForm.customer_name.trim()) {
      setToast({ message: 'Name is required.', type: 'warning' })
      return
    }

    if (!bookingForm.customer_phone.trim()) {
      setToast({ message: 'Contact number is required.', type: 'warning' })
      return
    }

    if (!validateSearchForm()) {
      return
    }

    setLoading((current) => ({ ...current, creating: true }))

    try {
      const response = await axios.post('/api/bookings', {
        customer_name: bookingForm.customer_name.trim(),
        customer_email: bookingForm.customer_email.trim() || null,
        customer_phone: bookingForm.customer_phone.trim(),
        customer_company: bookingForm.customer_company.trim() || null,
        site_id: Number(searchForm.site_id),
        space_id: selectedSpace.id,
        booking_date: searchForm.booking_date,
        start_time: searchForm.start_time,
        end_time: searchForm.end_time,
        booking_type: selectedSpace.category,
      })

      setLastConfirmedBooking({
        ...response.data,
        duration: getDurationLabel(searchForm.start_time, searchForm.end_time),
        employee_number: bookingForm.customer_employee_number.trim(),
      })
      handleCloseBookingModal()
      setToast({
        message: `Booking confirmed: ${response.data.booking_reference || `#${response.data.id}`}`,
        type: 'success',
      })
      await fetchBookings()
      await fetchAvailableSpaceSummary()
      await runSearch({ silent: true })
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Unable to create booking.', type: 'error' })
    } finally {
      setLoading((current) => ({ ...current, creating: false }))
    }
  }

  const handleCancelBooking = async (bookingId) => {
    setLoading((current) => ({ ...current, cancellingId: bookingId }))

    try {
      await axios.patch(`/api/bookings/${bookingId}/cancel`)
      setToast({ message: 'Booking cancelled successfully.', type: 'success' })
      await fetchBookings()
      await fetchAvailableSpaceSummary()

      if (searched) {
        await runSearch({ silent: true })
      }
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Unable to cancel booking.', type: 'error' })
    } finally {
      setLoading((current) => ({ ...current, cancellingId: null }))
    }
  }

  const getSiteName = (siteId) => siteMap[siteId]?.name || `Site ${siteId}`

  const getCategoryLabel = (category) => CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category

  const getStatusBadgeClasses = (status) => {
    if (status === 'cancelled') {
      return 'bg-red-100 text-red-700 border-red-200'
    }

    if (status === 'active') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }

    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const getLayoutClasses = (space) => {
    if (!space.is_active || ['blocked', 'maintenance'].includes(space.status)) {
      return 'bg-slate-200 text-slate-600 border-slate-300'
    }

    if (searched && Number(searchForm.site_id) === space.site_id && availableResultIds.has(space.id)) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }

    if (space.category === 'ev') {
      return 'bg-blue-100 text-blue-700 border-blue-200'
    }

    if (space.category === 'disabled') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }

    if (space.category === 'visitor') {
      return 'bg-purple-100 text-purple-700 border-purple-200'
    }

    if (['occupied', 'reserved'].includes(space.status)) {
      return 'bg-red-100 text-red-700 border-red-200'
    }

    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  const isBusy = loading.initial && !sites.length && !bookings.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Receptionist Admin</p>
            <h1 className="text-3xl font-bold text-gray-900">Receptionist Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage bookings, assist staff and visitors, and monitor parking availability.</p>
          </div>

          <button
            onClick={() => {
              fetchSites()
              fetchBookings()
              fetchAvailableSpaceSummary()
              if (searchForm.site_id) {
                fetchLayoutSpaces(searchForm.site_id)
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh dashboard
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Available Spaces Today',
              value: summary.availableSpacesToday,
              icon: CarFront,
              tone: 'text-emerald-600 bg-emerald-50',
            },
            {
              title: 'Active Bookings Today',
              value: summary.activeBookingsToday,
              icon: CheckCircle2,
              tone: 'text-blue-600 bg-blue-50',
            },
            {
              title: 'Cancelled Bookings Today',
              value: summary.cancelledBookingsToday,
              icon: Ban,
              tone: 'text-red-600 bg-red-50',
            },
          ].map((card) => {
            const Icon = card.icon

            return (
              <Card key={card.title} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">{loading.summary && card.title === 'Available Spaces Today' ? '...' : card.value}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${card.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSearchSubmit} className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.7fr_0.7fr_0.9fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Site</label>
              <select
                value={searchForm.site_id}
                onChange={(event) => setSearchForm((current) => ({ ...current, site_id: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Date</label>
              <input
                type="date"
                value={searchForm.booking_date}
                onChange={(event) => setSearchForm((current) => ({ ...current, booking_date: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Start Time</label>
              <input
                type="time"
                value={searchForm.start_time}
                onChange={(event) => setSearchForm((current) => ({ ...current, start_time: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">End Time</label>
              <input
                type="time"
                value={searchForm.end_time}
                onChange={(event) => setSearchForm((current) => ({ ...current, end_time: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
              <select
                value={searchForm.category}
                onChange={(event) => setSearchForm((current) => ({ ...current, category: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading.results || loading.sites}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {loading.results ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </button>
            </div>
          </form>
        </Card>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8">
            <Card className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Available Spaces</h2>
                  <p className="mt-1 text-sm text-gray-500">Search-first workflow with live bay availability from the backend.</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    value={resultControls.sort}
                    onChange={(event) => setResultControls((current) => ({ ...current, sort: event.target.value }))}
                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="bay">Sort by bay number</option>
                  </select>

                  <select
                    value={resultControls.category}
                    onChange={(event) => setResultControls((current) => ({ ...current, category: event.target.value }))}
                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={`result-${option.label}`} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setResultControls({ sort: 'bay', category: '' })}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Clear filters
                  </button>
                </div>
              </div>

              <div className="mt-5">
                {errors.results ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-semibold">Unable to load search results</p>
                        <p className="mt-1">{errors.results}</p>
                        <button onClick={() => runSearch()} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700">
                          <RefreshCcw className="h-4 w-4" />
                          Retry search
                        </button>
                      </div>
                    </div>
                  </div>
                ) : loading.results ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="h-4 w-24 rounded bg-gray-200" />
                        <div className="mt-4 h-3 w-36 rounded bg-gray-200" />
                        <div className="mt-2 h-3 w-28 rounded bg-gray-200" />
                        <div className="mt-6 h-10 rounded-xl bg-gray-200" />
                      </div>
                    ))}
                  </div>
                ) : !searched ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <Search className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">Start with a live availability search</h3>
                    <p className="mt-2 text-sm text-gray-500">Choose a site, date, time window, and parking category to see real available bays.</p>
                  </div>
                ) : !filteredResults.length ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <CarFront className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No spaces available</h3>
                    <p className="mt-2 text-sm text-gray-500">No real bays matched the selected site, date, time range, and category.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredResults.map((space) => (
                      <div key={space.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Bay Number</p>
                            <h3 className="mt-2 text-xl font-bold text-gray-900">{space.bay_code}</h3>
                          </div>
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Available</span>
                        </div>

                        <div className="mt-5 grid gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" /> {getSiteName(space.site_id)}</div>
                          <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-gray-400" /> {getCategoryLabel(space.category)}</div>
                          <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-gray-400" /> {formatDateTimeWindow(searchForm.booking_date, searchForm.start_time, searchForm.end_time)}</div>
                        </div>

                        <button
                          onClick={() => handleOpenBookingModal(space)}
                          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
                  <p className="mt-1 text-sm text-gray-500">Live bookings from the database, updated after every booking or cancellation.</p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                {errors.bookings ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    <p className="font-semibold">Unable to load recent bookings</p>
                    <p className="mt-1">{errors.bookings}</p>
                    <button onClick={fetchBookings} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700">
                      <RefreshCcw className="h-4 w-4" />
                      Retry
                    </button>
                  </div>
                ) : loading.bookings && !recentBookings.length ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                  </div>
                ) : !recentBookings.length ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <CalendarDays className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No bookings yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Bookings created by the receptionist will appear here immediately.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        <th className="px-4 py-3">Booking Reference</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Site</th>
                        <th className="px-4 py-3">Bay Number</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-4 py-4 font-semibold text-gray-900">{booking.booking_reference || `BK-${booking.id}`}</td>
                          <td className="px-4 py-4">{booking.customer_name}</td>
                          <td className="px-4 py-4">{booking.site_name || getSiteName(booking.site_id)}</td>
                          <td className="px-4 py-4">{booking.bay_code || '-'}</td>
                          <td className="px-4 py-4">{getCategoryLabel(booking.booking_type)}</td>
                          <td className="px-4 py-4">{formatDate(booking.booking_date)}</td>
                          <td className="px-4 py-4">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(booking.status)}`}>
                              {booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setViewBooking(booking)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={booking.status === 'cancelled' || loading.cancellingId === booking.id}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {loading.cancellingId === booking.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                                Cancel Booking
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Site Layout Preview</h2>
                  <p className="mt-1 text-sm text-gray-500">Read-only visual bay overview for the selected site.</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-gray-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Occupied</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Unavailable</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Electric</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Disabled</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Visitor</span>
              </div>

              <div className="mt-5">
                {!searchForm.site_id ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <MapPinned className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">Select a site to preview the layout</h3>
                    <p className="mt-2 text-sm text-gray-500">The layout preview uses real bay records from the selected site.</p>
                  </div>
                ) : errors.layout ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    <p className="font-semibold">Unable to load site layout</p>
                    <p className="mt-1">{errors.layout}</p>
                    <button onClick={() => fetchLayoutSpaces(searchForm.site_id)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700">
                      <RefreshCcw className="h-4 w-4" />
                      Retry
                    </button>
                  </div>
                ) : loading.layout ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="h-4 w-28 rounded bg-gray-200" />
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {Array.from({ length: 6 }).map((__, itemIndex) => (
                            <div key={itemIndex} className="h-12 rounded-xl bg-gray-200" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !layoutSpaces.length ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <MapPinned className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No bays found for this site</h3>
                    <p className="mt-2 text-sm text-gray-500">The selected site does not currently return any active parking spaces.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedLayoutSpaces.map((group) => (
                      <div key={group.key} className="rounded-2xl border border-gray-200 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">{group.label}</h3>
                          <span className="text-xs font-medium text-gray-400">{group.spaces.length} bays</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                          {group.spaces.map((space) => (
                            <div key={space.id} className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold ${getLayoutClasses(space)}`}>
                              <div>{space.bay_code}</div>
                              <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em]">{space.status}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {lastConfirmedBooking && (
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Latest confirmed booking</h2>
                    <p className="mt-1 text-sm text-gray-500">Reference {lastConfirmedBooking.booking_reference || `BK-${lastConfirmedBooking.id}`}</p>
                    <div className="mt-4 grid gap-2 text-sm text-gray-600">
                      <p><span className="font-semibold text-gray-900">Name:</span> {lastConfirmedBooking.customer_name}</p>
                      <p><span className="font-semibold text-gray-900">Parking Number:</span> {lastConfirmedBooking.bay_code}</p>
                      <p><span className="font-semibold text-gray-900">Duration:</span> {lastConfirmedBooking.duration}</p>
                      <p><span className="font-semibold text-gray-900">Time Window:</span> {formatDateTimeWindow(lastConfirmedBooking.booking_date, lastConfirmedBooking.start_time, lastConfirmedBooking.end_time)}</p>
                      <p><span className="font-semibold text-gray-900">Status:</span> {lastConfirmedBooking.status}</p>
                      {lastConfirmedBooking.employee_number ? <p><span className="font-semibold text-gray-900">Employee Number:</span> {lastConfirmedBooking.employee_number}</p> : null}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showBookingModal && selectedSpace ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Create Booking</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Book {selectedSpace.bay_code}</h2>
                <p className="mt-1 text-sm text-gray-500">Confirm the reservation details and save the booking to the database.</p>
              </div>
              <button onClick={handleCloseBookingModal} className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-2xl bg-gray-50 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Reservation details</h3>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <p><span className="font-semibold text-gray-900">Site:</span> {getSiteName(selectedSpace.site_id)}</p>
                  <p><span className="font-semibold text-gray-900">Bay:</span> {selectedSpace.bay_code}</p>
                  <p><span className="font-semibold text-gray-900">Category:</span> {getCategoryLabel(selectedSpace.category)}</p>
                  <p><span className="font-semibold text-gray-900">Date:</span> {formatDate(searchForm.booking_date)}</p>
                  <p><span className="font-semibold text-gray-900">Time:</span> {formatTime(searchForm.start_time)} - {formatTime(searchForm.end_time)}</p>
                  <p><span className="font-semibold text-gray-900">Duration:</span> {getDurationLabel(searchForm.start_time, searchForm.end_time)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Name</label>
                  <input
                    value={bookingForm.customer_name}
                    onChange={(event) => setBookingForm((current) => ({ ...current, customer_name: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Employee Number</label>
                  <input
                    value={bookingForm.customer_employee_number}
                    onChange={(event) => setBookingForm((current) => ({ ...current, customer_employee_number: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Company</label>
                  <input
                    value={bookingForm.customer_company}
                    onChange={(event) => setBookingForm((current) => ({ ...current, customer_company: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Contact Number</label>
                  <input
                    value={bookingForm.customer_phone}
                    onChange={(event) => setBookingForm((current) => ({ ...current, customer_phone: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Required"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={bookingForm.customer_email}
                    onChange={(event) => setBookingForm((current) => ({ ...current, customer_email: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Optional"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleCloseBookingModal} className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading.creating} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">
                    {loading.creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Confirm Booking
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {viewBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Booking Details</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{viewBooking.booking_reference || `BK-${viewBooking.id}`}</h2>
              </div>
              <button onClick={() => setViewBooking(null)} className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 px-6 py-6 text-sm text-gray-700">
              <p><span className="font-semibold text-gray-900">Name:</span> {viewBooking.customer_name}</p>
              <p><span className="font-semibold text-gray-900">Site:</span> {viewBooking.site_name || getSiteName(viewBooking.site_id)}</p>
              <p><span className="font-semibold text-gray-900">Bay:</span> {viewBooking.bay_code || '-'}</p>
              <p><span className="font-semibold text-gray-900">Category:</span> {getCategoryLabel(viewBooking.booking_type)}</p>
              <p><span className="font-semibold text-gray-900">Date:</span> {formatDate(viewBooking.booking_date)}</p>
              <p><span className="font-semibold text-gray-900">Time:</span> {formatTime(viewBooking.start_time)} - {formatTime(viewBooking.end_time)}</p>
              <p><span className="font-semibold text-gray-900">Contact Number:</span> {viewBooking.customer_phone || '-'}</p>
              <p><span className="font-semibold text-gray-900">Company:</span> {viewBooking.customer_company || '-'}</p>
              <p><span className="font-semibold text-gray-900">Status:</span> {viewBooking.status}</p>
            </div>
          </div>
        </div>
      ) : null}

      {isBusy ? (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          Loading dashboard...
        </div>
      ) : null}

      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  )
}

export default ReceptionistDashboardContent
