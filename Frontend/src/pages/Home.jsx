
import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Explore Opportunities',
      description:
        'Discover internships and job opportunities that match your career goals.'
    },
    {
      icon: '📋',
      title: 'Track Applications',
      description:
        'Keep track of your applications and check their latest status in one place.'
    },
    {
      icon: '❤️',
      title: 'Save Opportunities',
      description:
        'Save interesting opportunities and revisit them whenever you need.'
    }
  ]

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            Your Campus. Your Career. Your Future.
          </span>

          <h1>
            Turn Your Skills Into
            <span> Opportunities</span>
          </h1>

          <p>
            Discover internships, explore job opportunities, and manage your
            applications — all from one simple platform built for students.
          </p>

          <div className="hero-buttons">
            <Link to="/opportunities" className="primary-btn">
              Explore Opportunities →
            </Link>

            <Link to="/profile" className="secondary-btn">
              View My Profile
            </Link>
          </div>

          <div className="hero-note">
            <span>✓</span> One platform for your career journey
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card main-visual-card">
            <div className="visual-icon">🎓</div>
            <h3>Your Future Starts Here</h3>
            <p>Learn. Apply. Grow.</p>

            <div className="visual-progress">
              <span />
            </div>

            <div className="visual-footer">
              <span>Career journey</span>
              <strong>Let's begin!</strong>
            </div>
          </div>

          <div className="floating-card floating-top">
            <span>💼</span>
            <div>
              <strong>New opportunities</strong>
              <small>Explore and apply</small>
            </div>
          </div>

          <div className="floating-card floating-bottom">
            <span>🚀</span>
            <div>
              <strong>Keep growing</strong>
              <small>Your next step matters</small>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <span className="section-label">WHAT YOU CAN DO</span>
          <h2>Everything You Need to Move Forward</h2>
          <p>
            Manage your campus opportunities and career journey from one place.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span>READY FOR YOUR NEXT STEP?</span>
          <h2>Your next opportunity could be one click away.</h2>
        </div>

        <Link to="/opportunities" className="primary-btn">
          Get Started →
        </Link>
      </section>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Smart Campus Platform</p>
        <p>Built to support your campus career journey.</p>
      </footer>
    </main>
  )
}

export default Home
