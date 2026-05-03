import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserHistory } from '../services/api'

const CONDITION_LABELS = {
  acne: 'Acne', dark_spots: 'Dark Spots', normal_skin: 'Healthy Skin',
  puffy_eyes: 'Puffy Eyes', wrinkles: 'Wrinkles',
}
const CONDITION_COLORS = {
  acne: '#ef4444', dark_spots: '#f59e0b', normal_skin: '#10b981',
  puffy_eyes: '#8b5cf6', wrinkles: '#6366f1',
}

export default function AnalysisHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')

  const load = (p) => {
    setLoading(true)
    getUserHistory(p)
      .then(({ data }) => {
        setHistory(data.history || [])
        setTotalPages(data.pages || 1)
      })
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  return (
    <div className="history-page">
      <div className="container">
        <div className="page-header">
          <h1>Analysis History</h1>
          <p>All your past skin analyses in one place</p>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {loading && <div className="spinner" />}

        {!loading && history.length === 0 && (
          <div className="page-empty">
            <p className="page-empty__icon">🔬</p>
            <h3>No analyses yet</h3>
            <p>Start your skin journey with an analysis.</p>
            <Link to="/analyze" className="btn btn-primary">Analyze Now</Link>
          </div>
        )}

        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <div
                className="history-card__stripe"
                style={{ background: CONDITION_COLORS[item.predicted_condition] || 'var(--primary)' }}
              />
              <div className="history-card__body">
                <div className="history-card__condition">
                  {CONDITION_LABELS[item.predicted_condition] || item.predicted_condition}
                </div>
                <div className="history-card__conf">
                  <div
                    className="conf-badge"
                    style={{ background: CONDITION_COLORS[item.predicted_condition] || 'var(--primary)' }}
                  >
                    {Math.round(item.confidence_score)}%
                  </div>
                  <span>confidence</span>
                </div>
                <p className="history-card__date">
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                {item.recommendation?.description && (
                  <p className="history-card__rec">{item.recommendation.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
