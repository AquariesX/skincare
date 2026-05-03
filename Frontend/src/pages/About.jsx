import { useEffect, useRef } from 'react'

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Detection',
    desc: 'EfficientNetB0 deep learning model trained on thousands of skin images to detect 5 common conditions with high accuracy.',
  },
  {
    icon: '⚡',
    title: 'Instant Results',
    desc: 'Get your skin analysis in seconds — no appointment, no waiting room, no cost.',
  },
  {
    icon: '💊',
    title: 'Personalized Advice',
    desc: 'Receive tailored skincare routines, recommended serums, medicines, and home remedies based on your specific condition.',
  },
  {
    icon: '📷',
    title: 'Camera or Upload',
    desc: 'Take a live photo with your device camera or upload an existing image for analysis.',
  },
  {
    icon: '🔐',
    title: 'Secure & Private',
    desc: 'JWT-based authentication protects your data. Analysis history is stored securely and accessible only to you.',
  },
  {
    icon: '📱',
    title: 'Works Everywhere',
    desc: 'Fully responsive design works on phones, tablets, and desktops without installing anything.',
  },
]

const techStack = [
  { name: 'React + Vite', icon: '⚛️', color: '#61dafb', desc: 'Fast, modern frontend UI' },
  { name: 'Flask', icon: '🐍', color: '#10b981', desc: 'Python REST API backend' },
  { name: 'TensorFlow', icon: '🤖', color: '#ff6d00', desc: 'Deep learning framework' },
  { name: 'EfficientNetB0', icon: '🧠', color: '#a78bfa', desc: 'Pre-trained CNN model' },
  { name: 'MySQL', icon: '🗄️', color: '#0069a1', desc: 'Relational database' },
  { name: 'JWT Auth', icon: '🔐', color: '#f59e0b', desc: 'Secure token authentication' },
]

const pipeline = [
  {
    num: '01',
    icon: '📷',
    title: 'Capture / Upload',
    desc: 'User takes a photo with the camera or uploads a JPG/PNG/WEBP image of the affected skin area.',
  },
  {
    num: '02',
    icon: '🔬',
    title: 'Preprocessing',
    desc: 'Image is resized to 128×128 pixels, normalized to [0,1] range, and prepared for the model.',
  },
  {
    num: '03',
    icon: '🧠',
    title: 'AI Inference',
    desc: 'EfficientNetB0 analyses the image and predicts probabilities across 5 skin condition classes.',
  },
  {
    num: '04',
    icon: '✅',
    title: 'Results & Advice',
    desc: 'Top prediction with confidence score is returned along with a full personalized skincare plan.',
  },
]

const conditions = [
  { name: 'Acne', icon: '🔴', desc: 'Pimples, blackheads, whiteheads' },
  { name: 'Dark Spots', icon: '🟤', desc: 'Hyperpigmentation, sun damage' },
  { name: 'Normal Skin', icon: '✅', desc: 'Healthy, balanced skin' },
  { name: 'Puffy Eyes', icon: '👁️', desc: 'Eye puffiness & under-eye bags' },
  { name: 'Wrinkles', icon: '〰️', desc: 'Fine lines & aging signs' },
]

// Simple fade-in animation hook
function useFadeIn(threshold = 0.15) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)' } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}

