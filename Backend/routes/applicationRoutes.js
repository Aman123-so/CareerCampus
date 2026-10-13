
const express = require('express')
const router = express.Router()

const Application = require('../models/Application')
const Opportunity = require('../models/Opportunity')
const authMiddleware = require('../middleware/authMiddleware')

// APPLY FOR AN OPPORTUNITY
router.post('/:opportunityId', authMiddleware, async (req, res) => {
  try {
    const { opportunityId } = req.params

    // Check whether opportunity exists
    const opportunity = await Opportunity.findById(opportunityId)

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      })
    }

    // Create application for the logged-in user
    const application = await Application.create({
      student: req.userId,
      opportunity: opportunityId
    })

    res.status(201).json({
      message: 'Application submitted successfully',
      data: application
    })
  } catch (error) {
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You have already applied for this opportunity'
      })
    }

    console.error('Application error:', error.message)

    res.status(500).json({
      message: 'Unable to submit application'
    })
  }
})

// GET MY APPLICATIONS
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.userId
    })
      .populate('opportunity')
      .sort({ createdAt: -1 })

    res.json({
      message: 'Applications fetched successfully',
      data: applications
    })
  } catch (error) {
    console.error('Fetch applications error:', error.message)

    res.status(500).json({
      message: 'Unable to fetch applications'
    })
  }
})

module.exports = router
