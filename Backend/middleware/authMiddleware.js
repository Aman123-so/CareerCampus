
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. Token required.'
      })
    }

    const token = authHeader.slice(7).trim()

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from environment')
      return res.status(500).json({
        message: 'Server authentication configuration error'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.userId = decoded.userId
    next()
  } catch (error) {
    // Temporary debugging: error type, never log the token or secret.
    console.error('JWT verification error:', error.name, error.message)

    return res.status(401).json({
      message: 'Invalid or expired token'
    })
  }
}

module.exports = authMiddleware
