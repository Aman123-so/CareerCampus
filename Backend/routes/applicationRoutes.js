
const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')

const Application = require('../models/Application')
const Opportunity = require('../models/Opportunity')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Prevent user-provided text from breaking the HTML email
const escapeHtml = (value = '') => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }

    return entities[char]
  })
}

// Professional email template
const createStatusEmail = ({
  studentName,
  opportunityTitle,
  companyName,
  status
}) => {
  const messages = {
    Accepted: {
      heading: 'Congratulations!',
      message:
        'We are pleased to inform you that your application has been accepted. Congratulations on this achievement!',
      color: '#15803d',
      background: '#dcfce7'
    },
    Rejected: {
      heading: 'Application Update',
      message:
        'Thank you for your interest and the time you invested in applying. Unfortunately, your application has not been selected at this time. We encourage you to keep exploring new opportunities.',
      color: '#b91c1c',
      background: '#fee2e2'
    },
    Shortlisted: {
      heading: 'You have been shortlisted!',
      message:
        'Good news! Your application has been shortlisted. Please keep an eye on your email and Smart Campus account for the next steps.',
      color: '#1d4ed8',
      background: '#dbeafe'
    },
    Reviewed: {
      heading: 'Application Reviewed',
      message:
        'Your application has been reviewed by our team. We will notify you when there is another update.',
      color: '#92400e',
      background: '#fef3c7'
    },
    Pending: {
      heading: 'Application Pending',
      message:
        'Your application is currently pending. Thank you for your patience while the team reviews your application.',
      color: '#92400e',
      background: '#fef3c7'
    }
  }

  const details = messages[status] || {
    heading: 'Application Status Update',
    message:
      'Your application status has been updated. Please log in to your Smart Campus account for further details.',
    color: '#334155',
    background: '#e2e8f0'
  }

  const safeName = escapeHtml(studentName)
  const safeTitle = escapeHtml(opportunityTitle)
  const safeCompany = escapeHtml(companyName)
  const safeStatus = escapeHtml(status)

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Campus Application Update</title>
  </head>

  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
      style="background-color:#f1f5f9;padding:30px 12px;">
      <tr>
        <td align="center">

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
            style="max-width:620px;background-color:#ffffff;border-radius:12px;overflow:hidden;">

            <tr>
              <td style="background-color:#142d4e;padding:28px 30px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:27px;letter-spacing:0.3px;">
                  Smart Campus
                </h1>
                <p style="margin:8px 0 0;color:#dbeafe;font-size:13px;">
                  Your campus. Your opportunities. Your future.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 30px 12px;">
                <p style="margin:0 0 12px;font-size:15px;color:#334155;">
                  Hello ${safeName},
                </p>

                <h2 style="margin:0 0 14px;font-size:24px;line-height:1.4;color:#142d4e;">
                  ${details.heading}
                </h2>

                <p style="margin:0;font-size:15px;line-height:1.8;color:#475569;">
                  ${details.message}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                  style="border:1px solid #e2e8f0;border-radius:8px;">

                  <tr>
                    <td colspan="2"
                      style="padding:16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;">
                      <h3 style="margin:0;font-size:16px;color:#142d4e;">
                        Application Details
                      </h3>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:13px 16px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">
                      Opportunity
                    </td>
                    <td style="padding:13px 16px;color:#1e293b;font-size:14px;font-weight:bold;text-align:right;border-bottom:1px solid #f1f5f9;">
                      ${safeTitle}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:13px 16px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">
                      Company
                    </td>
                    <td style="padding:13px 16px;color:#1e293b;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9;">
                      ${safeCompany}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:13px 16px;color:#64748b;font-size:14px;">
                      Current Status
                    </td>
                    <td style="padding:13px 16px;text-align:right;">
                      <span style="display:inline-block;padding:7px 12px;border-radius:20px;background-color:${details.background};color:${details.color};font-size:12px;font-weight:bold;">
                        ${safeStatus}
                      </span>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 30px 30px;">
                <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">
                  Please log in to your Smart Campus account to stay updated on your applications and explore more opportunities.
                </p>

                <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#334155;">
                  Best regards,<br>
                  <strong style="color:#142d4e;">Smart Campus Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 24px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">
                  This is an automated notification regarding your application.
                  Please do not reply directly to this email.
                </p>
                <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">
                  &copy; ${new Date().getFullYear()} Smart Campus
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `

  const text = [
    `Hello ${studentName},`,
    '',
    details.heading,
    details.message,
    '',
    'Application Details',
    `Opportunity: ${opportunityTitle}`,
    `Company: ${companyName}`,
    `Current Status: ${status}`,
    '',
    'Best regards,',
    'Smart Campus Team'
  ].join('\n')

  return { html, text }
}

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

// Admin updates status and emails the student
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

      const existingApplication = await Application.findById(req.params.id)

      if (!existingApplication) {
        return res.status(404).json({
          message: 'Application not found'
        })
      }

      const oldStatus = existingApplication.status

      // Update status in the database
      existingApplication.status = status
      await existingApplication.save()

      const application = await Application.findById(existingApplication._id)
        .populate('student', 'name email')
        .populate('opportunity', 'title company location type')

      // Send email only when the status actually changes
      if (oldStatus !== status) {
        try {
          if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials are missing in .env')
          }

          if (!application.student || !application.student.email) {
            throw new Error('Student email was not found')
          }

          const studentName = application.student.name || 'Student'
          const opportunityTitle =
            application.opportunity?.title || 'the opportunity'
          const companyName = application.opportunity?.company || 'the company'

          const { html, text } = createStatusEmail({
            studentName,
            opportunityTitle,
            companyName,
            status
          })

          const info = await transporter.sendMail({
                     from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
                      to: application.student.email,
               subject: `Application Update: ${status} - ${opportunityTitle}`,
               text,
                    html
          })

            console.log('Email accepted by server:', info.accepted)
            console.log('Email rejected by server:', info.rejected)
            console.log('Email message ID:', info.messageId)
        } catch (emailError) {
          // Status is already saved; email failure won't undo it
          console.error('Status email failed:', emailError.message)
        }
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
