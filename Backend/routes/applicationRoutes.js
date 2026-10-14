
const express = require('express')
const router = express.Router()

const Application = require('../models/Application')
const Opportunity = require('../models/Opportunity')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

// Student applies for an opportunity
router.post('/:opportunityId', authMiddleware, async (req, res) => {
  try {
    const { opportunityId } = req.params

    const opportunity = await Opportunity.findById(opportunityId)

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      })
    }

    const application = await Application.create({
      student: req.userId,
      opportunity: opportunityId
    })

    return res.status(201).json({
      message: 'Application submitted successfully',
      data: application
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You have already applied for this opportunity'
      })
    }

    console.error('Apply error:', error)

    return res.status(500).json({
      message: 'Server error while submitting application'
    })
  }
})

// Admin gets all student applications
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name email')
      .populate('opportunity', 'title company location type')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      message: 'Applications fetched successfully',
      data: applications
    })
  } catch (error) {
    console.error('Fetch all applications error:', error)

    return res.status(500).json({
      message: 'Server error while fetching applications'
    })
  }
})

// Admin updates an application's status
router.patch(
  '/:id/status',
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body

      const allowedStatuses = [
        'Pending',
        'Reviewed',
        'Shortlisted',
        'Rejected',
        'Accepted'
      ]

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Invalid application status'
        })
      }

      const application = await Application.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status } },
        {
          returnDocument: 'after',
          runValidators: true
        }
      )
        .populate('student', 'name email')
        .populate('opportunity', 'title company location type')

      if (!application) {
        return res.status(404).json({
          message: 'Application not found'
        })
      }

      return res.status(200).json({
        message: 'Application status updated successfully',
        data: application
      })
    } catch (error) {
      console.error('Update application status error:', error)

      if (error.name === 'CastError') {
        return res.status(400).json({
          message: 'Invalid application ID'
        })
      }

      return res.status(500).json({
        message: 'Server error while updating application status'
      })
    }
  }
)

// Student gets their own applications
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.userId
    })
      .populate('opportunity', 'title company location type')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      message: 'Your applications fetched successfully',
      data: applications
    })
  } catch (error) {
    console.error('Fetch my applications error:', error)

    return res.status(500).json({
      message: 'Server error while fetching your applications'
    })
  }
})

module.exports = router
