
import { useEffect, useState } from 'react'
import OpportunityCard from '../components/opportunity/OpportunityCard'

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
        const response = await fetch(
          'http://localhost:5000/api/opportunities'
        )

        if (!response.ok) {
          throw new Error('Unable to fetch opportunities')
        }

        const data = await response.json()
        setOpportunities(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [])

  // Create unique location and type options from database data
  const locations = [
    'All',
    ...new Set(opportunities.map((item) => item.location).filter(Boolean))
  ]

  const types = [
    'All',
    ...new Set(opportunities.map((item) => item.type).filter(Boolean))
  ]

  // Apply search and filters
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchText = search.toLowerCase()

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

  if (loading) {
    return <p>Loading opportunities...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  return (
    <div>
      <h1>Available Opportunities</h1>

      {/* Search by job title or company */}
      <input
        type="text"
        placeholder="Search by title or company..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {/* Filter by location */}
      <select
        value={locationFilter}
        onChange={(event) => setLocationFilter(event.target.value)}
      >
        {locations.map((location) => (
          <option key={location} value={location}>
            {location === 'All' ? 'All Locations' : location}
          </option>
        ))}
      </select>

      {/* Filter by opportunity type */}
      <select
        value={typeFilter}
        onChange={(event) => setTypeFilter(event.target.value)}
      >
        {types.map((type) => (
          <option key={type} value={type}>
            {type === 'All' ? 'All Types' : type}
          </option>
        ))}
      </select>

      <p>Showing {filteredOpportunities.length} opportunities</p>

      {filteredOpportunities.length === 0 ? (
        <p>No opportunities found. Try changing your search or filters.</p>
      ) : (
        filteredOpportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity._id}
            id={opportunity._id}
            title={opportunity.title}
            company={opportunity.company}
            location={opportunity.location}
            type={opportunity.type}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  )
}

export default Opportunities
