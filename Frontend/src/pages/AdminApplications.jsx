
import { useEffect, useState } from 'react'

const AdminApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const statuses = [
    'Pending',
    'Reviewed',
    'Shortlisted',
    'Rejected',
    'Accepted'
  ]

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await fetch(
        'http://localhost:5000/api/applications/all',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to fetch applications')
      }

      setApplications(result.data || [])
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleStatusChange = async (applicationId, status) => {
    try {
      setError('')

      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to update status')
      }

      setApplications((previous) =>
        previous.map((application) =>
          application._id === applicationId
            ? { ...application, status: result.data.status }
            : application
        )
      )
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
  }

  if (loading) {
    return <p style={{ padding: '24px' }}>Loading applications...</p>
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Manage Applications</h1>
      <p>Total applications: {applications.length}</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!error && applications.length === 0 && (
        <p>No student applications found yet.</p>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {applications.map((application) => (
          <div
            key={application._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '18px'
            }}
          >
            <h3>
              {application.opportunity?.title || 'Opportunity unavailable'}
            </h3>

            <p>
              <strong>Company:</strong>{' '}
              {application.opportunity?.company || 'N/A'}
            </p>

            <p>
              <strong>Student:</strong>{' '}
              {application.student?.name || 'Unknown'}
            </p>

            <p>
              <strong>Email:</strong>{' '}
              {application.student?.email || 'N/A'}
            </p>

            <p>
              <strong>Applied on:</strong>{' '}
              {application.createdAt
                ? new Date(application.createdAt).toLocaleDateString()
                : 'N/A'}
            </p>

            <label>
              <strong>Application status:</strong>{' '}
              <select
                value={application.status}
                onChange={(e) =>
                  handleStatusChange(application._id, e.target.value)
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminApplications
