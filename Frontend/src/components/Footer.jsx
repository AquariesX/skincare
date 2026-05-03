import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div>
            <p className="footer__brand">✦ SkinLytics</p>
            <p className="footer__desc">
              AI-powered skin analysis for healthier, glowing skin.
              Upload a photo and get personalized skincare recommendations in seconds.
            </p>
          </div>
          <div>
            <p className="footer__col-title">Analyze</p>
            <Link to="/analyze" className="footer__link">Analyze Skin</Link>
            <Link to="/products" className="footer__link">Products</Link>
            <Link to="/blog" className="footer__link">Blog</Link>
          </div>
          <div>
            <p className="footer__col-title">Account</p>
            <Link to="/login" className="footer__link">Login</Link>
            <Link to="/signup" className="footer__link">Sign Up</Link>
            <Link to="/about" className="footer__link">About</Link>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} SkinLytics — FYP Project</p>
          <p>⚠️ Educational purposes only. Not a substitute for medical advice.</p>
        </div>
      </div>
    </footer>
  )
}
