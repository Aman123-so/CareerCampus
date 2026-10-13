
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },

  savedOpportunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  }]
})

const User = mongoose.model('User', userSchema)

module.exports = User
