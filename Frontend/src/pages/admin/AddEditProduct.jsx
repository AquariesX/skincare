import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getProduct, getSkinTypes, adminCreateProduct, adminUpdateProduct } from '../../services/api'

const PRODUCT_TYPES = ['Serum', 'Ointment', 'Cleanser', 'Moisturizer', 'Sunscreen',
  'Medicine', 'Toner', 'Eye Care', 'Mask', 'Exfoliant', 'Spot Treatment', 'Other']

// Defined OUTSIDE the page component so React never remounts it on re-render
function FieldInput({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  )
}

function FieldTextarea({ label, name, value, onChange, placeholder }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <textarea
        className="form-input"
        rows="4"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  )
}

export default function AddEditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '', skin_type_id: '', category: '', product_type: '',
    description: '', usage_instruction: '', ingredients: '',
  })
  const [skinTypes, setSkinTypes] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSkinTypes().then(({ data }) => setSkinTypes(data.skin_types || []))
    if (isEdit) {
      getProduct(id).then(({ data }) => {
        const p = data.product
        setForm({
          name: p.name || '',
          skin_type_id: p.skin_type_id || '',
          category: p.category || '',
          product_type: p.product_type || '',
          description: p.description || '',
          usage_instruction: p.usage_instruction || '',
          ingredients: p.ingredients || '',
        })
      }).catch(() => setError('Failed to load product.'))
    }
  }, [id, isEdit])

  // Single updater function — no re-definition on every render
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Product name is required.'); return }
    setLoading(true); setError('')

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (imageFile) fd.append('image', imageFile)

    try {
      if (isEdit) {
        await adminUpdateProduct(id, fd)
      } else {
        await adminCreateProduct(fd)
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page__title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <FieldInput
              label="Product Name *"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Vitamin C Serum"
            />
            <div className="form-group">
              <label className="form-label">Skin Condition</label>
              <select
                className="form-input"
                value={form.skin_type_id}
                onChange={(e) => handleChange('skin_type_id', e.target.value)}
              >
                <option value="">-- Select --</option>
                {skinTypes.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Type</label>
              <select
                className="form-input"
                value={form.product_type}
                onChange={(e) => handleChange('product_type', e.target.value)}
              >
                <option value="">-- Select --</option>
                {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <FieldInput
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Anti-aging"
            />
          </div>

          <FieldTextarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief product description"
          />
          <FieldTextarea
            label="Key Ingredients"
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            placeholder="e.g. Niacinamide, Retinol, Vitamin C"
          />
          <FieldTextarea
            label="Usage Instructions"
            name="usage_instruction"
            value={form.usage_instruction}
            onChange={handleChange}
            placeholder="How to apply this product"
          />

          <div className="form-group">
            <label className="form-label">Product Image</label>
            <input
              type="file"
              className="form-input"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/products')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
