
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './MyApplications.css'

const MyApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Please login to view your applications.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          '${import.meta.env.VITE_API_URL}/api/applications/my-applications',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || 'Unable to fetch applications.'
          )
        }

        setApplications(Array.isArray(result.data) ? result.data : [])
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const opportunity = application.opportunity || {}

      const searchText = [
        opportunity.title,
        opportunity.company,
        opportunity.location,
        opportunity.type
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = searchText.includes(search.toLowerCase().trim())
      const matchesStatus =
        statusFilter === 'All' || application.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, search, statusFilter])

  const getStatusClass = (status) => {
    const classes = {
      Pending: 'application-status-pending',
      Reviewed: 'application-status-reviewed',
      Shortlisted: 'application-status-shortlisted',
      Accepted: 'application-status-accepted',
      Rejected: 'application-status-rejected'
    }

    return classes[status] || 'application-status-default'
  }

  const formatDate = (date) => {
    if (!date) return 'Date unavailable'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable'
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const counts = {
    total: applications.length,
    pending: applications.filter((app) => app.status === 'Pending').length,
    shortlisted: applications.filter(
      (app) => app.status === 'Shortlisted'
    ).length,
    accepted: applications.filter((app) => app.status === 'Accepted').length
  }

  if (loading) {
    return (
      <main className="my-applications-page">
        <div className="applications-loading">
          <span className="applications-spinner" />
          <h2>Loading your applications</h2>
          <p>Please wait while we fetch your application details.</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="my-applications-page">
        <section className="applications-message-card">
          <div className="applications-empty-icon">🔒</div>
          <h1>Unable to show applications</h1>
          <p>{error}</p>
          <Link className="applications-primary-btn" to="/login">
            Go to Login
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="my-applications-page">
      <div className="applications-container">
        <header className="applications-header">
          <div>
            <span className="applications-eyebrow">
              STUDENT WORKSPACE
            </span>
            <h1>My Applications</h1>
            <p>
              Track your applications and stay updated on your career journey.
            </p>
          </div>

          <Link
            to="/opportunities"
            className="applications-primary-btn"
          >
            + Explore Opportunities
          </Link>
        </header>

        <section className="applications-stats">
          <article className="applications-stat-card">
            <span className="applications-stat-icon stat-icon-blue">📄</span>
            <div>
              <p>Total Applications</p>
              <h2>{counts.total}</h2>
            </div>
          </article>

          <article className="applications-stat-card">
            <span className="applications-stat-icon stat-icon-orange">⏳</span>
            <div>
              <p>Pending</p>
              <h2>{counts.pending}</h2>
            </div>
          </article>

          <article className="applications-stat-card">
            <span className="applications-stat-icon stat-icon-purple">⭐</span>
            <div>
              <p>Shortlisted</p>
              <h2>{counts.shortlisted}</h2>
            </div>
          </article>

          <article className="applications-stat-card">
            <span className="applications-stat-icon stat-icon-green">✓</span>
            <div>
              <p>Accepted</p>
              <h2>{counts.accepted}</h2>
            </div>
          </article>
        </section>

        <section className="applications-list-section">
          <div className="applications-list-heading">
            <div>
              <h2>Your Submitted Applications</h2>
              <p>Review your application details and current status.</p>
            </div>

            <span className="applications-count-badge">
              {filteredApplications.length} shown
            </span>
          </div>

          <div className="applications-toolbar">
            <div className="applications-search">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search by role, company or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search applications"
              />
            </div>

            <select
              className="applications-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by application status"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {applications.length === 0 ? (
            <div className="applications-empty">
              <div className="applications-empty-icon">📂</div>
              <h3>No applications yet</h3>
              <p>
                You haven't applied to any opportunities. Explore available
                internships and jobs to get started.
              </p>
              <Link
                to="/opportunities"
                className="applications-primary-btn"
              >
                Browse Opportunities →
              </Link>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="applications-empty">
              <div className="applications-empty-icon">🔎</div>
              <h3>No matching applications</h3>
              <p>Try a different search term or change the status filter.</p>
              <button
                type="button"
                className="applications-reset-btn"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('All')
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="applications-cards">
              {filteredApplications.map((application) => {
                const opportunity = application.opportunity || {}

                return (
                  <article
                    className="application-card"
                    key={application._id}
                  >
                    <div className="application-card-main">
                      <div className="application-company-icon">
                        {(opportunity.company || 'C')
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="application-role-info">
                        <h3>
                          {opportunity.title || 'Opportunity unavailable'}
                        </h3>
                        <p className="application-company">
                          {opportunity.company || 'Company unavailable'}
                        </p>

                        <div className="application-meta">
                          <span>
                            <span aria-hidden="true">📍</span>{' '}
                            {opportunity.location || 'Location unavailable'}
                          </span>
                          <span>
                            <span aria-hidden="true">💼</span>{' '}
                            {opportunity.type || 'Type unavailable'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`application-status ${getStatusClass(
                          application.status
                        )}`}
                      >
                        {application.status || 'Unknown'}
                      </span>
                    </div>

                    <div className="application-card-footer">
                      <span>
                        <span aria-hidden="true">🗓</span>{' '}
                        Applied on {formatDate(application.createdAt)}
                      </span>

                      <span className="application-reference">
                        Application ID: {(application._id || '').slice(-6).toUpperCase() || 'N/A'}
                      </span>
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

export default MyApplications
