import { useEffect, useState } from 'react'

const Profile = () => {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please login first')
      setLoading(false)
      return
    }

    fetch('http://localhost:5000/api/users/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch profile')
        }

        setUser(data.data)
      })
      .catch((error) => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })

  }, [])

  if (loading) {
    return <h2>Loading profile...</h2>
  }

  if (error) {
    return <h2>{error}</h2>
  }

  return (
    <div>
      <h2>My Profile</h2>

      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  )
}

export default Profile