import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import {
  getSkinTypes, getRecommendations,
  adminCreateRecommendation, adminUpdateRecommendation, adminDeleteRecommendation
} from '../../services/api'

const FIELDS = [
  { key: 'description', label: 'Description', rows: 3 },
  { key: 'skincare_routine', label: 'Skincare Routine', rows: 4 },
  { key: 'medicines', label: 'Medicines', rows: 3 },
  { key: 'ointments', label: 'Ointments', rows: 3 },
  { key: 'serums', label: 'Serums', rows: 3 },
  { key: 'home_remedies', label: 'Home Remedies', rows: 4 },
  { key: 'precautions', label: 'Precautions', rows: 4 },
  { key: 'dermatologist_advice', label: 'When to See a Dermatologist', rows: 3 },
]

const EMPTY = FIELDS.reduce((a, f) => ({ ...a, [f.key]: '' }), { skin_type_id: '' })

export default function ManageRecommendations() {
  const [skinTypes, setSkinTypes] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getSkinTypes(), getRecommendations()])
      .then(([stRes, rRes]) => {
        setSkinTypes(stRes.data.skin_types || [])
        setRecommendations(rRes.data.recommendations || [])
      })
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setError(''); setSuccess('') }
  const openEdit = (rec) => {
    setEditing(rec.id)
    setForm({ skin_type_id: String(rec.skin_type_id), ...FIELDS.reduce((a, f) => ({ ...a, [f.key]: rec[f.key] || '' }), {}) })
    setError(''); setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.skin_type_id) { setError('Skin type is required.'); return }
    setLoading(true); setError('')
    try {
      const payload = { skin_type_id: Number(form.skin_type_id), ...FIELDS.reduce((a, f) => ({ ...a, [f.key]: form[f.key] }), {}) }
      let res
      if (editing) {
        res = await adminUpdateRecommendation(editing, payload)
        setRecommendations((prev) => prev.map((r) => r.id === editing ? res.data.recommendation : r))
      } else {
        res = await adminCreateRecommendation(payload)
        setRecommendations((prev) => [...prev, res.data.recommendation])
      }
      setSuccess('Saved successfully.')
      setForm(EMPTY); setEditing(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this recommendation?')) return
    try {
      await adminDeleteRecommendation(id)
      setRecommendations((prev) => prev.filter((r) => r.id !== id))
    } catch { alert('Delete failed.') }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__header">
          <h1 className="admin-page__title">Recommendations</h1>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ New</button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        {/* Form */}
        <div className="admin-panel">
          <h2>{editing ? 'Edit Recommendation' : 'Add Recommendation'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label className="form-label">Skin Condition *</label>
              <select className="form-input" value={form.skin_type_id}
                onChange={(e) => setForm({ ...form, skin_type_id: e.target.value })}>
                <option value="">-- Select Skin Condition --</option>
                {skinTypes.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </div>

            {FIELDS.map((f) => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <textarea className="form-input" rows={f.rows}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={`Enter ${f.label.toLowerCase()}...`}
                />
              </div>
            ))}

            <div className="form-actions">
              {editing && (
                <button type="button" className="btn btn-ghost" onClick={openNew}>Cancel</button>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editing ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="admin-panel">
          <h2>Existing Recommendations</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Skin Condition</th><th>Description</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => (
                <tr key={rec.id}>
                  <td>{rec.skin_type_name}</td>
                  <td>{(rec.description || '').slice(0, 80)}...</td>
                  <td className="admin-table__actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(rec)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rec.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {recommendations.length === 0 && (
                <tr><td colSpan="3" className="text-center">No recommendations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
