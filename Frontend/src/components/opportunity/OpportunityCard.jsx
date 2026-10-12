
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const OpportunityCard = (props) => {

  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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

        const data = await response.json()

        const savedIds = data.data.savedOpportunities || []

        setSaved(
          savedIds.some(id =>
            (typeof id === 'string' ? id : id._id) === props.id
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

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Could not update saved opportunity')
        return
      }

      setSaved(!saved)
      alert(data.message)
    } catch (error) {
      console.log('Save error:', error)
      alert('Unable to connect to server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.company}</p>
      <p>{props.location}</p>
      <p>{props.type}</p>

      <button onClick={handleSave} disabled={saving}>
        {saving
          ? 'Please wait...'
          : saved
            ? '❤️ Saved'
            : '🤍 Save Opportunity'}
      </button>

      <button
        onClick={() => navigate(`/edit-opportunity/${props.id}`)}
      >
        Edit
      </button>

      <button
        onClick={async () => {
          try {
            const response = await fetch(
              `http://localhost:5000/api/opportunities/${props.id}`,
              { method: 'DELETE' }
            )

            if (!response.ok) {
              alert('Failed to delete opportunity')
              return
            }

            props.onDelete(props.id)
          } catch (error) {
            console.log('Delete error:', error)
            alert('Unable to connect to server')
          }
        }}
      >
        Delete
      </button>

      <hr />
    </div>
  )
}

export default OpportunityCard