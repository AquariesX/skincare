import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminUserLogs } from '../../services/api'

const ACTION_COLORS = {
  login: '#10b981', logout: '#6b7280', register: '#3b82f6',
  skin_analysis: '#8b5cf6', default: '#9ca3af',
}

export default function UserLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    getAdminUserLogs(page)
      .then(({ data }) => {
        setLogs(data.logs || [])
        setTotalPages(data.pages || 1)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page__title">User Activity Logs</h1>
        {loading && <div className="spinner" />}

        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>User</th><th>Action</th><th>Details</th><th>IP</th><th>Time</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.user_name || 'Guest'}</td>
                  <td>
                    <span className="action-badge" style={{ background: ACTION_COLORS[log.action] || ACTION_COLORS.default }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.details || '—'}</td>
                  <td>{log.ip_address || '—'}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan="6" className="text-center">No logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
