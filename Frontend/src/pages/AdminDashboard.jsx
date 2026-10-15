
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()

  const stats = [
    {
      icon: '💼',
      label: 'Manage Opportunities',
      value: 'Explore',
      note: 'View and manage campus opportunities',
      color: 'blue'
    },
    {
      icon: '➕',
      label: 'Add Opportunity',
      value: 'Create',
      note: 'Publish a new job or internship',
      color: 'purple'
    },
    {
      icon: '📋',
      label: 'Applications',
      value: 'Review',
      note: 'Check student applications and status',
      color: 'green'
    }
  ]

  const actions = [
    {
      icon: '💼',
      title: 'Manage Opportunities',
      description: 'View, edit and delete existing opportunities.',
      button: 'View Opportunities',
      path: '/opportunities'
    },
    {
      icon: '🚀',
      title: 'Publish an Opportunity',
      description: 'Add a new internship or job opportunity.',
      button: 'Add Opportunity',
      path: '/admin/add-opportunity'
    },
    {
      icon: '📑',
      title: 'Student Applications',
      description: 'Review applications submitted by students.',
      button: 'View Applications',
      path: '/admin/applications'
    }
  ]

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">SMART CAMPUS / ADMIN</span>
          <h1>Dashboard Overview</h1>
          <p>
            Welcome back, Admin! Manage your campus opportunities
            from one place.
          </p>
        </div>

        <span className="admin-header-badge">
          🛡️ Administrator
        </span>
      </header>

      <section aria-labelledby="admin-stats-title">
        <h2 id="admin-stats-title" className="admin-section-title">
          Quick Overview
        </h2>

        <div className="admin-stats-grid">
          {stats.map((stat) => (
            <article className="admin-stat-card" key={stat.label}>
              <div className="admin-stat-icon">
                {stat.icon}
              </div>

              <div>
                <p className="admin-stat-label">{stat.label}</p>
                <h3 className="admin-stat-value">{stat.value}</h3>
                <p className="admin-stat-note">{stat.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="admin-content-grid">
        <section className="admin-panel">
          <h2 className="admin-section-title">Quick Actions</h2>
          <p className="admin-panel-description">
            Choose an action to manage your campus platform.
          </p>

          <div className="admin-action-list">
            {actions.map((action) => (
              <button
                className="admin-action-card"
                key={action.path}
                type="button"
                onClick={() => navigate(action.path)}
              >
                <span className="admin-action-icon">
                  {action.icon}
                </span>

                <span className="admin-action-text">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </span>

                <span className="admin-action-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="admin-panel">
          <h2 className="admin-section-title">Platform Management</h2>
          <p className="admin-panel-description">
            Your workspace for managing student career opportunities.
          </p>

          <div className="admin-info-banner">
            <span className="admin-info-icon">🎓</span>
            <h3>Build better opportunities</h3>
            <p>
              Keep opportunities updated and review student
              applications regularly to help students move forward.
            </p>
          </div>

          <div className="admin-info-list">
            <div className="admin-info-item">
              <span className="admin-info-check">✓</span>
              <span>Publish jobs and internship opportunities.</span>
            </div>

            <div className="admin-info-item">
              <span className="admin-info-check">✓</span>
              <span>Update or remove outdated listings.</span>
            </div>

            <div className="admin-info-item">
              <span className="admin-info-check">✓</span>
              <span>Review applications and update their status.</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default AdminDashboard
