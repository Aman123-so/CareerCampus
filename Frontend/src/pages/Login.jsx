
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/users/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.')
        return
      }

      if (!data.token || !data.data) {
        setError('Login response was incomplete. Please try again.')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.data))
      window.dispatchEvent(new Event('userChanged'))

      // Admin and student go to their relevant page
      if (data.data.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/opportunities', { replace: true })
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <span className="login-brand-icon">🎓</span>
          <span>Smart Campus</span>
        </div>

        <div className="login-visual-content">
          <span className="login-eyebrow">YOUR FUTURE STARTS HERE</span>
          <h1>Turn your ambition into opportunity.</h1>
          <p>
            Explore internships, manage your applications, and take the next
            step in your career journey.
          </p>

          <div className="login-highlight">
            <span>✓</span>
            <span>One platform for your campus career journey</span>
          </div>
        </div>

        <p className="login-visual-footer">
          Learn more. Apply smarter. Grow further.
        </p>
      </section>

      <section className="login-form-section">
        <div className="login-form-card">
          <div className="login-mobile-brand">
            🎓 Smart Campus
          </div>

          <span className="login-form-eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="login-form-description">
            Enter your details to continue.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="login-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="login-register-text">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>

          <p className="login-security-note">
            Your campus journey, all in one place.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
