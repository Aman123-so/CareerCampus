
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '24px', color: '#f5f5f5' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin! Manage your campus opportunities here.</p>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginTop: '24px'
        }}
      >
        <div style={cardStyle}>
          <h3>Manage Opportunities</h3>
          <p>View, edit and delete opportunities.</p>
          <button onClick={() => navigate('/opportunities')}>
            View Opportunities
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Add Opportunity</h3>
          <p>Publish a new job or internship.</p>
          <button onClick={() => navigate('/admin/add-opportunity')}>
            Add Opportunity
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Applications</h3>
          <p>Review student applications.</p>
          <button onClick={() => navigate('/admin/applications')}>
            View Applications
          </button>
        </div>
      </div>
    </div>
  )
}

const cardStyle = {
  border: '1px solid #555',
  borderRadius: '10px',
  padding: '20px',
  minWidth: '220px',
  backgroundColor: '#202b3d'
}

export default AdminDashboard
