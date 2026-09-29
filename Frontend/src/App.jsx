import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
 import Navbar from './components/navbar/Navbar'
//import OpportunityCard from './components/opportunity/OpportunityCard'
import { useEffect } from 'react'
//import Opportunities from './pages/Opportunities'
import Home from './pages/Home'
import Opportunities from './pages/Opportunities'
import Login from './pages/Login'
const App = () => {
   useEffect(() => {
    console.log("App component loaded")
  }, [])
  return (
   <BrowserRouter>
   <Navbar/>
   <Routes>
    <Route path= "/" element= {<Home/>}/>
    <Route path ="/opportunities" element= {<Opportunities/>} />
    <Route path="/login" element={<Login/>} />
   </Routes>
   </BrowserRouter>
   
  )
}

export default App
