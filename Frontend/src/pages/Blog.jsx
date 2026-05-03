import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBlogs } from '../services/api'

export default function Blog() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getBlogs()
      .then(({ data }) => setBlogs(data.blogs || []))
      .catch(() => setError('Failed to load blog posts.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-loading"><div className="spinner" /><p>Loading posts...</p></div>
  )

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <h1>Skincare Blog</h1>
          <p>Expert tips, guides, and insights for healthy, radiant skin</p>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert--error">{error}</div>}

        {blogs.length === 0 && !loading && (
          <div className="page-empty">
            <p className="page-empty__icon">📝</p>
            <h3>No blog posts yet</h3>
            <p>Check back soon for skincare tips and guides.</p>
          </div>
        )}

        <div className="blog-grid">
          {blogs.map((blog) => (
            <article key={blog.id} className="blog-card">
              <div className="blog-card__img">
                {blog.image_path ? (
                  <img src={`/api/uploads/${blog.image_path}`} alt={blog.title} />
                ) : (
                  <div className="blog-card__placeholder">📰</div>
                )}
              </div>
              <div className="blog-card__body">
                <div className="blog-card__meta">
                  <span>{blog.author_name || 'Admin'}</span>
                  <span>·</span>
                  <span>{new Date(blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}</span>
                </div>
                <h2 className="blog-card__title">
                  <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                </h2>
                <p className="blog-card__excerpt">{blog.excerpt}</p>
                <Link to={`/blog/${blog.slug}`} className="blog-card__read-more">
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
