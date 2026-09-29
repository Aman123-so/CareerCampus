import React from 'react'
import {useState} from 'react'
const Login = () => {
    const[email, setEmail]= useState('');
    const [password, setPassword] = useState('')
    const [error, setError]= useState('')

    const handleLogin = (e) => {
      e.preventDefault()

      if(email ===''){
        setError("Plese enter your email")
        return 
      }

      if(password ===''){
        setError("Plese enter your password")
        return 
      }
      setError("")
    console.log("Email:", email)
    console.log("Password:", password)
  }
  return (
    <div>
      <h1>Login  </h1>
      
      <form onSubmit={handleLogin}>

      {error && <p>{error}</p>}

      <input type="email" placeholder='Enter your Email here' value={email}  onChange={(e)=>setEmail(e.target.value)}/>
     <br /><br />
    <input type="password" placeholder='Enter your password'  value={password} onChange={(e)=>setPassword(e.target.value)}/>
    <br /><br />
    <button type='submit'>Login</button>
    </form>
    </div>
  )
}

export default Login
