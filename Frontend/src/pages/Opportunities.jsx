import { useEffect, useState } from 'react'
import OpportunityCard from '../components/opportunity/OpportunityCard'

const Opportunities = () => {

  const [opportunities, setOpportunities] = useState([])

  useEffect(() => {

    fetch('http://localhost:5000/api/opportunities')
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setOpportunities(data)
      })
      .catch((error) => {
        console.log("Error:", error)
      })

  }, [])

  return (
    <div>
      <h1>Available Opportunities</h1>

      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.title}
          title={opportunity.title}
          company={opportunity.company}
          location={opportunity.location}
          type={opportunity.type}
        />
      ))}

    </div>
  )
}

export default Opportunities