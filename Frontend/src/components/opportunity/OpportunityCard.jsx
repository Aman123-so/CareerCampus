import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const OpportunityCard = (props) => {

  const navigate = useNavigate()
  const [saved, setSaved]= useState(false)

  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.company}</p>
      <p>{props.location}</p>
      <p>{props.type}</p>

     
      {/* Save Button */}

      <button onClick={() => setSaved(!saved)}>
        {saved ? "❤️ Saved" : "🤍 Save Opportunity"}
      </button>

      <button onClick={() => navigate(`/edit-opportunity/${props.id}`)}>
        Edit
      </button>

      <button
        onClick={() => {
          fetch(`http://localhost:5000/api/opportunities/${props.id}`, {
            method: "DELETE"
          })
            .then(() => {
              props.onDelete(props.id)
            })
        }}
      >
        Delete
      </button>

      <hr />
    </div>
  )
}

export default OpportunityCard