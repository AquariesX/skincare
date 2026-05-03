import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getProducts, adminDeleteProduct } from '../../services/api'

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getProducts()
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await adminDeleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Delete failed.')
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__header">
          <h1 className="admin-page__title">Manage Products</h1>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">+ Add Product</Link>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {loading && <div className="spinner" />}

        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Type</th><th>For Skin</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.product_type || p.category || '—'}</td>
                  <td>{p.skin_type_name || '—'}</td>
                  <td className="admin-table__actions">
                    <Link to={`/admin/products/${p.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr><td colSpan="4" className="text-center">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
