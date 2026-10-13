import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EditOpportunity from './components/opportunity/EditOpportunity'
import Navbar from './components/navbar/Navbar'
import Home from './pages/Home'
import Opportunities from './pages/Opportunities'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import SavedOpportunities from './pages/SavedOpportunities'
import MyApplications from './pages/MyApplications'

const App = () => {

  useEffect(() => {
    console.log("App component loaded")
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
</Routes>

    </BrowserRouter>
  )
}

export default App