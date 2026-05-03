import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserHistory } from '../services/api'

const CONDITION_COLORS = {
  acne: '#ef4444', dark_spots: '#f59e0b', normal_skin: '#10b981',
  puffy_eyes: '#8b5cf6', wrinkles: '#6366f1',
}
const CONDITION_LABELS = {
  acne: 'Acne', dark_spots: 'Dark Spots', normal_skin: 'Healthy Skin',
  puffy_eyes: 'Puffy Eyes', wrinkles: 'Wrinkles',
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserHistory()
      .then(({ data }) => setHistory(data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Track your skin health journey and access your analysis history.</p>
        </div>

        <div className="dashboard-actions">
          <Link to="/analyze" className="dashboard-action-card">
            <span className="dashboard-action-card__icon">🔬</span>
            <h3>New Analysis</h3>
            <p>Analyze your skin condition now</p>
          </Link>
          <Link to="/history" className="dashboard-action-card">
            <span className="dashboard-action-card__icon">📋</span>
            <h3>My History</h3>
            <p>View all past analyses</p>
          </Link>
          <Link to="/products" className="dashboard-action-card">
            <span className="dashboard-action-card__icon">🧴</span>
            <h3>Products</h3>
            <p>Browse recommended products</p>
          </Link>
          <Link to="/profile" className="dashboard-action-card">
            <span className="dashboard-action-card__icon">👤</span>
            <h3>My Profile</h3>
            <p>Manage your account</p>
          </Link>
        </div>

        {/* Recent analyses */}
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>Recent Analyses</h2>
            <Link to="/history" className="link-more">View All →</Link>
          </div>

          {loading && <div className="spinner" />}

          {!loading && history.length === 0 && (
            <div className="page-empty">
              <p>No analyses yet. <Link to="/analyze">Start your first analysis →</Link></p>
            </div>
          )}

          <div className="history-list">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="history-item">
                <div
                  className="history-item__dot"
                  style={{ background: CONDITION_COLORS[item.predicted_condition] || 'var(--primary)' }}
                />
                <div className="history-item__info">
                  <span className="history-item__condition">
                    {CONDITION_LABELS[item.predicted_condition] || item.predicted_condition}
                  </span>
                  <span className="history-item__date">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="history-item__conf">
                  {Math.round(item.confidence_score)}% confidence
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
