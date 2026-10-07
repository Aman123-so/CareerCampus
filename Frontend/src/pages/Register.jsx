import { useState } from 'react'

const Register = () => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = () => {

  fetch('http://localhost:5000/api/users/register', {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      name: name,
      email: email,
      password: password
    })
  })

    .then((response) => response.json())

    .then((data) => {

      console.log(data)

      alert(data.message)

    })

    .catch((error) => {
      console.log("Error:", error)
    })

}

  return (
    <div>

      <h2>Register</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleRegister}>
        Register
      </button>

    </div>
  )
}

export default Register