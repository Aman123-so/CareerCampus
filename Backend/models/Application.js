
const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true
    },

    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
)

// Prevent the same student from applying twice
applicationSchema.index(
  { student: 1, opportunity: 1 },
  { unique: true }
)

module.exports = mongoose.model('Application', applicationSchema)
