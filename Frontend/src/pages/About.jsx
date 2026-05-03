const techStack = [
  { name: 'React + Vite', icon: '⚛️', desc: 'Frontend UI framework' },
  { name: 'Flask', icon: '🐍', desc: 'Python REST API backend' },
  { name: 'TensorFlow', icon: '🤖', desc: 'Deep learning framework' },
  { name: 'EfficientNetB0', icon: '🧠', desc: 'Pre-trained CNN model' },
  { name: 'MySQL', icon: '🗄️', desc: 'Relational database' },
  { name: 'JWT Auth', icon: '🔐', desc: 'Secure token-based auth' },
]

const aiSteps = [
  { step: '1', title: 'Image Input', desc: 'User uploads a skin photo (JPG/PNG).' },
  { step: '2', title: 'Preprocessing', desc: 'Resized to 128×128, normalized to [0,1], BGR format.' },
  { step: '3', title: 'Model Inference', desc: 'EfficientNetB0 predicts across 5 skin condition classes.' },
  { step: '4', title: 'Result', desc: 'Top prediction + confidence score returned to the user.' },
]

const conditions = [
  { name: 'Acne', icon: '🔴' },
  { name: 'Dark Spots', icon: '🟤' },
  { name: 'Normal Skin', icon: '✅' },
  { name: 'Puffy Eyes', icon: '👁️' },
  { name: 'Wrinkles', icon: '〰️' },
]

export default function About() {
  return (
    <div className="page-about">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <span className="section__label">About SkinLytics</span>
          <h1>AI-Powered Skin Analysis</h1>
          <p>
            SkinLytics is a Final Year Project that combines computer vision, deep learning,
            and modern web technologies to help people understand and improve their skin health.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="section__container about-mission">
          <div className="about-mission__text">
            <h2>Our Mission</h2>
            <p>
              Professional dermatology consultations are expensive and inaccessible for many.
              We built SkinLytics to democratize skin health — giving everyone an instant,
              AI-powered analysis and actionable skincare advice at zero cost.
            </p>
            <p>
              By training a custom deep learning model on thousands of skin images, we can
              detect common conditions like acne, dark spots, wrinkles, and more with
              high confidence, then deliver personalized recommendations.
            </p>
          </div>
          <div className="about-mission__conditions">
            <h3>Detectable Conditions</h3>
            <div className="conditions-grid">
              {conditions.map((c) => (
                <div key={c.name} className="condition-chip">
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section section--alt">
        <div className="section__container">
          <div className="section__header">
            <span className="section__label">Technology</span>
            <h2>Built With</h2>
          </div>
          <div className="tech-grid">
            {techStack.map((t) => (
              <div key={t.name} className="tech-card">
                <div className="tech-card__icon">{t.icon}</div>
                <h4 className="tech-card__name">{t.name}</h4>
                <p className="tech-card__desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Pipeline */}
      <section className="section">
        <div className="section__container">
          <div className="section__header">
            <span className="section__label">AI Pipeline</span>
            <h2>How the Model Works</h2>
          </div>
          <div className="ai-pipeline">
            {aiSteps.map((s, i) => (
              <div key={s.step} className="ai-step">
                <div className="ai-step__num">{s.step}</div>
                <div className="ai-step__content">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
                {i < aiSteps.length - 1 && <div className="ai-step__arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section section--alt">
        <div className="section__container">
          <div className="about-disclaimer">
            <span className="about-disclaimer__icon">⚠️</span>
            <div>
              <h3>Medical Disclaimer</h3>
              <p>
                SkinLytics is an educational tool and does not replace professional medical advice.
                For persistent or severe skin conditions, please consult a licensed dermatologist.
                This application is built as a Final Year Project for academic purposes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
