import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Toast from '../components/Toast'
import axios from '../api/axios'
import { Save, RotateCcw, Loader2, Edit2, MapPin, Grid3x3 } from 'lucide-react'

const LayoutEditor = () => {
  const navigate = useNavigate()
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [spaces, setSpaces] = useState([])
  const [categories, setCategories] = useState([])
  const [draggingSpace, setDraggingSpace] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [editingSpace, setEditingSpace] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const gridRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedSite) {
      fetchSpaces(selectedSite)
    }
  }, [selectedSite])

  // Auto-refresh categories when they change in other tabs
  useEffect(() => {
    const handleCategoryChange = () => {
      refreshCategories()
    }
    window.addEventListener('category-changed', handleCategoryChange)
    return () => window.removeEventListener('category-changed', handleCategoryChange)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sitesRes, categoriesRes] = await Promise.all([
        axios.get('/api/sites'),
        axios.get('/api/categories')
      ])
      setSites(sitesRes.data)
      setCategories(categoriesRes.data)
      if (sitesRes.data.length > 0) {
        setSelectedSite(sitesRes.data[0].id)
      }
    } catch (error) {
      setToast({ message: 'Failed to load data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const refreshCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
      // Force spaces to re-render with new colors by re-fetching them
      if (selectedSite) {
        await fetchSpaces(selectedSite)
      }
      setToast({ message: 'Categories refreshed', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to refresh categories', type: 'error' })
    }
  }

  const fetchSpaces = async (siteId) => {
    try {
      const response = await axios.get(`/api/spaces?site_id=${siteId}`)
      setSpaces(response.data)
      setHasChanges(false)
    } catch (error) {
      setToast({ message: 'Failed to load parking spaces', type: 'error' })
    }
  }

  const handleMouseDown = (e, space) => {
    if (e.button !== 0) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setDraggingSpace(space)
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!draggingSpace || !gridRef.current) return

    setIsDragging(true)
    const gridRect = gridRef.current.getBoundingClientRect()
    const newX = Math.max(0, Math.min(e.clientX - gridRect.left - dragOffset.x, gridRect.width - 60))
    const newY = Math.max(0, Math.min(e.clientY - gridRect.top - dragOffset.y, gridRect.height - 60))

    setSpaces(prev => prev.map(s =>
      s.id === draggingSpace.id
        ? { ...s, pos_x: Math.round(newX), pos_y: Math.round(newY) }
        : s
    ))
    setHasChanges(true)
  }

  const handleMouseUp = () => {
    setDraggingSpace(null)
  }

  const handleSaveLayout = async () => {
    try {
      setSaving(true)
      const updates = spaces.map(s => ({
        id: s.id,
        pos_x: s.pos_x || 0,
        pos_y: s.pos_y || 0
      }))

      console.log('Saving positions:', updates)
      const response = await axios.patch('/api/layout/spaces/positions', { updates })
      console.log('Save response:', response.data)
      setToast({ message: 'Layout saved successfully', type: 'success' })
      setHasChanges(false)
      // Refresh spaces to confirm the save worked
      await fetchSpaces(selectedSite)
    } catch (error) {
      console.error('Save error:', error)
      setToast({ message: 'Failed to save layout', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleResetLayout = () => {
    if (!confirm('Reset layout to last saved state?')) return
    fetchSpaces(selectedSite)
  }

  const handleEditSpace = (space) => {
    // Don't open edit modal if we just finished dragging
    if (isDragging) {
      setIsDragging(false)
      return
    }
    
    setEditingSpace({
      ...space,
      category_id: space.category_id || categories[0]?.id
    })
  }

  const handleSaveSpace = async () => {
    try {
      await axios.patch(`/api/layout/spaces/${editingSpace.id}`, {
        category_id: editingSpace.category_id,
        status: editingSpace.status
      })
      setToast({ message: 'Space updated successfully', type: 'success' })
      setEditingSpace(null)
      fetchSpaces(selectedSite)
    } catch (error) {
      setToast({ message: 'Failed to update space', type: 'error' })
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
      'visitor': '#F59E0B'
    }
    return colorMap[space.category?.toLowerCase()] || '#3B82F6'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Layout Editor</h1>
            <p className="text-gray-600 mt-2">Drag parking spaces to reposition them</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetLayout}
              disabled={!hasChanges}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleSaveLayout}
              disabled={!hasChanges || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Layout
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Select Site</h3>
              <div className="space-y-2">
                {sites.map(site => (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSite(site.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      selectedSite === site.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {site.name}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Legend
                  </h3>
                  <button
                    onClick={refreshCategories}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded border border-gray-300"
                        style={{ backgroundColor: cat.color_code }}
                      ></div>
                      <span className="text-gray-700">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                <p className="font-semibold mb-1">💡 Tips:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Drag spaces to move</li>
                  <li>Click to edit details</li>
                  <li>Save when done</li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div
                  ref={gridRef}
                  className="relative bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
                  style={{ height: '600px', cursor: draggingSpace ? 'grabbing' : 'default' }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {spaces.map(space => (
                    <div
                      key={space.id}
                      onMouseDown={(e) => handleMouseDown(e, space)}
                      onClick={() => handleEditSpace(space)}
                      className="absolute flex items-center justify-center rounded border-2 border-white shadow-md cursor-move hover:shadow-lg transition-shadow"
                      style={{
                        left: `${space.pos_x || 0}px`,
                        top: `${space.pos_y || 0}px`,
                        width: '60px',
                        height: '60px',
                        backgroundColor: getCategoryColor(space),
                        opacity: ['occupied', 'reserved'].includes(space.status) ? 0.5 : 1,
                        backgroundImage: ['occupied', 'reserved'].includes(space.status) 
                          ? 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,.15) 8px, rgba(255,255,255,.15) 16px)'
                          : 'none'
                      }}
                      title={`${space.bay_code} - ${space.status}`}
                    >
                      <span className="text-xs font-bold text-white text-center px-1">
                        {space.bay_code}
                      </span>
                    </div>
                  ))}

                  {spaces.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <p>No parking spaces found for this site</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {editingSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit Parking Space</h3>
              <button onClick={() => setEditingSpace(null)} className="text-gray-500 hover:text-gray-700">
                <Edit2 className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Bay Code</label>
                <input
                  type="text"
                  value={editingSpace.bay_code}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editingSpace.category_id || ''}
                  onChange={(e) => setEditingSpace({ ...editingSpace, category_id: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editingSpace.status}
                  onChange={(e) => setEditingSpace({ ...editingSpace, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingSpace(null)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSpace}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LayoutEditor
