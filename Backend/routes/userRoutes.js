const express= require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const router= express.Router()

router.post('/register', async (req, res) => {

  try {

   const hashedPassword = await bcrypt.hash(req.body.password, 10)

const newUser = await User.create({
  name: req.body.name,
  email: req.body.email,
  password: hashedPassword
})

    res.json({
      message: "User registered successfully",
      data: newUser
    })

  } catch (error) {

    res.status(400).json({
      message: error.message
    })

  }

})


//Login route

router.post('/login', async (req, res) => {

  try {

    const user = await User.findOne({
      email: req.body.email
    })

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid password"
      })
    }

    res.json({
      message: "Login successful",
      data: user
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

})

module.exports = router


