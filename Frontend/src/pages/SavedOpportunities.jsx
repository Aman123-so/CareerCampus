
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const SavedOpportunities = () => {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)

  const fetchSavedOpportunities = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please login to view saved opportunities')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/users/saved-opportunities',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to fetch saved opportunities'
        )
      }

      setOpportunities(result.data || [])
      setError('')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedOpportunities()
  }, [])

  const handleUnsave = async (id) => {
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please login to continue')
      return
    }

    setRemovingId(id)

    try {
      const response = await fetch(
        `http://localhost:5000/api/opportunities/${id}/save`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to unsave opportunity')
      }

      // Remove it from the page after successful API response
      setOpportunities((previous) =>
        previous.filter((opportunity) => opportunity._id !== id)
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return <p>Loading saved opportunities...</p>
  }

  if (error && opportunities.length === 0) {
    return (
      <div>
        <p>{error}</p>
        <Link to="/opportunities">Browse Opportunities</Link>
      </div>
    )
  }

  return (
    <div>
      <h2>My Saved Opportunities</h2>

      {error && <p>{error}</p>}

      {opportunities.length === 0 ? (
        <p>You haven't saved any opportunities yet.</p>
      ) : (
        opportunities.map((opportunity) => (
          <div key={opportunity._id}>
            <h3>{opportunity.title}</h3>
            <p>Company: {opportunity.company}</p>
            <p>Location: {opportunity.location}</p>
            <p>Type: {opportunity.type}</p>

            <button
              onClick={() => handleUnsave(opportunity._id)}
              disabled={removingId === opportunity._id}
            >
              {removingId === opportunity._id
                ? 'Removing...'
                : '❤️ Unsave'}
            </button>

            <hr />
          </div>
        ))
      )}

      <Link to="/opportunities">Browse Opportunities</Link>
    </div>
  )
}

export default SavedOpportunities
