import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ParkingSquare, Eye, EyeOff, AlertCircle } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Attempt login
      const user = await login(email, password)
      
      console.log('Logged in user:', user)
      console.log('Stored user:', localStorage.getItem('user'))
      
      if (!user || !user.role_name) {
        throw new Error('Invalid user data received')
      }
      
      // Map roles to routes (only 3 roles)
      const roleRoutes = {
        receptionist: '/reception',
        manager: '/manager',
        admin: '/admin'
      }
      
      const targetRoute = roleRoutes[user.role_name]
      
      if (!targetRoute) {
        throw new Error('Invalid user role')
      }
      
      // Navigate using React Router (SPA navigation)
      navigate(targetRoute, { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ParkingSquare className="h-12 w-12 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">SmartPark</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Demo Credentials:</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700">Receptionist</p>
                <p className="text-gray-600">reception@smartpark.com</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700">Manager</p>
                <p className="text-gray-600">manager@smartpark.com</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700">Admin</p>
                <p className="text-gray-600">admin@smartpark.com</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">Password: password123</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 RoppaCorp Industries. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
