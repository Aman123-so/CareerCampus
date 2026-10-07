import { useState } from 'react'

const Login = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {

  fetch('http://localhost:5000/api/users/login', {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
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

      <h2>Login</h2>

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

      <button onClick={handleLogin}>
        Login
      </button>

    </div>
  )
}

export default Login