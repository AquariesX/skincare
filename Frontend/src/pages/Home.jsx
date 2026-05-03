import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: '🔬', title: 'AI-Powered Analysis', desc: 'Deep learning model detects 5 skin conditions with high accuracy from a single photo.' },
  { icon: '📷', title: 'Camera or Upload', desc: 'Use your device camera or upload an existing photo — no app download required.' },
  { icon: '💊', title: 'Medical Recommendations', desc: 'Get medicines, serums, ointments, home remedies, and precautions for your condition.' },
  { icon: '📊', title: 'Track Your Progress', desc: 'Save all analyses to your account and monitor your skin health journey over time.' },
  { icon: '🛒', title: 'Product Catalog', desc: 'Browse curated skincare products matched to your specific skin condition.' },
  { icon: '👨‍⚕️', title: 'Dermatologist Advice', desc: 'Know exactly when to consult a dermatologist based on your condition severity.' },
]

const STEPS = [
  { num: 1, icon: '📸', title: 'Upload or Capture', desc: 'Take a selfie with your camera or upload a clear photo of your face.' },
  { num: 2, icon: '🤖', title: 'AI Analyzes', desc: 'Our EfficientNet model detects your skin condition in under 3 seconds.' },
  { num: 3, icon: '📋', title: 'Get Results', desc: 'Receive a full report with recommendations, medicines, and home remedies.' },
  { num: 4, icon: '✨', title: 'Follow Your Plan', desc: 'Apply the personalized skincare routine and track your improvement.' },
]

const CONDITIONS = [
  { name: 'Acne', color: '#ef4444', icon: '😤' },
  { name: 'Dark Spots', color: '#f59e0b', icon: '🔵' },
  { name: 'Wrinkles', color: '#6366f1', icon: '🌊' },
  { name: 'Puffy Eyes', color: '#8b5cf6', icon: '👁️' },
  { name: 'Healthy Skin', color: '#10b981', icon: '✨' },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero__inner">
          <div>
            <div className="home-hero__badge">
              ✨ AI-Powered Skincare Analysis
            </div>
            <h1 className="home-hero__title">
              Know Your Skin.<br />
              <span>Glow With Confidence.</span>
            </h1>
            <p className="home-hero__subtitle">
              Upload a photo or use your camera. Our AI detects your skin condition
              in seconds and gives you personalized medicines, serums, and home remedies.
            </p>
            <div className="home-hero__actions">
              <Link to="/analyze" className="btn btn-primary btn-lg">
                Analyze My Skin →
              </Link>
              {!user && (
                <Link to="/signup" className="btn btn-outline-white btn-lg">
                  Create Free Account
                </Link>
              )}
            </div>

            <div className="home-stats">
              <div className="home-stat">
                <div className="home-stat__value">5</div>
                <div className="home-stat__label">Conditions Detected</div>
              </div>
              <div className="home-stat">
                <div className="home-stat__value">AI</div>
                <div className="home-stat__label">Deep Learning Model</div>
              </div>
              <div className="home-stat">
                <div className="home-stat__value">Free</div>
                <div className="home-stat__label">Always Free</div>
              </div>
            </div>
          </div>

          <div className="home-hero__visual">
            <div className="home-hero__card">
              <span className="home-hero__icon">🧬</span>
              <h3>Skin Analysis</h3>
              <p>Upload your photo and get a complete skin health report with actionable recommendations.</p>
              <div style={{ marginTop: '1.5rem' }}>
                {CONDITIONS.map((c) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.82)' }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <div className="container">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">
            Complete skincare analysis system powered by deep learning and medical guidelines.
          </p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="home-how">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get your skin analysis in 4 simple steps — takes less than 30 seconds.</p>
          <div className="how-steps">
            {STEPS.map((s) => (
              <div key={s.num} className="how-step">
                <div className="how-step__num">{s.num}</div>
                <div className="how-step__icon">{s.icon}</div>
                <h3 className="how-step__title">{s.title}</h3>
                <p className="how-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="container">
          <h2>Ready to Know Your Skin?</h2>
          <p>Join thousands of users getting personalized skincare advice powered by AI.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/analyze" className="btn btn-primary btn-lg">
              Start Free Analysis →
            </Link>
            <Link to="/products" className="btn btn-outline-white btn-lg">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
