export default function RecommendationCard({ recommendation }) {
  if (!recommendation) return null

  const {
    display_name,
    description,
    summary,
    tips = [],
    key_ingredients = [],
    recommended_products = [],
    color = '#7c3aed',
  } = recommendation

  return (
    <div className="rec-card" style={{ '--rec-color': color }}>
      <div className="rec-card__header">
        <h3 className="rec-card__title" style={{ color }}>
          {display_name || 'Recommendations'}
        </h3>
        {summary && <p className="rec-card__summary">{summary}</p>}
      </div>

      {description && (
        <p className="rec-card__description">{description}</p>
      )}

      {tips.length > 0 && (
        <div className="rec-card__section">
          <h4>Skin Care Tips</h4>
          <ul className="rec-card__list">
            {tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {key_ingredients.length > 0 && (
        <div className="rec-card__section">
          <h4>Key Ingredients to Look For</h4>
          <div className="rec-card__tags">
            {key_ingredients.map((ing, i) => (
              <span key={i} className="badge badge--primary">{ing}</span>
            ))}
          </div>
        </div>
      )}

      {recommended_products.length > 0 && (
        <div className="rec-card__section">
          <h4>Recommended Products</h4>
          <div className="rec-card__tags">
            {recommended_products.map((prod, i) => (
              <span key={i} className="badge badge--secondary">{prod}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
