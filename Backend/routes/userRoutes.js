
const express = require('express')
const User = require('../models/User')
const Opportunity = require('../models/Opportunity')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// REGISTER API — NEW USERS ARE ALWAYS STUDENTS
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Do not accept role from req.body.
    // Public registrations always receive the student role.
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student'
    })

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error.message)

    res.status(500).json({
      message: 'Registration failed'
    })
  }
})

// LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student'
      }
    })
  } catch (error) {
    console.error('Login error:', error.message)

    res.status(500).json({
      message: 'Login failed'
    })
  }
})

// PROTECTED PROFILE API
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.json({
      message: 'Profile fetched successfully',
      data: user
    })
  } catch (error) {
    console.error('Profile error:', error.message)

    res.status(500).json({
      message: 'Unable to fetch profile'
    })
  }
})

// GET SAVED OPPORTUNITIES
router.get('/saved-opportunities', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('savedOpportunities')
      .select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.json({
      message: 'Saved opportunities fetched successfully',
      data: user.savedOpportunities
    })
  } catch (error) {
    console.error('Saved opportunities error:', error.message)

    res.status(500).json({
      message: 'Unable to fetch saved opportunities'
    })
  }
})

module.exports = router
