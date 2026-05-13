import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Toast from '../components/Toast'
import axios from '../api/axios'
import { Palette, Save, X, Plus, Trash2, Loader2 } from 'lucide-react'

const CategorySettings = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', color_code: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', color_code: '#3B82F6' })
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      setToast({ message: 'Failed to load categories', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setEditForm({ name: category.name, color_code: category.color_code })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', color_code: '' })
  }

  const handleSave = async (categoryId) => {
    try {
      setSaving(true)
      await axios.put(`/api/categories/${categoryId}`, editForm)
      setToast({ message: 'Category updated successfully', type: 'success' })
      setEditingId(null)
      fetchCategories()
      // Notify other tabs/pages that categories have changed
      window.dispatchEvent(new Event('category-changed'))
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Failed to update category', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = async () => {
    try {
      setSaving(true)
      await axios.post('/api/categories', newCategory)
      setToast({ message: 'Category created successfully', type: 'success' })
      setShowAddModal(false)
      setNewCategory({ name: '', color_code: '#3B82F6' })
      fetchCategories()
      // Notify other tabs/pages that categories have changed
      window.dispatchEvent(new Event('category-changed'))
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Failed to create category', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return

    try {
      await axios.delete(`/api/categories/${categoryId}`)
      setToast({ message: 'Category deleted successfully', type: 'success' })
      fetchCategories()
      // Notify other tabs/pages that categories have changed
      window.dispatchEvent(new Event('category-changed'))
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Failed to delete category', type: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parking Category Settings</h1>
            <p className="text-gray-600 mt-2">Manage parking space categories and colors</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                >
                  {editingId === category.id ? (
                    <>
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Category name"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editForm.color_code}
                            onChange={(e) => setEditForm({ ...editForm, color_code: e.target.value })}
                            className="h-10 w-20 cursor-pointer rounded border border-gray-300"
                          />
                          <span className="text-xs text-gray-500">{editForm.color_code}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleSave(category.id)}
                          disabled={saving}
                          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded border border-gray-300"
                          style={{ backgroundColor: category.color_code }}
                        ></div>
                        <div>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.color_code}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Palette className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add New Category</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Premium, Motorcycle"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newCategory.color_code}
                    onChange={(e) => setNewCategory({ ...newCategory, color_code: e.target.value })}
                    className="h-12 w-24 cursor-pointer rounded border border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{newCategory.color_code}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={saving || !newCategory.name}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategorySettings
