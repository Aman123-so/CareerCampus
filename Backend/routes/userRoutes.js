
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

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
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

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

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

// HELPER: PROFILE COMPLETENESS
function calculateProfileCompleteness(user) {
  const checks = [
    Boolean(user.name),
    Boolean(user.email),
    Boolean(user.bio),
    Boolean(user.college),
    Boolean(user.course),
    user.skills.length > 0,
    user.projects.length > 0,
    user.certifications.length > 0
  ]

  const completed = checks.filter(Boolean).length

  return Math.round((completed / checks.length) * 100)
}

// GET MY PROFILE
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const profile = user.toObject()

    profile.profileCompleteness =
      calculateProfileCompleteness(user)

    res.json({
      message: 'Profile fetched successfully',
      data: profile
    })
  } catch (error) {
    console.error('Profile error:', error.message)

    res.status(500).json({
      message: 'Unable to fetch profile'
    })
  }
})

// UPDATE STUDENT PROFILE
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      bio,
      college,
      course,
      graduationYear
    } = req.body

    const updates = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          message: 'Name cannot be empty'
        })
      }

      updates.name = name.trim()
    }

    if (bio !== undefined) updates.bio = bio
    if (college !== undefined) updates.college = college
    if (course !== undefined) updates.course = course

    if (graduationYear !== undefined) {
      if (
        graduationYear !== null &&
        (!Number.isInteger(Number(graduationYear)) ||
          Number(graduationYear) < 2000 ||
          Number(graduationYear) > 2100)
      ) {
        return res.status(400).json({
          message: 'Please provide a valid graduation year'
        })
      }

      updates.graduationYear =
        graduationYear === null ? null : Number(graduationYear)
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const profile = user.toObject()
    profile.profileCompleteness =
      calculateProfileCompleteness(user)

    res.json({
      message: 'Profile updated successfully',
      data: profile
    })
  } catch (error) {
    console.error('Update profile error:', error.message)

    res.status(500).json({
      message: 'Unable to update profile'
    })
  }
})

// ADD A SKILL
router.post('/skills', authMiddleware, async (req, res) => {
  try {
    const { name, proficiency = 'Beginner' } = req.body

    const allowedLevels = [
      'Beginner',
      'Intermediate',
      'Advanced'
    ]

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'Skill name is required'
      })
    }

    if (!allowedLevels.includes(proficiency)) {
      return res.status(400).json({
        message: 'Invalid proficiency level'
      })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const skillName = name.trim()

    const alreadyExists = user.skills.some(
      skill => skill.name.toLowerCase() === skillName.toLowerCase()
    )

    if (alreadyExists) {
      return res.status(409).json({
        message: 'This skill is already added'
      })
    }

    user.skills.push({
      name: skillName,
      proficiency
    })

    await user.save()

    res.status(201).json({
      message: 'Skill added successfully',
      data: user.skills,
      profileCompleteness: calculateProfileCompleteness(user)
    })
  } catch (error) {
    console.error('Add skill error:', error.message)

    res.status(500).json({
      message: 'Unable to add skill'
    })
  }
})

// EDIT A SKILL
router.patch('/skills/:skillId', authMiddleware, async (req, res) => {
  try {
    const { name, proficiency } = req.body
    const allowedLevels = [
      'Beginner',
      'Intermediate',
      'Advanced'
    ]

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const skill = user.skills.id(req.params.skillId)

    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found'
      })
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          message: 'Skill name cannot be empty'
        })
      }

      const duplicate = user.skills.some(
        item =>
          item._id.toString() !== skill._id.toString() &&
          item.name.toLowerCase() === name.trim().toLowerCase()
      )

      if (duplicate) {
        return res.status(409).json({
          message: 'This skill is already added'
        })
      }

      skill.name = name.trim()
    }

    if (proficiency !== undefined) {
      if (!allowedLevels.includes(proficiency)) {
        return res.status(400).json({
          message: 'Invalid proficiency level'
        })
      }

      skill.proficiency = proficiency
    }

    await user.save()

    res.json({
      message: 'Skill updated successfully',
      data: user.skills
    })
  } catch (error) {
    console.error('Edit skill error:', error.message)

    res.status(500).json({
      message: 'Unable to update skill'
    })
  }
})

// DELETE A SKILL
router.delete('/skills/:skillId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const skill = user.skills.id(req.params.skillId)

    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found'
      })
    }

    skill.deleteOne()
    await user.save()

    res.json({
      message: 'Skill deleted successfully',
      data: user.skills,
      profileCompleteness: calculateProfileCompleteness(user)
    })
  } catch (error) {
    console.error('Delete skill error:', error.message)

    res.status(500).json({
      message: 'Unable to delete skill'
    })
  }
})

