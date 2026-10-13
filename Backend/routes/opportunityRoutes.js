
const express = require('express')
const Opportunity = require('../models/Opportunity')
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = express.Router()

// GET ALL OPPORTUNITIES (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
    res.json(opportunities)
  } catch (error) {
    console.error('Fetch opportunities error:', error.message)
    res.status(500).json({
      message: 'Failed to fetch opportunities'
    })
  }
})

// GET SINGLE OPPORTUNITY (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      })
    }

    res.json(opportunity)
  } catch (error) {
    res.status(400).json({
      message: 'Invalid opportunity ID'
    })
  }
})

// ADD OPPORTUNITY (ADMIN ONLY)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const opportunity = await Opportunity.create(req.body)

    res.status(201).json({
      message: 'Opportunity added successfully',
      data: opportunity
    })
  } catch (error) {
    console.error('Add opportunity error:', error.message)
    res.status(400).json({
      message: 'Failed to add opportunity'
    })
  }
})

// UPDATE OPPORTUNITY (ADMIN ONLY)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: 'after',
        runValidators: true
      }
    )

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      })
    }

    res.json({
      message: 'Opportunity updated successfully',
      data: opportunity
    })
  } catch (error) {
    console.error('Update opportunity error:', error.message)
    res.status(400).json({
      message: 'Failed to update opportunity'
    })
  }
})

// DELETE OPPORTUNITY (ADMIN ONLY)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(
      req.params.id
    )

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      })
    }

    res.json({
      message: 'Opportunity deleted successfully'
    })
  } catch (error) {
    console.error('Delete opportunity error:', error.message)
    res.status(400).json({
      message: 'Failed to delete opportunity'
    })
  }
})

// SAVE OPPORTUNITY (LOGIN REQUIRED)
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const alreadySaved = user.savedOpportunities.some(
      id => id.toString() === opportunity._id.toString()
    )

    if (!alreadySaved) {
      user.savedOpportunities.push(opportunity._id)
      await user.save()
    }

    res.json({
      message: 'Opportunity saved successfully',
      savedOpportunities: user.savedOpportunities
    })
  } catch (error) {
    console.error('Save opportunity error:', error.message)
    res.status(500).json({
      message: 'Failed to save opportunity'
    })
  }
})

// UNSAVE OPPORTUNITY (LOGIN REQUIRED)
router.delete('/:id/save', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    user.savedOpportunities = user.savedOpportunities.filter(
      id => id.toString() !== req.params.id
    )

    await user.save()

    res.json({
      message: 'Opportunity removed from saved list',
      savedOpportunities: user.savedOpportunities
    })
  } catch (error) {
    console.error('Unsave opportunity error:', error.message)
    res.status(500).json({
      message: 'Failed to remove saved opportunity'
    })
  }
})

module.exports = router
