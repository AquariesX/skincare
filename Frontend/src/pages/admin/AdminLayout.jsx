import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../services/api'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/admin/blogs', label: 'Blogs', icon: '📝' },
  { to: '/admin/products', label: 'Products', icon: '🧴' },
  { to: '/admin/recommendations', label: 'Recommendations', icon: '💡' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/records', label: 'Analysis Records', icon: '🔬' },
  { to: '/admin/logs', label: 'User Logs', icon: '📋' },
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logoutUser } = useAuth()

  const handleLogout = async () => {
    try { await logout() } catch {}
    logoutUser()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>✨</span>
          <span>SkinLytics Admin</span>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-nav__item ${isActive ? 'admin-nav__item--active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-nav__item">🌐 View Site</Link>
          <button className="admin-nav__item admin-nav__item--logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
