import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CitizenDashboard from './pages/citizen/Dashboard'
import SchemeApplication from './pages/citizen/SchemeApplication'
import DocumentsGuide from './pages/citizen/DocumentsGuide'
import FamilyRegistration from './pages/citizen/FamilyRegistration'
import EligibleSchemes from './pages/citizen/EligibleSchemes'
import BenefitTracking from './pages/citizen/BenefitTracking'
import Complaints from './pages/citizen/Complaints'
import HelpdeskSupport from './pages/citizen/HelpdeskSupport'
import VoiceAssistant from './pages/citizen/VoiceAssistant'
import AdminDashboard from './pages/admin/AdminDashboard'
import HelpdeskPanel from './pages/helpdesk/HelpdeskPanel'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="text-center py-20">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/citizen/dashboard" element={<PrivateRoute roles={['citizen']}><CitizenDashboard /></PrivateRoute>} />
      <Route path="/citizen/documents" element={<PrivateRoute roles={['citizen']}><DocumentsGuide /></PrivateRoute>} />
      <Route path="/citizen/register-family" element={<PrivateRoute roles={['citizen']}><FamilyRegistration /></PrivateRoute>} />
      <Route path="/citizen/schemes" element={<PrivateRoute roles={['citizen']}><EligibleSchemes /></PrivateRoute>} />
      <Route path="/citizen/apply/:schemeId" element={<PrivateRoute roles={['citizen']}><SchemeApplication /></PrivateRoute>} />
      <Route path="/citizen/benefits" element={<PrivateRoute roles={['citizen']}><BenefitTracking /></PrivateRoute>} />
      <Route path="/citizen/complaints" element={<PrivateRoute roles={['citizen']}><Complaints /></PrivateRoute>} />
      <Route path="/citizen/helpdesk" element={<PrivateRoute roles={['citizen']}><HelpdeskSupport /></PrivateRoute>} />
      <Route path="/citizen/voice" element={<PrivateRoute roles={['citizen']}><VoiceAssistant /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/helpdesk" element={<PrivateRoute roles={['helpdesk', 'admin']}><HelpdeskPanel /></PrivateRoute>} />
    </Routes>
  )
}
