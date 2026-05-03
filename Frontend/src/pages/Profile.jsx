import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/api'

export default function Profile() {
  const { user, fetchUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirm: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (form.password && form.password !== form.confirm) {
      setError('Passwords do not match.'); return
    }
    setLoading(true)
    const payload = { name: form.name }
    if (form.password) payload.password = form.password
    try {
      await updateProfile(payload)
      await fetchUser()
      setSuccess('Profile updated successfully.')
      setForm((f) => ({ ...f, password: '', confirm: '' }))
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="container-sm">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email">{user?.email}</p>
            <span className="role-badge role-badge--user">{user?.role}</span>
          </div>
        </div>

        {success && <div className="alert alert--success">{success}</div>}
        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password <span className="text-muted">(leave blank to keep current)</span></label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {form.password && (
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
