
import { useEffect, useState } from 'react'
import OpportunityCard from '../components/opportunity/OpportunityCard'
import './Opportunities.css'

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([])
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleDelete = (id) => {
    setOpportunities((previous) =>
      previous.filter((opportunity) => opportunity._id !== id)
    )
  }

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setError('')

        const response = await fetch(
          'http://localhost:5000/api/opportunities'
        )

        if (!response.ok) {
          throw new Error('Unable to fetch opportunities')
        }

        const data = await response.json()

        setOpportunities(Array.isArray(data) ? data : data.data || [])
      } catch (error) {
        setError(error.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [])

  const locations = [
    'All',
    ...new Set(opportunities.map((item) => item.location).filter(Boolean))
  ]

  const types = [
    'All',
    ...new Set(opportunities.map((item) => item.type).filter(Boolean))
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
          <p>Please wait while we load the latest listings.</p>
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
            <h2>Explore Listings</h2>
            <p>Search and filter opportunities that suit you.</p>
          </div>

          <span className="results-count">
            {filteredOpportunities.length} results
          </span>
        </div>

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
              <OpportunityCard
                key={opportunity._id}
                id={opportunity._id}
                title={opportunity.title}
                company={opportunity.company}
                location={opportunity.location}
                type={opportunity.type}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Opportunities
