import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Profile.css'

const API = 'http://localhost:5000/api/users'

const emptyProject = {
  title: '',
  description: '',
  technologies: [],
  projectLink: ''
}

const emptyCertification = {
  name: '',
  issuer: '',
  issueDate: '',
  certificateLink: ''
}

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const [personal, setPersonal] = useState({
    name: '',
    bio: '',
    college: '',
    course: '',
    graduationYear: ''
  })

  const [skillName, setSkillName] = useState('')
  const [proficiency, setProficiency] = useState('Beginner')
  const [editingSkill, setEditingSkill] = useState(null)

  const [project, setProject] = useState(emptyProject)
  const [editingProject, setEditingProject] = useState(null)
  const [technologiesText, setTechnologiesText] = useState('')

  const [certification, setCertification] = useState(emptyCertification)
  const [editingCertification, setEditingCertification] = useState(null)

  const token = () => localStorage.getItem('token')

  const request = async (path, method = 'GET', body) => {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token()}`,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Request failed.')
    }

    return result
  }

  const loadProfile = async () => {
    const result = await request('/profile')
    const data = result.data

    setUser(data)
    setPersonal({
      name: data.name || '',
      bio: data.bio || '',
      college: data.college || '',
      course: data.course || '',
      graduationYear: data.graduationYear || ''
    })
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token()) {
        setError('Please log in to view your profile.')
        setLoading(false)
        return
      }

      try {
        await loadProfile()
      } catch (err) {
        setError(err.message || 'Unable to load profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const runAction = async (action, successMessage) => {
    setError('')
    setMessage('')
    setSaving(true)

    try {
      await action()
      await loadProfile()
      setMessage(successMessage)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const savePersonal = async (e) => {
    e.preventDefault()

    await runAction(
      () => request('/profile', 'PATCH', {
        ...personal,
        graduationYear: personal.graduationYear
          ? Number(personal.graduationYear)
          : null
      }),
      'Personal information updated.'
    )
  }

  const saveSkill = async (e) => {
    e.preventDefault()
    const name = skillName.trim()

    if (!name) {
      setError('Please enter a skill name.')
      return
    }

    await runAction(async () => {
      if (editingSkill) {
        await request(`/skills/${editingSkill}`, 'PATCH', {
          name,
          proficiency
        })
      } else {
        await request('/skills', 'POST', {
          name,
          proficiency
        })
      }

      setSkillName('')
      setProficiency('Beginner')
      setEditingSkill(null)
    }, editingSkill ? 'Skill updated.' : 'Skill added.')
  }

  const startEditSkill = (skill) => {
    setEditingSkill(skill._id)
    setSkillName(skill.name)
    setProficiency(skill.proficiency || 'Beginner')
  }

  const deleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return

    await runAction(
      () => request(`/skills/${id}`, 'DELETE'),
      'Skill deleted.'
    )
  }

  const saveProject = async (e) => {
    e.preventDefault()

    const data = {
      ...project,
      technologies: technologiesText
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    }

    await runAction(async () => {
      if (editingProject) {
        await request(`/projects/${editingProject}`, 'PATCH', data)
      } else {
        await request('/projects', 'POST', data)
      }

      setProject(emptyProject)
      setTechnologiesText('')
      setEditingProject(null)
    }, editingProject ? 'Project updated.' : 'Project added.')
  }

  const startEditProject = (item) => {
    setEditingProject(item._id)
    setProject({
      title: item.title || '',
      description: item.description || '',
      technologies: item.technologies || [],
      projectLink: item.projectLink || ''
    })
    setTechnologiesText((item.technologies || []).join(', '))
  }

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return

    await runAction(
      () => request(`/projects/${id}`, 'DELETE'),
      'Project deleted.'
    )
  }

  const saveCertification = async (e) => {
    e.preventDefault()

    const data = {
      ...certification,
      issueDate: certification.issueDate || null
    }

    await runAction(async () => {
      if (editingCertification) {
        await request(
          `/certifications/${editingCertification}`,
          'PATCH',
          data
        )
      } else {
        await request('/certifications', 'POST', data)
      }

      setCertification(emptyCertification)
      setEditingCertification(null)
    }, editingCertification ? 'Certification updated.' : 'Certification added.')
  }

  const startEditCertification = (item) => {
    setEditingCertification(item._id)
    setCertification({
      name: item.name || '',
      issuer: item.issuer || '',
      issueDate: item.issueDate
        ? new Date(item.issueDate).toISOString().slice(0, 10)
        : '',
      certificateLink: item.certificateLink || ''
    })
  }

  const deleteCertification = async (id) => {
    if (!window.confirm('Delete this certification?')) return

    await runAction(
      () => request(`/certifications/${id}`, 'DELETE'),
      'Certification deleted.'
    )
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <span className="profile-spinner" />
          <h2>Loading your profile...</h2>
        </div>
      </main>
    )
  }

  if (error && !user) {
    return (
      <main className="profile-page">
        <section className="profile-message-card">
          <h2>Unable to load profile</h2>
          <p>{error}</p>
          {!token() && <Link to="/login">Sign in</Link>}
          <p><Link to="/">Back to Home</Link></p>
        </section>
      </main>
    )
  }

  const displayName = user?.name || 'Campus Member'
  const role = user?.role || 'student'
  const isStudent = role !== 'admin'
  const completeness = Number(user?.profileCompleteness ?? 0)

  return (
    <main className="profile-page">
      <div className="profile-container">

        <div className="profile-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>My Profile</span>
        </div>

        <header className="profile-page-heading">
          <div>
            <span className="profile-eyebrow">YOUR ACCOUNT</span>
            <h1>My Profile</h1>
            <p>
              {isStudent
                ? 'Build your student profile and showcase your skills.'
                : 'Manage your Smart Campus account.'}
            </p>
          </div>

          <span className="profile-account-status">
            <span /> Account Active
          </span>
        </header>

        {error && <div className="profile-alert error">{error}</div>}
        {message && <div className="profile-alert success">{message}</div>}

        <section className="profile-hero-card">
          <div className="profile-hero-pattern" />

          <div className="profile-hero-content">
            <div className="profile-avatar">
              {displayName.trim().charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="profile-hero-info">
              <span className="profile-member-label">SMART CAMPUS MEMBER</span>
              <h2>{displayName}</h2>
              <p>{user.email}</p>

              <span className="profile-role-badge">
                {role === 'admin' ? 'Administrator' : 'Student Account'}
              </span>
            </div>
          </div>

          <div className="profile-hero-decoration" aria-hidden="true">
            <span>SC</span>
          </div>
        </section>

        {isStudent && (
          <>
            <section className="profile-section profile-completeness">
              <div className="profile-section-heading">
                <div>
                  <h2>Profile completeness</h2>
                  <p>Complete your profile to showcase your campus journey.</p>
                </div>
                <strong>{completeness}%</strong>
              </div>

              <div
                className="profile-progress-track"
                role="progressbar"
                aria-valuenow={completeness}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="profile-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, completeness))}%`
                  }}
                />
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <div>
                  <h2>Personal information</h2>
                  <p>Update your basic academic and personal details.</p>
                </div>
              </div>

              <form className="profile-form-grid" onSubmit={savePersonal}>
                <label>
                  Full name
                  <input
                    required
                    value={personal.name}
                    onChange={e =>
                      setPersonal({ ...personal, name: e.target.value })
                    }
                    placeholder="Your full name"
                  />
                </label>

                <label>
                  Email address
                  <input value={user.email || ''} disabled />
                </label>

                <label>
                  College
                  <input
                    value={personal.college}
                    onChange={e =>
                      setPersonal({ ...personal, college: e.target.value })
                    }
                    placeholder="Your college"
                  />
                </label>

                <label>
                  Course
                  <input
                    value={personal.course}
                    onChange={e =>
                      setPersonal({ ...personal, course: e.target.value })
                    }
                    placeholder="e.g. B.Tech CSE"
                  />
                </label>

                <label>
                  Graduation year
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={personal.graduationYear}
                    onChange={e =>
                      setPersonal({
                        ...personal,
                        graduationYear: e.target.value
                      })
                    }
                    placeholder="e.g. 2028"
                  />
                </label>

                <label className="profile-full-width">
                  Short bio
                  <textarea
                    rows="3"
                    value={personal.bio}
                    onChange={e =>
                      setPersonal({ ...personal, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself and your career goals..."
                  />
                </label>

                <div className="profile-full-width">
                  <button className="profile-primary-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save personal information'}
                  </button>
                </div>
              </form>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <div>
                  <h2>My skills</h2>
                  <p>Add skills and select your proficiency level.</p>
                </div>
              </div>

              <form className="profile-form-grid" onSubmit={saveSkill}>
                <label>
                  Skill name
                  <input
                    value={skillName}
                    onChange={e => setSkillName(e.target.value)}
                    placeholder="e.g. C++, React, SQL"
                    required
                  />
                </label>

                <label>
                  Proficiency
                  <select
                    value={proficiency}
                    onChange={e => setProficiency(e.target.value)}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>

                <div className="profile-full-width profile-form-actions">
                  <button className="profile-primary-btn" disabled={saving}>
                    {editingSkill ? 'Update skill' : 'Add skill'}
                  </button>

                  {editingSkill && (
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={() => {
                        setEditingSkill(null)
                        setSkillName('')
                        setProficiency('Beginner')
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="profile-item-list">
                {(user.skills || []).length === 0 && (
                  <p className="profile-empty-state">No skills added yet.</p>
                )}

                {(user.skills || []).map(skill => (
                  <div className="profile-item-card" key={skill._id}>
                    <div>
                      <strong>{skill.name}</strong>
                      <span className="profile-tag">{skill.proficiency}</span>
                    </div>

                    <div className="profile-item-actions">
                      <button
                        type="button"
                        onClick={() => startEditSkill(skill)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => deleteSkill(skill._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <div>
                  <h2>My projects</h2>
                  <p>Showcase projects you have built.</p>
                </div>
              </div>

              <form className="profile-form-grid" onSubmit={saveProject}>
                <label>
                  Project title
                  <input
                    required
                    value={project.title}
                    onChange={e =>
                      setProject({ ...project, title: e.target.value })
                    }
                    placeholder="Project name"
                  />
                </label>

                <label>
                  Project link
                  <input
                    type="url"
                    value={project.projectLink}
                    onChange={e =>
                      setProject({ ...project, projectLink: e.target.value })
                    }
                    placeholder="https://github.com/..."
                  />
                </label>

                <label className="profile-full-width">
                  Description
                  <textarea
                    rows="3"
                    value={project.description}
                    onChange={e =>
                      setProject({ ...project, description: e.target.value })
                    }
                    placeholder="What does your project do?"
                  />
                </label>

                <label className="profile-full-width">
                  Technologies (comma-separated)
                  <input
                    value={technologiesText}
                    onChange={e => setTechnologiesText(e.target.value)}
                    placeholder="React, Node.js, MongoDB"
                  />
                </label>

                <div className="profile-full-width profile-form-actions">
                  <button className="profile-primary-btn" disabled={saving}>
                    {editingProject ? 'Update project' : 'Add project'}
                  </button>

                  {editingProject && (
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={() => {
                        setEditingProject(null)
                        setProject(emptyProject)
                        setTechnologiesText('')
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="profile-item-list">
                {(user.projects || []).length === 0 && (
                  <p className="profile-empty-state">No projects added yet.</p>
                )}

                {(user.projects || []).map(item => (
                  <article className="profile-item-card" key={item._id}>
                    <div className="profile-item-main">
                      <strong>{item.title}</strong>
                      <p>{item.description || 'No description provided.'}</p>

                      <div className="profile-tags">
                        {(item.technologies || []).map(tech => (
                          <span className="profile-tag" key={tech}>
                            {tech}
                          </span>
                        ))}
                      </div>

                      {item.projectLink && (
                        <a
                          href={item.projectLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View project ↗
                        </a>
                      )}
                    </div>

                    <div className="profile-item-actions">
                      <button
                        type="button"
                        onClick={() => startEditProject(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => deleteProject(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <div>
                  <h2>Certifications</h2>
                  <p>Add certificates and courses you have completed.</p>
                </div>
              </div>

              <form
                className="profile-form-grid"
                onSubmit={saveCertification}
              >
                <label>
                  Certificate name
                  <input
                    required
                    value={certification.name}
                    onChange={e =>
                      setCertification({
                        ...certification,
                        name: e.target.value
                      })
                    }
                    placeholder="Certificate title"
                  />
                </label>

                <label>
                  Issuing organization
                  <input
                    value={certification.issuer}
                    onChange={e =>
                      setCertification({
                        ...certification,
                        issuer: e.target.value
                      })
                    }
                    placeholder="e.g. AWS, Infosys"
                  />
                </label>

                <label>
                  Issue date
                  <input
                    type="date"
                    value={certification.issueDate}
                    onChange={e =>
                      setCertification({
                        ...certification,
                        issueDate: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Certificate link
                  <input
                    type="url"
                    value={certification.certificateLink}
                    onChange={e =>
                      setCertification({
                        ...certification,
                        certificateLink: e.target.value
                      })
                    }
                    placeholder="https://..."
                  />
                </label>

                <div className="profile-full-width profile-form-actions">
                  <button className="profile-primary-btn" disabled={saving}>
                    {editingCertification
                      ? 'Update certification'
                      : 'Add certification'}
                  </button>

                  {editingCertification && (
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={() => {
                        setEditingCertification(null)
                        setCertification(emptyCertification)
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="profile-item-list">
                {(user.certifications || []).length === 0 && (
                  <p className="profile-empty-state">
                    No certifications added yet.
                  </p>
                )}

                {(user.certifications || []).map(item => (
                  <article className="profile-item-card" key={item._id}>
                    <div className="profile-item-main">
                      <strong>{item.name}</strong>
                      <p>{item.issuer || 'Issuer not specified'}</p>

                      {item.issueDate && (
                        <span className="profile-muted">
                          Issued: {new Date(item.issueDate).toLocaleDateString()}
                        </span>
                      )}

                      {item.certificateLink && (
                        <p>
                          <a
                            href={item.certificateLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View certificate ↗
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="profile-item-actions">
                      <button
                        type="button"
                        onClick={() => startEditCertification(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => deleteCertification(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="profile-content-grid">
          <aside className="profile-quick-panel">
            <div className="profile-quick-icon">✦</div>
            <h3>{isStudent ? 'Your campus journey' : 'Admin quick links'}</h3>
            <p>
              {isStudent
                ? 'Discover opportunities and track your applications.'
                : 'Manage campus opportunities and student applications.'}
            </p>

            <div className="profile-quick-links">
              {isStudent && (
                <>
                  <Link to="/opportunities">
                    <span>Explore opportunities</span><span>→</span>
                  </Link>
                  <Link to="/my-applications">
                    <span>My applications</span><span>→</span>
                  </Link>
                  <Link to="/saved-opportunities">
                    <span>Saved opportunities</span><span>→</span>
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <Link to="/admin">
                  <span>Admin dashboard</span><span>→</span>
                </Link>
              )}
            </div>
          </aside>
        </div>

        <div className="profile-footer-note">
          <span>🔒</span>
          <p>Your profile details are saved to your Smart Campus account.</p>
        </div>

      </div>
    </main>
  )
}

export default Profile