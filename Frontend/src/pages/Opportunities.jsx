
import { useEffect, useState } from 'react'
import OpportunityCard from '../components/opportunity/OpportunityCard'
import './Opportunities.css'

const API_URL = 'http://localhost:5000/api/opportunities'

const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch (error) {
    console.error('Unable to read logged-in user:', error)
    return null
  }
}

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([])
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recommendationMode, setRecommendationMode] = useState(false)
  const [user, setUser] = useState(getLoggedInUser)

  // Role ko normalize kar rahe hain.
  const isAdmin =
    String(user?.role || '').trim().toLowerCase() === 'admin'

  // Login/logout par user update hoga.
  useEffect(() => {
    const updateUser = () => {
      setUser(getLoggedInUser())
    }

    updateUser()
    window.addEventListener('userChanged', updateUser)

    return () => {
      window.removeEventListener('userChanged', updateUser)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchOpportunities = async () => {
      try {
        setLoading(true)
        setError('')

        // Sabse pehle normal opportunities load karo.
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Unable to fetch opportunities')
        }

        const result = await response.json()
        const allOpportunities = Array.isArray(result)
          ? result
          : result.data || []

        if (cancelled) return

        setOpportunities(allOpportunities)

        // Admin ke liye recommendations fetch nahi karni.
        const loggedInUser = getLoggedInUser()
        const adminUser =
          String(loggedInUser?.role || '').trim().toLowerCase() ===
          'admin'

        if (adminUser) {
          setRecommendationMode(false)
          return
        }

        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('userToken')

        if (!token) {
          setRecommendationMode(false)
          return
        }

        // Student ke liye skill-based recommendations.
        try {
          const matchResponse = await fetch(
            `${API_URL}/recommended/matches`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )

          if (cancelled) return

          if (!matchResponse.ok) {
            setRecommendationMode(false)
            return
          }

          const matchResult = await matchResponse.json()
          const recommendations = matchResult.data

          if (Array.isArray(recommendations)) {
            setOpportunities(recommendations)
            setRecommendationMode(true)
          } else {
            setRecommendationMode(false)
          }
        } catch (matchError) {
          if (!cancelled) {
            console.error(
              'Unable to fetch recommendations:',
              matchError.message
            )
            setRecommendationMode(false)
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message || 'Something went wrong')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchOpportunities()

    return () => {
      cancelled = true
    }
  }, [])

  const locations = [
    'All',
    ...new Set(
      opportunities.map((item) => item.location).filter(Boolean)
    )
  ]

  const types = [
    'All',
    ...new Set(
      opportunities.map((item) => item.type).filter(Boolean)
    )
  ]

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch =
      (opportunity.title || '').toLowerCase().includes(searchText) ||
      (opportunity.company || '').toLowerCase().includes(searchText)

    const matchesLocation =
      locationFilter === 'All' ||
      opportunity.location === locationFilter

    const matchesType =
      typeFilter === 'All' ||
      opportunity.type === typeFilter

    return matchesSearch && matchesLocation && matchesType
  })

  const clearFilters = () => {
    setSearch('')
    setLocationFilter('All')
    setTypeFilter('All')
  }

  if (loading) {
    return (
      <main className="opportunities-page">
        <div className="opportunities-message">
          <div className="loading-spinner" />
          <h2>Finding opportunities for you...</h2>
          <p>Loading opportunities and skill matches.</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="opportunities-page">
        <div className="opportunities-message error-message">
          <h2>Unable to load opportunities</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="opportunities-page">
      <section className="opportunities-hero">
        <span className="opportunities-eyebrow">
          YOUR NEXT CAREER MOVE
        </span>

        <h1>
          Discover Your Next
          <span> Opportunity</span>
        </h1>

        <p>
          Explore internships and jobs, find the right fit, and take the next
          step in your career journey.
        </p>

        <div className="opportunities-summary">
          <div className="summary-icon">💼</div>
          <div>
            <strong>{opportunities.length}</strong>
            <span>Opportunities available</span>
          </div>
        </div>
      </section>

      <section className="opportunities-content">
        <div className="opportunities-section-heading">
          <div>
            <h2>
              {!isAdmin && recommendationMode
                ? 'Recommended For You'
                : isAdmin
                  ? 'Manage Opportunities'
                  : 'Explore Listings'}
            </h2>

            <p>
              {!isAdmin && recommendationMode
                ? 'Opportunities ranked by how well your skills match.'
                : isAdmin
                  ? 'Manage your opportunity listings.'
                  : 'Search and filter opportunities that suit you.'}
            </p>
          </div>

          <span className="results-count">
            {filteredOpportunities.length} results
          </span>
        </div>

        {/* Skill-match message sirf student ke liye. */}
        {!isAdmin && recommendationMode && (
          <div className="matching-info">
            <span>🎯</span>
            <p>
              Your match score is calculated using your profile skills and
              each opportunity's required skills.
            </p>
          </div>
        )}

        <div className="opportunities-filters">
          <div className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="text"
              aria-label="Search by title or company"
              placeholder="Search by title or company..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            aria-label="Filter by location"
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location === 'All' ? 'All Locations' : location}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'All' ? 'All Types' : type}
              </option>
            ))}
          </select>

          {(search || locationFilter !== 'All' || typeFilter !== 'All') && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredOpportunities.length === 0 ? (
          <div className="opportunities-empty">
            <div className="empty-icon">🔎</div>
            <h3>No opportunities found</h3>
            <p>
              Try a different keyword or change your filters to see more
              opportunities.
            </p>
            <button onClick={clearFilters}>Clear all filters</button>
          </div>
        ) : (
          <div className="opportunities-grid">
            {filteredOpportunities.map((opportunity) => (
              <article
                className="recommended-opportunity"
                key={opportunity._id}
              >
                {/* Ye poora section sirf student ke liye hai. */}
                {!isAdmin && recommendationMode && (
                  <div className="match-details">
                    <div className="match-heading">
                      <span>Skill Match</span>
                      <strong>
                        {opportunity.matchPercentage ?? 0}%
                      </strong>
                    </div>

                    <div
                      className="match-progress-track"
                      role="progressbar"
                      aria-label="Skill match percentage"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.max(
                        0,
                        Math.min(
                          100,
                          opportunity.matchPercentage ?? 0
                        )
                      )}
                    >
                      <div
                        className="match-progress-fill"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              opportunity.matchPercentage ?? 0
                            )
                          )}%`
                        }}
                      />
                    </div>

                    <div className="skill-group">
                      <span className="skill-label">Matched skills</span>

                      {opportunity.matchedSkills?.length > 0 ? (
                        <div className="skill-tags">
                          {opportunity.matchedSkills.map((skill) => (
                            <span
                              className="skill-tag skill-matched"
                              key={skill}
                            >
                              ✓ {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="no-skills">
                          No matching skills yet
                        </p>
                      )}
                    </div>

                    <div className="skill-group">
                      <span className="skill-label">Skills to learn</span>

                      {opportunity.missingSkills?.length > 0 ? (
                        <div className="skill-tags">
                          {opportunity.missingSkills.map((skill) => (
                            <span
                              className="skill-tag skill-missing"
                              key={skill}
                            >
                              + {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="no-skills">
                          You have all the required skills!
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <OpportunityCard
                  id={opportunity._id}
                  title={opportunity.title}
                  company={opportunity.company}
                  location={opportunity.location}
                  type={opportunity.type}
                  opportunity={opportunity}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Opportunities
