
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import EditOpportunity from './components/opportunity/EditOpportunity'
import Navbar from './components/navbar/Navbar'

import Home from './pages/Home'
import Opportunities from './pages/Opportunities'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import SavedOpportunities from './pages/SavedOpportunities'
import MyApplications from './pages/MyApplications'
import AdminDashboard from './pages/AdminDashboard'
import AddOpportunity from './pages/AddOpportunity'

// Admin-only route protection
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')

  let user = null

  try {
    user = storedUser ? JSON.parse(storedUser) : null
  } catch {
    user = null
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

const App = () => {
  useEffect(() => {
    console.log('App component loaded')
  }, [])

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/saved-opportunities" element={<SavedOpportunities />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/edit-opportunity/:id" element={<EditOpportunity />} />

        {/* Admin Dashboard */}
       <Route path="/admin" element={<AdminDashboard />} />
       <Route path="/admin/add-opportunity" element={<AddOpportunity />} />

        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
