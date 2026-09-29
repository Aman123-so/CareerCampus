import { useState } from 'react'

const OpportunityCard = (props) => {

  const [saved, setSaved] = useState(false)

  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.company}</p>
      <p>{props.location}</p>
      <p>{props.type}</p>

      <button onClick={() => setSaved(!saved)}>
        {saved ? "❤️ Saved" : "🤍 Save Opportunity"}
      </button>

      <hr />
    </div>
  )
}

export default OpportunityCard