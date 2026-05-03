import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBlog } from '../services/api'

export default function BlogDetail() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getBlog(slug)
      .then(({ data }) => setBlog(data.blog))
      .catch(() => setError('Blog post not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="page-loading"><div className="spinner" /><p>Loading post...</p></div>
  )

  if (error || !blog) return (
    <div className="page-empty">
      <p className="page-empty__icon">📭</p>
      <h2>Post not found</h2>
      <Link to="/blog" className="btn btn-primary">Back to Blog</Link>
    </div>
  )

  return (
    <div className="blog-detail-page">
      <div className="container-sm">
        <Link to="/blog" className="back-link">← Back to Blog</Link>

        <article className="blog-article">
          {blog.image_path && (
            <div className="blog-article__hero">
              <img src={`/api/uploads/${blog.image_path}`} alt={blog.title} />
            </div>
          )}

          <header className="blog-article__header">
            <h1>{blog.title}</h1>
            <div className="blog-article__meta">
              <span>By {blog.author_name || 'Admin'}</span>
              <span>·</span>
              <span>{new Date(blog.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
          </header>

          <div
            className="blog-article__content"
            dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }}
          />
        </article>

        <div className="blog-detail-actions">
          <Link to="/blog" className="btn btn-secondary">← All Posts</Link>
          <Link to="/analyze" className="btn btn-primary">Analyze Your Skin</Link>
        </div>
      </div>
    </div>
  )
}
