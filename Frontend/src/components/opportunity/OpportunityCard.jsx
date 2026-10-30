
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './OpportunityCard.css'

const OpportunityCard = (props) => {
  const navigate = useNavigate()

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    currentYear: '',
    branch: '',
    collegeName: '',
    passingYear: '',
    phoneNumber: '',
    officialEmail: ''
  })

  // Get logged-in user's role
  const storedUser = localStorage.getItem('user')
  let userRole = 'student'

  try {
    userRole = storedUser
      ? JSON.parse(storedUser).role?.toLowerCase() || 'student'
      : 'student'
  } catch {
    userRole = 'student'
  }

  const isAdmin = userRole === 'admin'

  // Get authentication token
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('userToken')

  // Load saved opportunity status
  useEffect(() => {
    if (isAdmin) {
      setSaved(false)
      return
    }

    const loadSavedStatus = async () => {
      if (!token) {
        setSaved(false)
        return
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/users/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          setSaved(false)
          return
        }

        const result = await response.json()
        const savedIds = result.data?.savedOpportunities || []

        setSaved(
          savedIds.some((item) => {
            const savedId =
              typeof item === 'string' ? item : item?._id

            return savedId === props.id
          })
        )
      } catch (error) {
        console.error('Could not load saved status:', error)
      }
    }

    loadSavedStatus()
  }, [props.id, isAdmin, token])

  // Save or unsave opportunity
  const handleSave = async () => {
    if (isAdmin) return

    if (!token) {
      alert('Please login to save opportunities')
      navigate('/login')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `http://localhost:5000/api/opportunities/${props.id}/save`,
        {
          method: saved ? 'DELETE' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        alert(result.message || 'Could not update saved opportunity')
        return
      }

      setSaved(!saved)
      alert(result.message || 'Saved status updated successfully')
    } catch (error) {
      console.error('Save error:', error)
      alert('Unable to connect to server')
    } finally {
      setSaving(false)
    }
  }

  // Open application form
  const handleApply = () => {
    if (isAdmin) return

    if (!token) {
      alert('Please login to apply')
      navigate('/login')
      return
    }

    setShowForm(true)
  }

  // Update application form fields
  const handleFormChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Submit application
  const handleApplicationSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      alert('Please login again')
      navigate('/login')
      return
    }

    setApplying(true)

    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${props.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            passingYear: Number(formData.passingYear)
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        alert(result.message || 'Unable to submit application')
        return
      }

      alert(result.message || 'Application submitted successfully!')

      setShowForm(false)

      setFormData({
        currentYear: '',
        branch: '',
        collegeName: '',
        passingYear: '',
        phoneNumber: '',
        officialEmail: ''
      })
    } catch (error) {
      console.error('Application error:', error)
      alert('Unable to connect to server')
    } finally {
      setApplying(false)
    }
  }

  // Delete opportunity (Admin only)
  const handleDelete = async () => {
    if (!isAdmin) return

    if (!token) {
      alert('Please login again')
      navigate('/login')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this opportunity?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `http://localhost:5000/api/opportunities/${props.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        alert(result.message || 'Failed to delete opportunity')
        return
      }

      if (props.onDelete) {
        props.onDelete(props.id)
      }

      alert(result.message || 'Opportunity deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Unable to connect to server')
    }
  }

  // Edit opportunity (Admin only)
  const handleEdit = () => {
    if (!isAdmin) return

    if (props.onEdit) {
      props.onEdit(props.opportunity || props)
    } else {
      navigate(`/edit-opportunity/${props.id}`)
    }
  }

  return (
    <>
      {/* Opportunity Card */}
      <article className="opportunity-card">
        <div className="opportunity-card-top">
          <span className="opportunity-type">
            {props.type || 'Opportunity'}
          </span>

          {!isAdmin && saved && (
            <span className="saved-indicator">♥ Saved</span>
          )}
        </div>

        <h2 className="opportunity-title">{props.title}</h2>

        <div className="opportunity-details">
          <p>
            <span className="detail-icon">▣</span>
            <span>
              <small>Company</small>
              <strong>{props.company}</strong>
            </span>
          </p>

          <p>
            <span className="detail-icon">⌖</span>
            <span>
              <small>Location</small>
              <strong>{props.location}</strong>
            </span>
          </p>
        </div>

        <div className="opportunity-actions">
          {!isAdmin && (
            <>
              <button
                type="button"
                className={`action-btn save-btn ${saved ? 'is-saved' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? 'Please wait...'
                  : saved
                    ? '♥ Saved'
                    : '♡ Save'}
              </button>

              <button
                type="button"
                className="action-btn apply-btn"
                onClick={handleApply}
              >
                Apply Now →
              </button>
            </>
          )}

          {isAdmin && (
            <div className="admin-actions">
              <button
                type="button"
                className="action-btn edit-btn"
                onClick={handleEdit}
              >
                ✎ Edit
              </button>

              <button
                type="button"
                className="action-btn delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Student Application Form */}
      {showForm && (
        <div
          className="application-modal-overlay"
          onClick={() => !applying && setShowForm(false)}
        >
          <div
            className="application-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="application-modal-header">
              <div>
                <h2>Application Form</h2>
                <p>
                  Applying for: <strong>{props.title}</strong>
                </p>
              </div>

              <button
                type="button"
                className="application-close-btn"
                onClick={() => setShowForm(false)}
                disabled={applying}
              >
                ×
              </button>
            </div>

            <form
              className="application-form"
              onSubmit={handleApplicationSubmit}
            >
              <div className="application-form-group">
                <label>Current Year *</label>
                <select
                  name="currentYear"
                  value={formData.currentYear}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Current Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="application-form-group">
                <label>Branch *</label>
                <input
                  type="text"
                  name="branch"
                  placeholder="e.g. Computer Science Engineering"
                  value={formData.branch}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="application-form-group">
                <label>College Name *</label>
                <input
                  type="text"
                  name="collegeName"
                  placeholder="Enter your college name"
                  value={formData.collegeName}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="application-form-group">
                <label>Passing Year *</label>
                <input
                  type="number"
                  name="passingYear"
                  placeholder="e.g. 2028"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 8}
                  value={formData.passingYear}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="application-form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter 10 digit phone number"
                  pattern="[6-9][0-9]{9}"
                  maxLength="10"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="application-form-group">
                <label>Official Email *</label>
                <input
                  type="email"
                  name="officialEmail"
                  placeholder="Enter your official email"
                  value={formData.officialEmail}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="application-form-footer">
                <p>Review your details before submitting.</p>

                <div className="application-form-buttons">
                  <button
                    type="button"
                    className="application-cancel-btn"
                    onClick={() => setShowForm(false)}
                    disabled={applying}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="application-submit-btn"
                    disabled={applying}
                  >
                    {applying
                      ? 'Submitting...'
                      : 'Submit Application →'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default OpportunityCard
