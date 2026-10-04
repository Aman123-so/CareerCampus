import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const EditOpportunity = () => {

  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [type, setType] = useState("")


  useEffect(() => {

    fetch(`http://localhost:5000/api/opportunities/${id}`)
      .then((response) => response.json())
      .then((data) => {

        console.log(data)

        setTitle(data.title)
        setCompany(data.company)
        setLocation(data.location)
        setType(data.type)

      })
      .catch((error) => {
        console.log("Error:", error)
      })

  }, [id])


  const handleUpdate = () => {

    fetch(`http://localhost:5000/api/opportunities/${id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        title: title,
        company: company,
        location: location,
        type: type
      })
    })

     .then((response) => response.json())

    .then((data) => {

      console.log("UPDATE RESPONSE:", data)

      alert("Opportunity updated successfully")

      navigate("/opportunities")

    })

    .catch((error) => {
      console.log("Error:", error)
    })

}


  return (
    <div>

      <h2>Edit Opportunity</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />

      <br /><br />

      <input
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
      />

      <br /><br />

      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
      />

      <br /><br />

      <input
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder="Type"
      />

      <br /><br />

      <button onClick={handleUpdate}>
        Update
      </button>

    </div>
  )
}

export default EditOpportunity