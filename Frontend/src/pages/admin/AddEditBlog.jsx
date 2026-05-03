import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getBlog, adminCreateBlog, adminUpdateBlog } from '../../services/api'

export default function AddEditBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ title: '', content: '' })
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getBlog(id)
      .then(({ data }) => {
        setForm({ title: data.blog.title, content: data.blog.content })
      })
      .catch(() => setError('Failed to load blog post.'))
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.'); return
    }
    setLoading(true); setError('')

    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('content', form.content)
    if (imageFile) fd.append('image', imageFile)

    try {
      if (isEdit) {
        await adminUpdateBlog(id, fd)
      } else {
        await adminCreateBlog(fd)
      }
      navigate('/admin/blogs')
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page__title">{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h1>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image</label>
            <input
              type="file"
              className="form-input"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-input"
              rows="16"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your blog post content here..."
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/blogs')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
