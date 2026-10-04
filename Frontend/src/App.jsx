import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EditOpportunity from './components/opportunity/EditOpportunity'
import Navbar from './components/navbar/Navbar'
import Home from './pages/Home'
import Opportunities from './pages/Opportunities'
import Login from './pages/Login'

const App = () => {

  useEffect(() => {
    console.log("App component loaded")
  }, [])

  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/opportunities"
          element={<Opportunities />}
        />

        <Route
          path="/login"
          element={<Login />}
        />
     <Route
         path="/edit-opportunity/:id"
          element={<EditOpportunity />}
         />

      </Routes>

    </BrowserRouter>
  )
}

export default App