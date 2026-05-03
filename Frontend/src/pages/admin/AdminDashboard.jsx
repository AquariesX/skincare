import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminDashboard } from '../../services/api'

const CONDITION_LABELS = {
  acne: 'Acne', dark_spots: 'Dark Spots', normal_skin: 'Healthy Skin',
  puffy_eyes: 'Puffy Eyes', wrinkles: 'Wrinkles',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page__title">Dashboard</h1>

        {loading && <div className="spinner" />}

        {stats && (
          <>
            <div className="admin-stats-grid">
              {[
                { label: 'Total Users', value: stats.total_users, icon: '👥' },
                { label: 'Skin Analyses', value: stats.total_analyses, icon: '🔬' },
                { label: 'Blog Posts', value: stats.total_blogs, icon: '📝' },
                { label: 'Products', value: stats.total_products, icon: '🧴' },
                { label: 'Skin Types', value: stats.total_skin_types, icon: '🌿' },
              ].map((s) => (
                <div key={s.label} className="admin-stat-card">
                  <span className="admin-stat-card__icon">{s.icon}</span>
                  <div>
                    <p className="admin-stat-card__value">{s.value ?? '—'}</p>
                    <p className="admin-stat-card__label">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-panels">
              <div className="admin-panel">
                <h2>Recent Analyses</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>Condition</th><th>Confidence</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {(stats.recent_analyses || []).map((a) => (
                      <tr key={a.id}>
                        <td>{CONDITION_LABELS[a.predicted_condition] || a.predicted_condition}</td>
                        <td>{Math.round(a.confidence_score)}%</td>
                        <td>{new Date(a.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-panel">
                <h2>Recent Users</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {(stats.recent_users || []).map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
