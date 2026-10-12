
const express = require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

// REGISTER API
router.post('/register', async (req, res) => {

  try {

    const { name, email, password } = req.body

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    })

    res.status(201).json({
      message: "User registered successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    })

  } catch (error) {

    res.status(500).json({
      message: "Registration failed"
    })

  }

})


// LOGIN API
router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      })
    }

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Send token and safe user data
    res.json({
      message: "Login successful",
      token: token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {

    res.status(500).json({
      message: "Login failed"
    })

  }

})



// PROTECTED PROFILE API
router.get('/profile', authMiddleware, async (req, res) => {

  try {

    const user = await User.findById(req.userId).select('-password')

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    res.json({
      message: "Profile fetched successfully",
      data: user
    })

  } catch (error) {

    res.status(500).json({
      message: "Unable to fetch profile"
    })

  }

})

module.exports = router
