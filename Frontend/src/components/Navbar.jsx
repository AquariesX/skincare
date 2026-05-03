import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../services/api'

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/analyze', label: 'Analyze' },
  { path: '/products', label: 'Products' },
  { path: '/blog', label: 'Blog' },
  { path: '/about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logoutUser } = useAuth()
  const dropRef = useRef(null)
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropOpen(false) }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try { await logout() } catch {}
    logoutUser()
    navigate('/')
  }

  const navClass = [
    'navbar',
    isHome && !scrolled ? 'navbar--transparent' : 'navbar--solid',
    menuOpen ? 'navbar--open' : '',
  ].filter(Boolean).join(' ')

  return (
    <nav className={navClass}>
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">✦</span>
          <span className="navbar__name">SkinLytics</span>
        </Link>

        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>

        <div className={`navbar__menu${menuOpen ? ' navbar__menu--open' : ''}`}>
          {NAV_LINKS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`navbar__link${location.pathname === path ? ' navbar__link--active' : ''}`}
            >
              {label}
            </Link>
          ))}

          {user ? (
            <div className="navbar__user" ref={dropRef}>
              <button
                className="navbar__user-btn"
                onClick={() => setDropOpen(!dropOpen)}
              >
                <span className="navbar__avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span>{user.name?.split(' ')[0]}</span>
                <span className="navbar__chevron">▾</span>
              </button>

              {dropOpen && (
                <div className="navbar__dropdown">
                  {user.is_admin && (
                    <Link to="/admin" className="navbar__dropdown-item">📊 Admin Panel</Link>
                  )}
                  <Link to="/dashboard" className="navbar__dropdown-item">🏠 Dashboard</Link>
                  <Link to="/history" className="navbar__dropdown-item">📋 My History</Link>
                  <Link to="/profile" className="navbar__dropdown-item">👤 Profile</Link>
                  <hr className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
