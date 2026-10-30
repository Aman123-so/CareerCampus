
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Existing user fields
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
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

    savedOpportunities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity'
      }
    ],

    // Phase 1: Student Skills
    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },

        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced'],
          default: 'Beginner'
        }
      }
    ],

    // Phase 1: Student Projects
    projects: [
      {
        title: {
          type: String,
          required: true,
          trim: true
        },

        description: {
          type: String,
          default: '',
          trim: true
        },

        technologies: {
          type: [String],
          default: []
        },

        projectLink: {
          type: String,
          default: '',
          trim: true
        }
      }
    ],

    // Phase 1: Student Certifications
    certifications: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },

        issuer: {
          type: String,
          default: '',
          trim: true
        },

        issueDate: {
          type: Date,
          default: null
        },

        certificateLink: {
          type: String,
          default: '',
          trim: true
        }
      }
    ],

    // Phase 1: Additional profile information
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },

    college: {
      type: String,
      default: '',
      trim: true
    },

    course: {
      type: String,
      default: '',
      trim: true
    },

    graduationYear: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Calculate profile completeness
userSchema.virtual('profileCompleteness').get(function () {
  const checks = [
    Boolean(this.name),
    Boolean(this.email),
    Boolean(this.bio),
    Boolean(this.college),
    Boolean(this.course),
    this.skills.length > 0,
    this.projects.length > 0,
    this.certifications.length > 0
  ];

  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
});

module.exports = mongoose.model('User', userSchema);
