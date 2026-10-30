
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './SavedOpportunities.css'

const SavedOpportunities = () => {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  const fetchSavedOpportunities = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please log in to view your saved opportunities.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/saved-opportunities`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to fetch saved opportunities.'
        )
      }

      setOpportunities(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(err.message || 'Something went wrong.')
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
      setError('Please log in to continue.')
      return
    }

    try {
      setError('')
      setRemovingId(id)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/opportunities/${id}/save`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to remove this saved opportunity.'
        )
      }

      setOpportunities((previous) =>
        previous.filter((opportunity) => opportunity._id !== id)
      )
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setRemovingId(null)
    }
  }

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const searchableText = [
        opportunity.title,
        opportunity.company,
        opportunity.location,
        opportunity.type
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = searchableText.includes(
        search.trim().toLowerCase()
      )

      const matchesType =
        typeFilter === 'All' || opportunity.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [opportunities, search, typeFilter])

  if (loading) {
    return (
      <main className="saved-page">
        <div className="saved-loading">
          <span className="saved-spinner" />
          <h2>Loading saved opportunities</h2>
          <p>Getting your bookmarked career opportunities ready.</p>
        </div>
      </main>
    )
  }

  if (error && opportunities.length === 0) {
    return (
      <main className="saved-page">
        <section className="saved-message-card">
          <div className="saved-message-icon">!</div>
          <h2>Unable to load saved opportunities</h2>
          <p>{error}</p>
          {!localStorage.getItem('token') && (
            <Link className="saved-primary-btn" to="/login">
              Sign in
            </Link>
          )}
          <button
            className="saved-secondary-btn"
            type="button"
            onClick={fetchSavedOpportunities}
          >
            Try again
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="saved-page">
      <div className="saved-container">
        <div className="saved-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Saved Opportunities</span>
        </div>

        <header className="saved-header">
          <div>
            <span className="saved-eyebrow">YOUR CAREER COLLECTION</span>
            <h1>Saved Opportunities</h1>
            <p>
              Keep track of the roles you love and come back when you're ready
              to apply.
            </p>
          </div>

          <div className="saved-total-card">
            <span className="saved-total-icon">♡</span>
            <div>
              <span>Saved roles</span>
              <strong>{opportunities.length}</strong>
            </div>
          </div>
        </header>

        {error && (
          <div className="saved-error-message" role="alert">
            {error}
          </div>
        )}

        <section className="saved-list-panel">
          <div className="saved-list-heading">
            <div>
              <h2>Your collection</h2>
              <p>
                {opportunities.length === 1
                  ? '1 opportunity saved for later'
                  : `${opportunities.length} opportunities saved for later`}
              </p>
            </div>

            <Link className="saved-browse-btn" to="/opportunities">
              + Explore opportunities
            </Link>
          </div>

          {opportunities.length > 0 && (
            <div className="saved-toolbar">
              <label className="saved-search">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search title, company or location..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search saved opportunities"
                />
              </label>

              <select
                className="saved-filter"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                aria-label="Filter by opportunity type"
              >
                <option value="All">All types</option>
                <option value="Internship">Internships</option>
                <option value="Job">Jobs</option>
              </select>
            </div>
          )}

          {opportunities.length === 0 ? (
            <div className="saved-empty">
              <div className="saved-empty-icon">♡</div>
              <h3>Your next opportunity starts here</h3>
              <p>
                You haven't saved any opportunities yet. Browse available
                roles and save the ones you want to explore later.
              </p>
              <Link className="saved-primary-btn" to="/opportunities">
                Browse opportunities <span>→</span>
              </Link>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="saved-empty saved-no-results">
              <div className="saved-empty-icon">⌕</div>
              <h3>No matching opportunities</h3>
              <p>Try another search term or change the type filter.</p>
              <button
                className="saved-secondary-btn"
                type="button"
                onClick={() => {
                  setSearch('')
                  setTypeFilter('All')
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="saved-grid">
              {filteredOpportunities.map((opportunity) => {
                const isRemoving = removingId === opportunity._id

                return (
                  <article
                    className="saved-opportunity-card"
                    key={opportunity._id}
                  >
                    <div className="saved-card-top">
                      <div className="saved-company-icon">
                        {(opportunity.company || 'C')
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span
                        className={`saved-type-badge ${
                          opportunity.type === 'Job'
                            ? 'saved-type-job'
                            : 'saved-type-internship'
                        }`}
                      >
                        {opportunity.type || 'Opportunity'}
                      </span>
                    </div>

                    <div className="saved-card-content">
                      <h3>{opportunity.title || 'Untitled opportunity'}</h3>
                      <p className="saved-company">
                        {opportunity.company || 'Company not specified'}
                      </p>

                      <div className="saved-meta">
                        <span>
                          <span className="saved-meta-icon">⌖</span>
                          {opportunity.location || 'Location not specified'}
                        </span>
                        <span>
                          <span className="saved-meta-icon">▣</span>
                          {opportunity.type || 'Opportunity'}
                        </span>
                      </div>
                    </div>

                    <div className="saved-card-footer">
                      <Link
                        className="saved-apply-btn"
                        to="/opportunities"
                      >
                        View opportunity <span>→</span>
                      </Link>

                      <button
                        className="saved-unsave-btn"
                        type="button"
                        onClick={() => handleUnsave(opportunity._id)}
                        disabled={removingId !== null}
                        aria-label={`Remove ${opportunity.title || 'opportunity'} from saved list`}
                      >
                        {isRemoving ? 'Removing...' : '♥ Unsave'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <div className="saved-footer-note">
          <span>♡</span>
          <p>
            Your saved list helps you keep promising opportunities in one
            place. Remember to apply before deadlines.
          </p>
        </div>
      </div>
    </main>
  )
}

export default SavedOpportunities
