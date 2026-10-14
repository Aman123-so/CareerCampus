
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AddOpportunity = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Internship'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please login first.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/opportunities',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add opportunity.')
      }

      alert('Opportunity added successfully!')
      navigate('/opportunities')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '30px auto', padding: '20px' }}>
      <h1>Add Opportunity</h1>
      <p>Publish a new job or internship for students.</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Opportunity Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. React Developer Internship"
            value={formData.title}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Company</label>
          <input
            type="text"
            name="company"
            placeholder="e.g. Google"
            value={formData.company}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Location</label>
          <input
            type="text"
            name="location"
            placeholder="e.g. Noida"
            value={formData.location}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="Internship">Internship</option>
            <option value="Job">Job</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Opportunity'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px',
  marginTop: '6px'
}

export default AddOpportunity
