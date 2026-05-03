import { useState, useEffect } from 'react'
import { getSkinTypes, getRecommendations } from '../services/api'
import RecommendationCard from '../components/RecommendationCard'

const FALLBACK_TYPES = [
  { id: 1, name: 'Oily' },
  { id: 2, name: 'Dry' },
  { id: 3, name: 'Combination' },
  { id: 4, name: 'Normal' },
  { id: 5, name: 'Sensitive' },
]

export default function Recommendations() {
  const [skinTypes, setSkinTypes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [loadingRec, setLoadingRec] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSkinTypes()
      .then(({ data }) => {
        const types = data.skin_types || []
        setSkinTypes(types.length ? types : FALLBACK_TYPES)
      })
      .catch(() => setSkinTypes(FALLBACK_TYPES))
      .finally(() => setLoadingTypes(false))
  }, [])

  const selectType = async (id) => {
    setActiveId(id)
    setRecommendation(null)
    setError('')
    setLoadingRec(true)
    try {
      const { data } = await getRecommendations(id)
      setRecommendation(data.recommendation)
    } catch {
      setError('Could not load recommendations. Please try again.')
    } finally {
      setLoadingRec(false)
    }
  }

  return (
    <div className="page-rec">
      <div className="page-rec__inner">
        <div className="page-rec__header">
          <span className="section__label">Skincare Guide</span>
          <h1>Recommendations by Skin Type</h1>
          <p>Select your skin type to get personalized tips, ingredients, and product suggestions.</p>
        </div>

        {loadingTypes ? (
          <div className="rec-tabs-loading">Loading skin types...</div>
        ) : (
          <div className="rec-tabs">
            {skinTypes.map((st) => (
              <button
                key={st.id}
                className={`rec-tab${activeId === st.id ? ' rec-tab--active' : ''}`}
                onClick={() => selectType(st.id)}
              >
                {st.name}
              </button>
            ))}
          </div>
        )}

        {!activeId && !loadingTypes && (
          <div className="rec-empty">
            <p className="rec-empty__icon">💆</p>
            <p>Select a skin type above to see recommendations.</p>
          </div>
        )}

        {error && <div className="alert alert--error">{error}</div>}

        {loadingRec && (
          <div className="rec-loading">
            <div className="spinner spinner--inline"></div>
            <span>Loading recommendations...</span>
          </div>
        )}

        {recommendation && !loadingRec && (
          <RecommendationCard recommendation={recommendation} />
        )}

        <div className="rec-cta">
          <p>Not sure of your skin type?</p>
          <a href="/quiz" className="btn btn--primary">Take the Quiz →</a>
        </div>
      </div>
    </div>
  )
}
