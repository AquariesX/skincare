import { useState, useEffect } from 'react'
import { getProducts, getSkinTypes } from '../services/api'

const TYPE_ICONS = {
  serum: '✨', ointment: '🧴', cleanser: '🫧', moisturizer: '💧',
  sunscreen: '☀️', medicine: '💊', toner: '🌿', mask: '🎭',
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [skinTypes, setSkinTypes] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getProducts(), getSkinTypes()])
      .then(([pRes, stRes]) => {
        setProducts(pRes.data.products || [])
        setSkinTypes(stRes.data.skin_types || [])
      })
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) => {
    const matchType = !selectedType || String(p.skin_type_id) === selectedType
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" /><p>Loading products...</p>
    </div>
  )

  return (
    <div className="products-page">
      <div className="products-hero">
        <div className="container">
          <h1>Skincare Products</h1>
          <p>Science-backed products curated for your specific skin condition</p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="products-filters">
          <input
            type="text"
            className="form-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-input"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Skin Conditions</option>
            {skinTypes.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        {filtered.length === 0 && !loading && (
          <div className="page-empty">
            <p className="page-empty__icon">🧴</p>
            <h3>No products found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        )}

        <div className="products-grid">
          {filtered.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card__img">
                {product.image_path ? (
                  <img src={`/api/uploads/${product.image_path}`} alt={product.name} />
                ) : (
                  <div className="product-card__placeholder">
                    {TYPE_ICONS[product.product_type?.toLowerCase()] || '🧴'}
                  </div>
                )}
              </div>
              <div className="product-card__body">
                {product.product_type && (
                  <span className="product-type-badge">{product.product_type}</span>
                )}
                <h3 className="product-card__name">{product.name}</h3>
                {product.skin_type_name && (
                  <p className="product-card__skin-type">For: {product.skin_type_name}</p>
                )}
                {product.description && (
                  <p className="product-card__desc">{product.description}</p>
                )}
                {product.ingredients && (
                  <p className="product-card__ingredients">
                    <strong>Key Ingredients:</strong> {product.ingredients}
                  </p>
                )}
                {product.usage_instruction && (
                  <details className="product-usage">
                    <summary>How to use</summary>
                    <p>{product.usage_instruction}</p>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
