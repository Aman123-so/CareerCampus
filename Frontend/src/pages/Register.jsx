
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.')
        return
      }

      alert('Account created successfully! Please sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Registration error:', err)
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
          <span className="login-eyebrow">START YOUR JOURNEY</span>
          <h1>Your next opportunity starts here.</h1>
          <p>
            Create your account to discover internships, explore career
            opportunities, and track your applications in one place.
          </p>

          <div className="login-highlight">
            <span>✓</span>
            <span>Build your future, one opportunity at a time</span>
          </div>
        </div>

        <p className="login-visual-footer">
          Learn more. Apply smarter. Grow further.
        </p>
      </section>

      <section className="login-form-section">
        <div className="login-form-card">
          <div className="login-mobile-brand">🎓 Smart Campus</div>

          <span className="login-form-eyebrow">CREATE YOUR ACCOUNT</span>
          <h2>Join Smart Campus</h2>
          <p className="login-form-description">
            Enter your details to get started.
          </p>

          <form onSubmit={handleRegister}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="register-confirm-password">
              Confirm password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              placeholder="Enter password again"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="login-register-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className="login-security-note">
            Your campus journey, all in one place.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Register
