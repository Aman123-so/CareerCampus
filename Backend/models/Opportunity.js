
const mongoose = require('mongoose')

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  company: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  type: {
    type: String,
    required: true
  },

  // New field for Phase 2
  requiredSkills: {
    type: [String],
    default: []
  }
})

const Opportunity = mongoose.model('Opportunity', opportunitySchema)

module.exports = Opportunity
