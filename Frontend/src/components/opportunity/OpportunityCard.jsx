import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './OpportunityCard.css'

const OpportunityCard = (props) => {
  const navigate = useNavigate()

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)

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
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('userToken')

  useEffect(() => {
    // Admin ko saved status load karne ki zaroorat nahi hai.
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

  const handleApply = async () => {
    if (isAdmin) return

    if (!token) {
      alert('Please login to apply')
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
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        alert(result.message || 'Unable to apply')
        return
      }

      alert(result.message || 'Application submitted successfully!')
    } catch (error) {
      console.error('Application error:', error)
      alert('Unable to connect to server')
    } finally {
      setApplying(false)
    }
  }

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

  const handleEdit = () => {
    if (!isAdmin) return

    if (props.onEdit) {
      props.onEdit(props.opportunity || props)
    } else {
      navigate(`/edit-opportunity/${props.id}`)
    }
  }

  return (
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
              disabled={applying}
            >
              {applying ? 'Applying...' : 'Apply Now →'}
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
  )
}

export default OpportunityCard