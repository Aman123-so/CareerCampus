
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const MyApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Please login to view your applications')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/applications/my-applications',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || 'Unable to fetch applications'
          )
        }

        setApplications(result.data || [])
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  if (loading) {
    return <p>Loading your applications...</p>
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <Link to="/login">Login</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>My Applications</h1>

      {applications.length === 0 ? (
        <div>
          <p>You haven't applied to any opportunities yet.</p>
          <Link to="/opportunities">Browse Opportunities</Link>
        </div>
      ) : (
        applications.map((application) => (
          <div key={application._id}>
            <h3>
              {application.opportunity?.title || 'Opportunity unavailable'}
            </h3>

            <p>
              Company: {application.opportunity?.company || 'N/A'}
            </p>

            <p>
              Location: {application.opportunity?.location || 'N/A'}
            </p>

            <p>
              Type: {application.opportunity?.type || 'N/A'}
            </p>

            <p>Status: {application.status}</p>

            <p>
              Applied on:{' '}
              {new Date(application.createdAt).toLocaleDateString()}
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  )
}

export default MyApplications
