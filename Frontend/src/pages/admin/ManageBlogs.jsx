import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getBlogs, adminDeleteBlog } from '../../services/api'

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getBlogs()
      .then(({ data }) => setBlogs(data.blogs || []))
      .catch(() => setError('Failed to load blogs.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post?')) return
    try {
      await adminDeleteBlog(id)
      setBlogs((prev) => prev.filter((b) => b.id !== id))
    } catch {
      alert('Delete failed.')
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__header">
          <h1 className="admin-page__title">Manage Blogs</h1>
          <Link to="/admin/blogs/new" className="btn btn-primary btn-sm">+ New Post</Link>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {loading && <div className="spinner" />}

        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th><th>Author</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    <a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer">
                      {blog.title}
                    </a>
                  </td>
                  <td>{blog.author_name}</td>
                  <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                  <td className="admin-table__actions">
                    <Link to={`/admin/blogs/${blog.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(blog.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!loading && blogs.length === 0 && (
                <tr><td colSpan="4" className="text-center">No blog posts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
