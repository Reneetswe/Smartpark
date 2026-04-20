import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ReceptionistDashboard from './pages/ReceptionistDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SiteLayout from './pages/SiteLayout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/reception" element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          } />

          <Route path="/reception/layout" element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <SiteLayout />
            </ProtectedRoute>
          } />

          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
