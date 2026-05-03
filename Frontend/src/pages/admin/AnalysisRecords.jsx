import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminAnalysisRecords } from '../../services/api'

const CONDITION_LABELS = {
  acne: 'Acne', dark_spots: 'Dark Spots', normal_skin: 'Healthy Skin',
  puffy_eyes: 'Puffy Eyes', wrinkles: 'Wrinkles',
}

export default function AnalysisRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    getAdminAnalysisRecords(page)
      .then(({ data }) => {
        setRecords(data.records || [])
        setTotalPages(data.pages || 1)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page__title">Analysis Records</h1>
        {loading && <div className="spinner" />}

        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>User</th><th>Condition</th><th>Confidence</th><th>Date</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <div>{r.user_name || 'Guest'}</div>
                    <small className="text-muted">{r.user_email || ''}</small>
                  </td>
                  <td>{CONDITION_LABELS[r.predicted_condition] || r.predicted_condition}</td>
                  <td>{Math.round(r.confidence_score)}%</td>
                  <td>{new Date(r.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}</td>
                </tr>
              ))}
              {!loading && records.length === 0 && (
                <tr><td colSpan="5" className="text-center">No records found.</td></tr>
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