// ADD A PROJECT
router.post('/projects', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description = '',
      technologies = [],
      projectLink = ''
    } = req.body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        message: 'Project title is required'
      })
    }

    if (
      !Array.isArray(technologies) ||
      !technologies.every(item => typeof item === 'string')
    ) {
      return res.status(400).json({
        message: 'Technologies must be an array of strings'
      })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    user.projects.push({
      title: title.trim(),
      description,
      technologies,
      projectLink
    })

    await user.save()

    res.status(201).json({
      message: 'Project added successfully',
      data: user.projects,
      profileCompleteness: calculateProfileCompleteness(user)
    })
  } catch (error) {
    console.error('Add project error:', error.message)

    res.status(500).json({
      message: 'Unable to add project'
    })
  }
})

// EDIT A PROJECT
router.patch('/projects/:projectId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const project = user.projects.id(req.params.projectId)

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      })
    }

    const { title, description, technologies, projectLink } = req.body

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          message: 'Project title cannot be empty'
        })
      }

      project.title = title.trim()
    }

    if (description !== undefined) project.description = description
    if (projectLink !== undefined) project.projectLink = projectLink

    if (technologies !== undefined) {
      if (
        !Array.isArray(technologies) ||
        !technologies.every(item => typeof item === 'string')
      ) {
        return res.status(400).json({
          message: 'Technologies must be an array of strings'
        })
      }

      project.technologies = technologies
    }

    await user.save()

    res.json({
      message: 'Project updated successfully',
      data: user.projects
    })
  } catch (error) {
    console.error('Edit project error:', error.message)

    res.status(500).json({
      message: 'Unable to update project'
    })
  }
})

// DELETE A PROJECT
router.delete('/projects/:projectId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const project = user.projects.id(req.params.projectId)

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      })
    }

    project.deleteOne()
    await user.save()

    res.json({
      message: 'Project deleted successfully',
      data: user.projects,
      profileCompleteness: calculateProfileCompleteness(user)
    })
  } catch (error) {
    console.error('Delete project error:', error.message)

    res.status(500).json({
      message: 'Unable to delete project'
    })
  }
})

// ADD A CERTIFICATION
router.post('/certifications', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      issuer = '',
      issueDate = null,
      certificateLink = ''
    } = req.body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'Certification name is required'
      })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    user.certifications.push({
      name: name.trim(),
      issuer,
      issueDate,
      certificateLink
    })

    await user.save()

    res.status(201).json({
      message: 'Certification added successfully',
      data: user.certifications,
      profileCompleteness: calculateProfileCompleteness(user)
    })
  } catch (error) {
    console.error('Add certification error:', error.message)

    res.status(500).json({
      message: 'Unable to add certification'
    })
  }
})

// EDIT A CERTIFICATION
router.patch(
  '/certifications/:certificationId',
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId)

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }

      const certification = user.certifications.id(
        req.params.certificationId
      )

      if (!certification) {
        return res.status(404).json({
          message: 'Certification not found'
        })
      }

      const { name, issuer, issueDate, certificateLink } = req.body

      if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
          return res.status(400).json({
            message: 'Certification name cannot be empty'
          })
        }

        certification.name = name.trim()
      }

      if (issuer !== undefined) certification.issuer = issuer
      if (issueDate !== undefined) certification.issueDate = issueDate
      if (certificateLink !== undefined) {
        certification.certificateLink = certificateLink
      }

      await user.save()

      res.json({
        message: 'Certification updated successfully',
        data: user.certifications
      })
    } catch (error) {
      console.error('Edit certification error:', error.message)

      res.status(500).json({
        message: 'Unable to update certification'
      })
    }
  }
)

// DELETE A CERTIFICATION
router.delete(
  '/certifications/:certificationId',
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId)

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }

      const certification = user.certifications.id(
        req.params.certificationId
      )

      if (!certification) {
        return res.status(404).json({
          message: 'Certification not found'
        })
      }

      certification.deleteOne()
      await user.save()

      res.json({
        message: 'Certification deleted successfully',
        data: user.certifications,
        profileCompleteness: calculateProfileCompleteness(user)
      })
    } catch (error) {
      console.error('Delete certification error:', error.message)

      res.status(500).json({
        message: 'Unable to delete certification'
      })
    }
  }
)

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
