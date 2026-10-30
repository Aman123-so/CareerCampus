
import React, { useState, useEffect } from 'react'
import './Navbar.css'
import { NavLink, useNavigate } from 'react-router-dom'

const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  } catch {
    return null
  }
}

const Navbar = () => {
  const [user, setUser] = useState(getStoredUser)
  const navigate = useNavigate()

  useEffect(() => {
    const updateUser = () => {
      setUser(getStoredUser())
    }

    window.addEventListener('storage', updateUser)
    window.addEventListener('userChanged', updateUser)

    return () => {
      window.removeEventListener('storage', updateUser)
      window.removeEventListener('userChanged', updateUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.dispatchEvent(new Event('userChanged'))
    navigate('/login')
  }

  const getLinkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link'

  return (
    <nav>
      <h2>CareerCampus</h2>

      <div className="nav-links">
        <NavLink to="/" end className={getLinkClass}>
          Home
        </NavLink>

        <NavLink to="/opportunities" className={getLinkClass}>
          Opportunities
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink to="/admin" end className={getLinkClass}>
            Admin Dashboard
          </NavLink>
        )}

        {user && (
          <>
            <NavLink to="/profile" className={getLinkClass}>
              Profile
            </NavLink>

            <NavLink to="/saved-opportunities" className={getLinkClass}>
              Saved Opportunities
            </NavLink>

            <NavLink to="/my-applications" className={getLinkClass}>
              My Applications
            </NavLink>
          </>
        )}

        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={getLinkClass}>
              Login
            </NavLink>

            <NavLink to="/register" className={getLinkClass}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
