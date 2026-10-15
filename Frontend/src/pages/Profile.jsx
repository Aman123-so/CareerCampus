
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Profile.css'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Please log in to view your profile.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/users/profile',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Unable to fetch your profile.')
        }

        setUser(result.data)
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <span className="profile-spinner" />
          <h2>Loading your profile</h2>
          <p>Please wait while we fetch your account details.</p>
        </div>
      </main>
    )
  }

  if (error || !user) {
    return (
      <main className="profile-page">
        <section className="profile-message-card">
          <div className="profile-message-icon">!</div>
          <h2>Unable to load profile</h2>
          <p>{error || 'Your profile information is unavailable.'}</p>
          {!localStorage.getItem('token') && (
            <Link className="profile-primary-btn" to="/login">
              Sign in
            </Link>
          )}
          <Link className="profile-secondary-link" to="/">
            Back to Home
          </Link>
        </section>
      </main>
    )
  }

  const displayName = user.name || 'Campus Member'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'
  const role = user.role || 'student'

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>My Profile</span>
        </div>

        <header className="profile-page-heading">
          <div>
            <span className="profile-eyebrow">YOUR ACCOUNT</span>
            <h1>My Profile</h1>
            <p>View your account details and manage your campus journey.</p>
          </div>

          <span className="profile-account-status">
            <span />
            Account Active
          </span>
        </header>

        <section className="profile-hero-card">
          <div className="profile-hero-pattern" />

          <div className="profile-hero-content">
            <div className="profile-avatar">{initial}</div>

            <div className="profile-hero-info">
              <span className="profile-member-label">SMART CAMPUS MEMBER</span>
              <h2>{displayName}</h2>
              <p>{user.email || 'Email not available'}</p>
              <span className="profile-role-badge">
                {role === 'admin' ? 'Administrator' : 'Student Account'}
              </span>
            </div>
          </div>

          <div className="profile-hero-decoration" aria-hidden="true">
            <span>SC</span>
          </div>
        </section>

        <div className="profile-content-grid">
          <section className="profile-info-panel">
            <div className="profile-panel-heading">
              <div>
                <h3>Personal Information</h3>
                <p>Your registered account details.</p>
              </div>
              <span className="profile-panel-icon">◎</span>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <span className="profile-info-icon">A</span>
                <div>
                  <span className="profile-info-label">FULL NAME</span>
                  <strong>{displayName}</strong>
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-icon">@</span>
                <div>
                  <span className="profile-info-label">EMAIL ADDRESS</span>
                  <strong className="profile-email-value">
                    {user.email || 'Not available'}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-icon">✓</span>
                <div>
                  <span className="profile-info-label">ACCOUNT ROLE</span>
                  <strong>
                    {role === 'admin' ? 'Administrator' : 'Student'}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <aside className="profile-quick-panel">
            <div className="profile-quick-icon">✦</div>
            <h3>Your campus journey</h3>
            <p>
              Discover opportunities, keep track of your applications, and
              take the next step towards your career goals.
            </p>

            <div className="profile-quick-links">
              <Link to="/opportunities">
                <span>Explore opportunities</span>
                <span>→</span>
              </Link>

              {role !== 'admin' && (
                <Link to="/my-applications">
                  <span>My applications</span>
                  <span>→</span>
                </Link>
              )}

              <Link to="/saved-opportunities">
                <span>Saved opportunities</span>
                <span>→</span>
              </Link>

              {role === 'admin' && (
                <Link to="/admin">
                  <span>Admin dashboard</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </aside>
        </div>

        <div className="profile-footer-note">
          <span>🔒</span>
          <p>Your account information is displayed securely within Smart Campus.</p>
        </div>
      </div>
    </main>
  )
}

export default Profile
