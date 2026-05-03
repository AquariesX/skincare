import { useLocation, useNavigate, Link } from 'react-router-dom'

const CONDITION_LABELS = {
  acne: 'Acne',
  dark_spots: 'Dark Spots (Hyperpigmentation)',
  normal_skin: 'Normal / Healthy Skin',
  puffy_eyes: 'Puffy Eyes',
  wrinkles: 'Wrinkles / Fine Lines',
}

const CONDITION_COLORS = {
  acne: '#ef4444',
  dark_spots: '#f59e0b',
  normal_skin: '#10b981',
  puffy_eyes: '#8b5cf6',
  wrinkles: '#6366f1',
}

function ConfidenceBar({ label, value, isTop }) {
  const pct = Math.round(value)
  return (
    <div className={`conf-bar ${isTop ? 'conf-bar--top' : ''}`}>
      <div className="conf-bar__header">
        <span className="conf-bar__label">{CONDITION_LABELS[label] || label}</span>
        <span className="conf-bar__pct">{pct}%</span>
      </div>
      <div className="conf-bar__track">
        <div
          className="conf-bar__fill"
          style={{ width: `${pct}%`, background: isTop ? CONDITION_COLORS[label] || 'var(--primary)' : undefined }}
        />
      </div>
    </div>
  )
}

function RecSection({ icon, title, content, variant }) {
  if (!content) return null
  const items = content.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
  return (
    <div className={`rec-section rec-section--${variant || 'default'}`}>
      <h3 className="rec-section__title">{icon} {title}</h3>
      {items.length > 1 ? (
        <ul className="rec-list">
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      ) : (
        <p>{content}</p>
      )}
    </div>
  )
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result

  if (!result) {
    return (
      <div className="page-empty">
        <div className="page-empty__inner">
          <span className="page-empty__icon">🔬</span>
          <h2>No results yet</h2>
          <p>Analyze your skin first to see your results here.</p>
          <Link to="/analyze" className="btn btn-primary">Go to Analyzer</Link>
        </div>
      </div>
    )
  }

  if (result.low_confidence) {
    return (
      <div className="results-page">
        <div className="results-page__inner">
          <div className="low-confidence-card">
            <span className="low-confidence-icon">⚠️</span>
            <h2>Low Confidence Result</h2>
            <p>{result.message}</p>
            <p className="conf-score">Confidence: {Math.round(result.confidence)}%</p>
            <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
              Try Again with Better Photo
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { condition, confidence, all_predictions, recommendation } = result
  const displayName = CONDITION_LABELS[condition] || condition
  const color = CONDITION_COLORS[condition] || 'var(--primary)'
  const allPredEntries = all_predictions
    ? Object.entries(all_predictions).sort((a, b) => b[1] - a[1])
    : []

  return (
    <div className="results-page">
      <div className="results-page__inner">

        {/* Result Header */}
        <div className="results-hero" style={{ borderColor: color }}>
          <div className="results-hero__badge" style={{ background: color }}>
            AI Detection
          </div>
          <h1 className="results-hero__condition" style={{ color }}>
            {displayName}
          </h1>
          <div className="results-hero__confidence">
            <div className="conf-ring" style={{ '--pct': `${Math.round(confidence)}%`, '--color': color }}>
              <span>{Math.round(confidence)}%</span>
            </div>
            <p>Confidence Score</p>
          </div>
          {recommendation?.description && (
            <p className="results-hero__desc">{recommendation.description}</p>
          )}
        </div>

        {/* Confidence breakdown */}
        {allPredEntries.length > 0 && (
          <div className="results-card">
            <h2>All Condition Scores</h2>
            <div className="conf-bars">
              {allPredEntries.map(([label, val]) => (
                <ConfidenceBar key={label} label={label} value={val} isTop={label === condition} />
              ))}
            </div>
          </div>
        )}

        {/* Medical disclaimer */}
        <div className="disclaimer-box">
          ⚠️ <strong>Educational information only.</strong> This is not a medical diagnosis.
          Always consult a qualified dermatologist for skin concerns.
        </div>

        {/* Recommendations from DB */}
        {recommendation && (
          <div className="results-recommendations">
            <h2>Your Personalized Recommendations</h2>

            <div className="rec-grid">
              <RecSection
                icon="🧴" title="Skincare Routine"
                content={recommendation.skincare_routine}
                variant="routine"
              />
              <RecSection
                icon="💊" title="Medicines"
                content={recommendation.medicines}
                variant="medicine"
              />
              <RecSection
                icon="🌿" title="Ointments"
                content={recommendation.ointments}
                variant="ointment"
              />
              <RecSection
                icon="✨" title="Serums"
                content={recommendation.serums}
                variant="serum"
              />
              <RecSection
                icon="🏠" title="Home Remedies"
                content={recommendation.home_remedies}
                variant="home"
              />
              <RecSection
                icon="🛡️" title="Precautions"
                content={recommendation.precautions}
                variant="precaution"
              />
            </div>

            {recommendation.dermatologist_advice && (
              <div className="derma-advice">
                <span className="derma-advice__icon">👨‍⚕️</span>
                <div>
                  <h3>When to Consult a Dermatologist</h3>
                  <p>{recommendation.dermatologist_advice}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="results-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/analyze')}>
            Analyze Another Photo
          </button>
          <Link to="/products" className="btn btn-primary">
            Browse Skincare Products
          </Link>
        </div>
      </div>
    </div>
  )
}
