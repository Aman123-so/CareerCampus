
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const OpportunityCard = (props) => {
  const navigate = useNavigate()

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)

  // Get the logged-in user's role
  const storedUser = localStorage.getItem('user')
  let userRole = 'student'

  try {
    userRole = storedUser
      ? JSON.parse(storedUser).role || 'student'
      : 'student'
  } catch {
    userRole = 'student'
  }

  const isAdmin = userRole === 'admin'

  // Check whether this opportunity is already saved
  useEffect(() => {
    const loadSavedStatus = async () => {
      const token = localStorage.getItem('token')

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
        const savedIds = result.data.savedOpportunities || []

        setSaved(
          savedIds.some((item) =>
            (typeof item === 'string' ? item : item._id) === props.id
          )
        )
      } catch (error) {
        console.log('Could not load saved status:', error)
      }
    }

    loadSavedStatus()
  }, [props.id])

  // Save or unsave opportunity
  const handleSave = async () => {
    const token = localStorage.getItem('token')

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
      alert(result.message)
    } catch (error) {
      console.log('Save error:', error)
      alert('Unable to connect to server')
    } finally {
      setSaving(false)
    }
  }

  // Apply for opportunity
  const handleApply = async () => {
    const token = localStorage.getItem('token')

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
      console.log('Application error:', error)
      alert('Unable to connect to server')
    } finally {
      setApplying(false)
    }
  }

  // Delete opportunity (admin only)
  const handleDelete = async () => {
    if (!isAdmin) {
      alert('Only admins can delete opportunities')
      return
    }

    const token = localStorage.getItem('token')

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
      console.log('Delete error:', error)
      alert('Unable to connect to server')
    }
  }

  return (
    <div>
      <h2>{props.title}</h2>
      <p>Company: {props.company}</p>
      <p>Location: {props.location}</p>
      <p>Type: {props.type}</p>

      <button onClick={handleSave} disabled={saving}>
        {saving
          ? 'Please wait...'
          : saved
            ? '❤️ Saved'
            : '🤍 Save Opportunity'}
      </button>

      <button onClick={handleApply} disabled={applying}>
        {applying ? 'Applying...' : 'Apply Now'}
      </button>

      {isAdmin && (
        <>
          <button
            onClick={() => navigate(`/edit-opportunity/${props.id}`)}
          >
            Edit
          </button>

          <button onClick={handleDelete}>
            Delete
          </button>
        </>
      )}

      <hr />
    </div>
  )
}

export default OpportunityCard
