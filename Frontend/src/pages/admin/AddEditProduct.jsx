import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getProduct, getSkinTypes, adminCreateProduct, adminUpdateProduct } from '../../services/api'

const PRODUCT_TYPES = ['Serum', 'Ointment', 'Cleanser', 'Moisturizer', 'Sunscreen',
  'Medicine', 'Toner', 'Eye Care', 'Mask', 'Exfoliant', 'Spot Treatment', 'Other']

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
          name: p.name, skin_type_id: p.skin_type_id || '',
          category: p.category || '', product_type: p.product_type || '',
          description: p.description || '', usage_instruction: p.usage_instruction || '',
          ingredients: p.ingredients || '',
        })
      }).catch(() => setError('Failed to load product.'))
    }
  }, [id, isEdit])

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

  const F = ({ label, name, type = 'text', placeholder, as }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {as === 'textarea' ? (
        <textarea className="form-input" rows="4" placeholder={placeholder}
          value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
      ) : (
        <input type={type} className="form-input" placeholder={placeholder}
          value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
      )}
    </div>
  )

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page__title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <F label="Product Name *" name="name" placeholder="e.g. Vitamin C Serum" />
            <div className="form-group">
              <label className="form-label">Skin Condition</label>
              <select className="form-input" value={form.skin_type_id}
                onChange={(e) => setForm({ ...form, skin_type_id: e.target.value })}>
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
              <select className="form-input" value={form.product_type}
                onChange={(e) => setForm({ ...form, product_type: e.target.value })}>
                <option value="">-- Select --</option>
                {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <F label="Category" name="category" placeholder="e.g. Anti-aging" />
          </div>

          <F label="Description" name="description" placeholder="Brief product description" as="textarea" />
          <F label="Key Ingredients" name="ingredients" placeholder="e.g. Niacinamide, Retinol, Vitamin C" as="textarea" />
          <F label="Usage Instructions" name="usage_instruction" placeholder="How to apply this product" as="textarea" />

          <div className="form-group">
            <label className="form-label">Product Image</label>
            <input type="file" className="form-input" accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
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
