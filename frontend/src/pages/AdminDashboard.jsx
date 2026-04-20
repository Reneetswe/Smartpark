import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Toast from '../components/Toast'
import axios from '../api/axios'
import { Users, Activity, Shield, AlertCircle, UserPlus, Edit, UserX, UserCheck, X } from 'lucide-react'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    recentActions: 0
  })
  const [toast, setToast] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
    employee_number: '',
    contact_number: '',
    company: 'RoppaCorp Industries',
    is_priority: false
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [usersRes, logsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/logs?limit=50')
      ])

      setUsers(usersRes.data)
      setActivityLogs(logsRes.data)

      const activeUsers = usersRes.data.filter(u => u.is_active).length
      setStats({
        totalUsers: usersRes.data.length,
        activeUsers: activeUsers,
        inactiveUsers: usersRes.data.length - activeUsers,
        recentActions: logsRes.data.length
      })

      const rolesData = [
        { id: 1, name: 'receptionist' },
        { id: 2, name: 'manager' },
        { id: 3, name: 'admin' }
      ]
      setRoles(rolesData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setToast({ 
        message: 'Failed to load dashboard data. Please check API connection.', 
        type: 'error' 
      })
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    try {
      await axios.post('/api/users', {
        ...formData,
        role_id: parseInt(formData.role_id)
      })
      
      setToast({ message: 'User created successfully!', type: 'success' })
      setShowUserModal(false)
      resetForm()
      fetchDashboardData()
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Failed to create user', type: 'error' })
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    
    try {
      const updateData = { ...formData }
      delete updateData.password
      if (formData.role_id) {
        updateData.role_id = parseInt(formData.role_id)
      }
      
      await axios.put(`/api/users/${editingUser.id}`, updateData)
      
      setToast({ message: 'User updated successfully!', type: 'success' })
      setShowUserModal(false)
      setEditingUser(null)
      resetForm()
      fetchDashboardData()
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Failed to update user', type: 'error' })
    }
  }

  const handleDeactivateUser = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user? They will not be able to log in.')) return

    try {
      await axios.patch(`/api/users/${userId}/deactivate`)
      setToast({ message: 'User deactivated successfully', type: 'success' })
      fetchDashboardData()
    } catch (error) {
      setToast({ message: 'Error deactivating user', type: 'error' })
    }
  }

  const handleReactivateUser = async (userId) => {
    if (!confirm('Are you sure you want to reactivate this user?')) return

    try {
      await axios.patch(`/api/users/${userId}/reactivate`)
      setToast({ message: 'User reactivated successfully', type: 'success' })
      fetchDashboardData()
    } catch (error) {
      setToast({ message: 'Error reactivating user', type: 'error' })
    }
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role_id: user.role_id,
      employee_number: user.employee_number || '',
      contact_number: user.contact_number || '',
      company: user.company || 'RoppaCorp Industries',
      is_priority: user.is_priority
    })
    setShowUserModal(true)
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role_id: '',
      employee_number: '',
      contact_number: '',
      company: 'RoppaCorp Industries',
      is_priority: false
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IT Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">System administration and user management</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null)
              resetForm()
              setShowUserModal(true)
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inactive Users</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactiveUsers}</p>
              </div>
              <UserX className="h-10 w-10 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent Actions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.recentActions}</p>
              </div>
              <Activity className="h-10 w-10 text-blue-600" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
              
              <div className="overflow-x-auto">
                {users.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{user.full_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                            {user.role_name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {user.is_active ? (
                              <button
                                onClick={() => handleDeactivateUser(user.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Deactivate User"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivateUser(user.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Reactivate User"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No users found. Check API connection.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Activity Logs
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityLogs.length > 0 ? (
                  activityLogs.map(log => (
                    <div key={log.id} className="border-l-2 border-blue-600 pl-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-600">{log.user_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No activity logs yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button onClick={() => {
                setShowUserModal(false)
                setEditingUser(null)
                resetForm()
              }} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id} className="capitalize">{role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Number</label>
                  <input
                    type="text"
                    value={formData.employee_number}
                    onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_priority}
                      onChange={(e) => setFormData({ ...formData, is_priority: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Priority User</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false)
                    setEditingUser(null)
                    resetForm()
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
