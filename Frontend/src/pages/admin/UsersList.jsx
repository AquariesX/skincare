import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminUsers, updateAdminUser } from '../../services/api'

export default function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')

  const load = (p) => {
    setLoading(true)
    getAdminUsers(p)
      .then(({ data }) => {
        setUsers(data.users || [])
        setTotalPages(data.pages || 1)
      })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const toggleActive = async (user) => {
    try {
      const { data } = await updateAdminUser(user.id, { is_active: !user.is_active })
      setUsers((prev) => prev.map((u) => u.id === user.id ? data.user : u))
    } catch { alert('Update failed.') }
  }

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) return
    try {
      const { data } = await updateAdminUser(user.id, { role: newRole })
      setUsers((prev) => prev.map((u) => u.id === user.id ? data.user : u))
    } catch { alert('Update failed.') }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page__title">Users</h1>
        {error && <div className="alert alert--error">{error}</div>}
        {loading && <div className="spinner" />}

        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-badge--${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="admin-table__actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(u)}>
                      {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr><td colSpan="6" className="text-center">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ← Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
