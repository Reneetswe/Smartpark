import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ReceptionistDashboard from './pages/ReceptionistDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SiteLayout from './pages/SiteLayout'
import CategorySettings from './pages/CategorySettings'
import LayoutEditor from './pages/LayoutEditor'

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

          <Route path="/manager/categories" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <CategorySettings />
            </ProtectedRoute>
          } />

          <Route path="/manager/layout-editor" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <LayoutEditor />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CategorySettings />
            </ProtectedRoute>
          } />

          <Route path="/admin/layout-editor" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutEditor />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
