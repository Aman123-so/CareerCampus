import { useEffect, useMemo, useState } from 'react'
import './AdminApplications.css'

const STATUSES = [
  'Pending',
  'Reviewed',
  'Shortlisted',
  'Rejected',
  'Accepted'
]

const AdminApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please log in to manage applications.')
      }

      const response = await fetch(
        '${import.meta.env.VITE_API_URL}/api/applications/all',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to fetch applications.')
      }

      setApplications(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(err.message || 'Something went wrong.')
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
      setNotice('')
      setUpdatingId(applicationId)

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please log in again.')
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/applications/${applicationId}/status`,
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
        throw new Error(result.message || 'Unable to update status.')
      }

      setApplications((previous) =>
        previous.map((application) =>
          application._id === applicationId
            ? { ...application, status: result.data.status }
            : application
        )
      )

      setNotice(`Application status updated to ${result.data.status}.`)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const opportunity = application.opportunity || {}
      const student = application.student || {}

      const searchableText = [
        opportunity.title,
        opportunity.company,
        student.name,
        student.email,
        application.currentYear,
        application.branch,
        application.collegeName,
        application.phoneNumber,
        application.officialEmail
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = searchableText.includes(
        search.trim().toLowerCase()
      )

      const matchesStatus =
        statusFilter === 'All' || application.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, search, statusFilter])

  const getStatusClass = (status) => {
    const classNames = {
      Pending: 'admin-app-status-pending',
      Reviewed: 'admin-app-status-reviewed',
      Shortlisted: 'admin-app-status-shortlisted',
      Accepted: 'admin-app-status-accepted',
      Rejected: 'admin-app-status-rejected'
    }

    return classNames[status] || 'admin-app-status-default'
  }

  const formatDate = (date) => {
    if (!date) return 'Not available'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) return 'Not available'

    return parsed.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const pendingCount = applications.filter(
    (application) => application.status === 'Pending'
  ).length

  const shortlistedCount = applications.filter(
    (application) => application.status === 'Shortlisted'
  ).length

  const acceptedCount = applications.filter(
    (application) => application.status === 'Accepted'
  ).length

  if (loading) {
    return (
      <main className="admin-applications-page">
        <div className="admin-app-loading">
          <span className="admin-app-spinner" />
          <h2>Loading applications</h2>
          <p>Fetching student application details...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-applications-page">
      <div className="admin-app-container">
        <header className="admin-app-header">
          <div>
            <span className="admin-app-eyebrow">
              SMART CAMPUS / ADMIN
            </span>
            <h1>Manage Applications</h1>
            <p>
              Review student applications and manage recruitment progress.
            </p>
          </div>

          <button
            type="button"
            className="admin-app-refresh-btn"
            onClick={fetchApplications}
            disabled={updatingId !== null}
          >
            ↻ Refresh
          </button>
        </header>

        <section className="admin-app-stats">
          <article className="admin-app-stat-card">
            <span className="admin-app-stat-icon admin-app-blue">▤</span>
            <div>
              <p>Total Applications</p>
              <h2>{applications.length}</h2>
            </div>
          </article>

          <article className="admin-app-stat-card">
            <span className="admin-app-stat-icon admin-app-orange">◷</span>
            <div>
              <p>Pending Review</p>
              <h2>{pendingCount}</h2>
            </div>
          </article>

          <article className="admin-app-stat-card">
            <span className="admin-app-stat-icon admin-app-purple">☆</span>
            <div>
              <p>Shortlisted</p>
              <h2>{shortlistedCount}</h2>
            </div>
          </article>

          <article className="admin-app-stat-card">
            <span className="admin-app-stat-icon admin-app-green">✓</span>
            <div>
              <p>Accepted</p>
              <h2>{acceptedCount}</h2>
            </div>
          </article>
        </section>

        <section className="admin-app-list-panel">
          <div className="admin-app-list-heading">
            <div>
              <h2>Student Applications</h2>
              <p>Review candidate details and update application statuses.</p>
            </div>

            <span className="admin-app-count">
              {filteredApplications.length} results
            </span>
          </div>

          {error && (
            <div className="admin-app-message admin-app-error" role="alert">
              <span>!</span>
              {error}
            </div>
          )}

          {notice && (
            <div className="admin-app-message admin-app-success" role="status">
              <span>✓</span>
              {notice}
            </div>
          )}

          <div className="admin-app-toolbar">
            <label className="admin-app-search">
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student, email, company or role..."
                aria-label="Search applications"
              />
            </label>

            <select
              className="admin-app-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter applications by status"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {applications.length === 0 ? (
            <div className="admin-app-empty">
              <div className="admin-app-empty-icon">▤</div>
              <h3>No applications yet</h3>
              <p>Student applications will appear here when submitted.</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="admin-app-empty">
              <div className="admin-app-empty-icon">⌕</div>
              <h3>No matching applications</h3>
              <p>Try changing your search or status filter.</p>
              <button
                type="button"
                className="admin-app-clear-btn"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('All')
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="admin-app-cards">
              {filteredApplications.map((application) => {
                const opportunity = application.opportunity || {}
                const student = application.student || {}
                const isUpdating = updatingId === application._id

                return (
                  <article
                    className="admin-app-card"
                    key={application._id}
                  >
                    <div className="admin-app-card-top">
                      <div className="admin-app-role">
                        <div className="admin-app-company-icon">
                          {(opportunity.company || 'C')
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h3>
                            {opportunity.title || 'Opportunity unavailable'}
                          </h3>
                          <p className="admin-app-company-name">
                            {opportunity.company || 'Company unavailable'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`admin-app-status ${getStatusClass(
                          application.status
                        )}`}
                      >
                        <span className="admin-app-status-dot" />
                        {application.status || 'Unknown'}
                      </span>
                    </div>

                    <div className="admin-app-details">
                      <div className="admin-app-detail">
                        <span className="admin-app-detail-label">
                          STUDENT
                        </span>
                        <strong>{student.name || 'Unknown student'}</strong>
                      </div>

                      <div className="admin-app-detail">
                        <span className="admin-app-detail-label">
                          EMAIL ADDRESS
                        </span>
                        <span className="admin-app-email">
                          {student.email || 'Not available'}
                        </span>
                      </div>

                      <div className="admin-app-detail">
                        <span className="admin-app-detail-label">
                          APPLIED ON
                        </span>
                        <strong>{formatDate(application.createdAt)}</strong>
                      </div>

                      <div className="admin-app-detail">
                        <span className="admin-app-detail-label">
                          APPLICATION ID
                        </span>
                        <span className="admin-app-id">
                          {(application._id || '').slice(-8).toUpperCase() ||
                            'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable student details - uses existing CSS classes */}
                    <details>
                      <summary>
                        View Student Details
                      </summary>

                      <div className="admin-app-details">
                        <div className="admin-app-detail">
                          <span className="admin-app-detail-label">
                            CURRENT YEAR
                          </span>
                          <strong>
                            {application.currentYear || 'Not provided'}
                          </strong>
                        </div>

                        <div className="admin-app-detail">
                          <span className="admin-app-detail-label">
                            BRANCH
                          </span>
                          <strong>
                            {application.branch || 'Not provided'}
                          </strong>
                        </div>

                        <div className="admin-app-detail">
                          <span className="admin-app-detail-label">
                            COLLEGE NAME
                          </span>
                          <strong>
                            {application.collegeName || 'Not provided'}
                          </strong>
                        </div>

                        <div className="admin-app-detail">
                          <span className="admin-app-detail-label">
                            PASSING YEAR
                          </span>
                          <strong>
                            {application.passingYear || 'Not provided'}
                          </strong>
                        </div>

                        <div className="admin-app-detail">
                          <span className="admin-app-detail-label">
                            PHONE NUMBER
                          </span>
                          <strong>
                            {application.phoneNumber || 'Not provided'}
                          </strong>
                        </div>

                        <div className="admin-app-detail">
                          <span className="admin-app-detail-label">
                            OFFICIAL EMAIL
                          </span>
                          <span className="admin-app-email">
                            {application.officialEmail || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </details>

                    <div className="admin-app-card-footer">
                      <span className="admin-app-update-label">
                        Update application status
                      </span>

                      <select
                        className={`admin-app-status-select ${getStatusClass(
                          application.status
                        )}`}
                        value={application.status || 'Pending'}
                        disabled={isUpdating || updatingId !== null}
                        onChange={(event) =>
                          handleStatusChange(
                            application._id,
                            event.target.value
                          )
                        }
                        aria-label={`Update status for ${
                          student.name || 'student'
                        } - ${opportunity.title || 'application'}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {isUpdating && (
                        <span className="admin-app-saving">Saving...</span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminApplications