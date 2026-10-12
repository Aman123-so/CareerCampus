
import React, { useState } from 'react'
import './Navbar.css'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)

    navigate('/login')
  }

  return (
    <nav>
      <h2>Smart Campus</h2>

      <div>
        <Link to="/">Home</Link>
  <Link to="/opportunities">Opportunities</Link>
  <Link to="/profile">Profile</Link>

  {user ? (
    <>
      <span>Hi, {user.name}</span>
      <button onClick={handleLogout}>Logout</button>
    </>
  ) : (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  )}
      </div>
    </nav>
  )
}

export default Navbar