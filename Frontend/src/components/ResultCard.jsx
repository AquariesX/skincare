const CONDITION_META = {
  acne:        { icon: '🔴', color: '#ef4444' },
  dark_spots:  { icon: '🟤', color: '#92400e' },
  normal_skin: { icon: '✅', color: '#10b981' },
  puffy_eyes:  { icon: '👁️', color: '#6366f1' },
  wrinkles:    { icon: '〰️', color: '#f59e0b' },
}

// Format underscore labels for display (e.g. dark_spots → Dark Spots)
const toDisplay = (label) => label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function ResultCard({ condition, confidence, allPredictions }) {
  const meta = CONDITION_META[condition] || { icon: '🔬', color: '#7c3aed' }

  return (
    <div className="result-card" style={{ '--accent': meta.color }}>
      <div className="result-card__header">
        <span className="result-card__icon">{meta.icon}</span>
        <div>
          <h2 className="result-card__condition">{toDisplay(condition)}</h2>
          <p className="result-card__confidence-label">Primary detection</p>
        </div>
        <span className="result-card__badge" style={{ background: meta.color }}>
          {confidence}%
        </span>
      </div>

      <div className="result-card__bar-wrap">
        <div
          className="result-card__bar"
          style={{ width: `${confidence}%`, background: meta.color }}
        />
      </div>

      {allPredictions && (
        <div className="result-card__breakdown">
          <h4>All Predictions</h4>
          {Object.entries(allPredictions).map(([label, pct]) => (
            <div key={label} className="result-card__row">
              <span className="result-card__label">{toDisplay(label)}</span>
              <div className="result-card__mini-bar-wrap">
                <div
                  className="result-card__mini-bar"
                  style={{
                    width: `${pct}%`,
                    background: CONDITION_META[label]?.color || '#7c3aed',
                  }}
                />
              </div>
              <span className="result-card__pct">{pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