function FadeSection({ children, style = {} }) {
  const ref = useFadeIn()
  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(28px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function About() {
  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--gradient-hero)',
        padding: '6rem 1.5rem 5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(124,58,237,0.25)', filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '260px', height: '260px', borderRadius: '50%',
          background: 'rgba(236,72,153,0.18)', filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.9)', padding: '0.4rem 1.2rem',
            borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            Final Year Project — AI Skincare
          </span>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: 'white',
            marginBottom: '1.25rem', fontFamily: 'Poppins, sans-serif', fontWeight: 800,
          }}>
            Meet{' '}
            <span style={{
              background: 'linear-gradient(90deg,#a78bfa,#f9a8d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>SkinLytics</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.78)', fontSize: '1.1rem', lineHeight: 1.75,
            maxWidth: '600px', margin: '0 auto 2.5rem',
          }}>
            An AI-powered web application that analyses your skin condition from a photo and
            delivers personalised skincare recommendations — completely free.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/analyze" className="btn btn-primary btn-lg">Try It Free →</a>
            <a href="/products" className="btn btn-outline-white btn-lg">View Products</a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1.5rem', textAlign: 'center',
        }}>
          {[
            { val: '5', label: 'Skin Conditions' },
            { val: 'EfficientNetB0', label: 'AI Model' },
            { val: 'Real-time', label: 'Analysis Speed' },
            { val: '100%', label: 'Free to Use' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Poppins, sans-serif' }}>{s.val}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Detectable Conditions ────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-section)' }}>
        <FadeSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>What We Detect</span>
            <h2 className="section-title">5 Skin Conditions Analysed</h2>
            <p className="section-subtitle">
              Our model is trained to classify five common skin concerns with confidence scores.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.25rem', maxWidth: '900px', margin: '0 auto',
          }}>
            {conditions.map((c) => (
              <div key={c.name} style={{
                background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.75rem 1rem',
                textAlign: 'center', boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.25s, box-shadow 0.25s',
                cursor: 'default',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <FadeSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Features</span>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">
              Built with a complete full-stack architecture covering AI, web development, and database management.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem', maxWidth: '1100px', margin: '0 auto',
          }}>
            {features.map((f, i) => (
              <div key={f.title} style={{
                background: 'var(--bg-section)', borderRadius: 'var(--radius-xl)',
                padding: '1.75rem', border: '1px solid var(--border-light)',
                transition: 'transform 0.25s, border-color 0.25s',
                animationDelay: `${i * 0.08}s`,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary-light)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-light)' }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-ultra)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem',
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── AI Pipeline ───────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-section)' }}>
        <FadeSection>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>How It Works</span>
            <h2 className="section-title">The AI Pipeline</h2>
            <p className="section-subtitle">From photo to personalised skincare plan in 4 steps.</p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem', maxWidth: '1000px', margin: '0 auto',
          }}>
            {pipeline.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                <div style={{
                  background: 'white', borderRadius: 'var(--radius-xl)', padding: '2rem 1.5rem',
                  textAlign: 'center', boxShadow: 'var(--shadow-md)', height: '100%',
                }}>
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--gradient-primary)', color: 'white', borderRadius: '999px',
                    padding: '0.25rem 0.9rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
                  }}>
                    STEP {step.num}
                  </div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', marginTop: '0.5rem' }}>{step.icon}</div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-dark)' }}>{step.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
                {i < pipeline.length - 1 && (
                  <div style={{
                    display: 'none',
                  }} className="pipeline-arrow" />
                )}
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── Tech Stack ────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <FadeSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Technology</span>
            <h2 className="section-title">Built With</h2>
            <p className="section-subtitle">
              A production-grade stack combining modern web development and machine learning tools.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1.25rem', maxWidth: '1050px', margin: '0 auto',
          }}>
            {techStack.map((t) => (
              <div key={t.name} style={{
                background: 'var(--bg-section)', border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)', padding: '1.5rem 1rem',
                textAlign: 'center', transition: 'transform 0.25s, border-color 0.25s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = t.color }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-light)' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{t.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── Mission ───────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)',
      }}>
        <FadeSection>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1.5rem' }}>🎯</span>
            <h2 className="section-title">Our Mission</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              Professional dermatology consultations are expensive and inaccessible for many people.
              We built SkinLytics to <strong>democratise skin health</strong> — giving everyone instant,
              AI-powered skin analysis and actionable advice at zero cost.
            </p>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: 1.8 }}>
              By training a deep learning model on thousands of labelled skin images using EfficientNetB0
              transfer learning, we achieve reliable detection of five common conditions, paired with
              a comprehensive skincare recommendation database.
            </p>
          </div>
        </FadeSection>
      </section>

      {/* ── Disclaimer ────────────────────────────────────────── */}
      <section style={{ padding: '4rem 1.5rem', background: 'white' }}>
        <FadeSection>
          <div style={{
            maxWidth: '780px', margin: '0 auto',
            background: '#fffbeb', border: '2px solid #fde68a',
            borderRadius: 'var(--radius-xl)', padding: '2rem 2.5rem',
            display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '2rem', flexShrink: 0 }}>⚠️</span>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.6rem', color: '#92400e' }}>
                Medical Disclaimer
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#78350f', lineHeight: 1.7 }}>
                SkinLytics is an <strong>educational tool</strong> and does <strong>not</strong> replace professional
                medical advice, diagnosis, or treatment. For persistent, severe, or worsening skin conditions,
                please consult a licensed dermatologist. This application is developed as a Final Year Project
                for academic purposes only.
              </p>
            </div>
          </div>
        </FadeSection>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'var(--gradient-hero)',
        textAlign: 'center',
      }}>
        <FadeSection>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'white', marginBottom: '1rem' }}>
            Ready to Analyse Your Skin?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
            It takes less than 30 seconds. No sign-up required.
          </p>
          <a href="/analyze" className="btn btn-primary btn-lg">
            Start Free Analysis →
          </a>
        </FadeSection>
      </section>

    </div>
  )
}
