
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddOpportunity.css'

const AddOpportunity = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Internship'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please log in before publishing an opportunity.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/opportunities',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            company: formData.company.trim(),
            location: formData.location.trim(),
            type: formData.type
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add opportunity.')
      }

      setSuccess('Opportunity published successfully!')

      setTimeout(() => {
        navigate('/opportunities')
      }, 800)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="add-opportunity-page">
      <div className="add-opportunity-container">
        <button
          type="button"
          className="add-back-link"
          onClick={() => navigate('/admin')}
        >
          ← Back to Dashboard
        </button>

        <header className="add-opportunity-header">
          <div className="add-header-icon">✦</div>
          <span className="add-eyebrow">OPPORTUNITY MANAGEMENT</span>
          <h1>Add New Opportunity</h1>
          <p>
            Publish a job or internship to help students discover
            their next career opportunity.
          </p>
        </header>

        <section className="add-opportunity-card">
          <div className="add-card-heading">
            <div>
              <h2>Opportunity Details</h2>
              <p>Enter the information students will see.</p>
            </div>
            <span className="add-required-note">* Required fields</span>
          </div>

          {error && (
            <div className="add-message add-error" role="alert">
              <span>⚠</span>
              {error}
            </div>
          )}

          {success && (
            <div className="add-message add-success" role="status">
              <span>✓</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="add-form-group">
              <label htmlFor="opportunity-title">
                Opportunity Title <span>*</span>
              </label>
              <input
                id="opportunity-title"
                type="text"
                name="title"
                placeholder="e.g. React Developer Internship"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
                required
              />
              <small>Use a clear title that describes the role.</small>
            </div>

            <div className="add-form-group">
              <label htmlFor="opportunity-company">
                Company Name <span>*</span>
              </label>
              <input
                id="opportunity-company"
                type="text"
                name="company"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div className="add-form-row">
              <div className="add-form-group">
                <label htmlFor="opportunity-location">
                  Location <span>*</span>
                </label>
                <input
                  id="opportunity-location"
                  type="text"
                  name="location"
                  placeholder="e.g. Noida"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="add-form-group">
                <label htmlFor="opportunity-type">
                  Opportunity Type <span>*</span>
                </label>
                <select
                  id="opportunity-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Internship">Internship</option>
                  <option value="Job">Full-time Job</option>
                </select>
              </div>
            </div>

            <div className="add-form-footer">
              <p>Review the details before publishing.</p>

              <div className="add-form-buttons">
                <button
                  type="button"
                  className="add-cancel-btn"
                  onClick={() => navigate('/admin')}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Publishing...' : 'Publish Opportunity →'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <p className="add-page-footer">
          🎓 Smart Campus · Connecting students with opportunities
        </p>
      </div>
    </main>
  )
}

export default AddOpportunity
