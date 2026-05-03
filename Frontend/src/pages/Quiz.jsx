import { useState, useEffect } from 'react'
import { getQuizQuestions, submitQuiz } from '../services/api'
import { Link } from 'react-router-dom'

const FALLBACK_QUESTIONS = [
  {
    id: 1,
    question: 'How does your skin feel by midday?',
    options: [
      { value: 'a', label: 'Tight and dry' },
      { value: 'b', label: 'Comfortable and balanced' },
      { value: 'c', label: 'Shiny and oily' },
    ],
  },
  {
    id: 2,
    question: 'How often do you get breakouts?',
    options: [
      { value: 'a', label: 'Rarely' },
      { value: 'b', label: 'Occasionally' },
      { value: 'c', label: 'Frequently' },
    ],
  },
  {
    id: 3,
    question: 'What do your pores look like?',
    options: [
      { value: 'a', label: 'Almost invisible' },
      { value: 'b', label: 'Normal sized' },
      { value: 'c', label: 'Visibly enlarged' },
    ],
  },
  {
    id: 4,
    question: 'How does your skin react to new products?',
    options: [
      { value: 'a', label: 'Often gets dry or flaky' },
      { value: 'b', label: 'Usually fine' },
      { value: 'c', label: 'Breaks out or gets oilier' },
    ],
  },
  {
    id: 5,
    question: 'How would you describe your skin texture?',
    options: [
      { value: 'a', label: 'Rough and flaky' },
      { value: 'b', label: 'Smooth and even' },
      { value: 'c', label: 'Thick and pored' },
    ],
  },
]

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getQuizQuestions()
      .then(({ data }) => {
        const qs = data.questions || []
        setQuestions(qs.length ? qs : FALLBACK_QUESTIONS)
      })
      .catch(() => setQuestions(FALLBACK_QUESTIONS))
      .finally(() => setLoading(false))
  }, [])

  const selectAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const goNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1)
  }

  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { data } = await submitQuiz(answers)
      setResult(data)
    } catch {
      // Fallback: tally locally
      const counts = { a: 0, b: 0, c: 0 }
      Object.values(answers).forEach((v) => { if (counts[v] !== undefined) counts[v]++ })
      const max = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0]
      const typeMap = { a: 'Dry', b: 'Normal', c: 'Oily' }
      setResult({ skin_type: typeMap[max], description: `Your answers suggest ${typeMap[max]} skin.` })
    } finally {
      setSubmitting(false)
    }
  }

  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0
  const q = questions[current]
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length

  if (loading) {
    return (
      <div className="page-quiz">
        <div className="quiz-loading">Loading questions...</div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="page-quiz">
        <div className="quiz-result">
          <div className="quiz-result__icon">✨</div>
          <h2>Your Skin Type</h2>
          <div className="quiz-result__type">{result.skin_type}</div>
          <p className="quiz-result__desc">{result.description}</p>
          <div className="quiz-result__actions">
            <Link to="/recommendations" className="btn btn--primary">
              View Recommendations
            </Link>
            <button
              className="btn btn--outline"
              onClick={() => { setResult(null); setAnswers({}); setCurrent(0) }}
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-quiz">
      <div className="quiz-container">
        <div className="quiz-header">
          <span className="section__label">Skin Type Quiz</span>
          <h1>Discover Your Skin Type</h1>
          <p>Answer {questions.length} quick questions to get personalized recommendations.</p>
        </div>

        <div className="quiz-progress">
          <div className="quiz-progress__bar">
            <div className="quiz-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="quiz-progress__label">
            {current + 1} / {questions.length}
          </span>
        </div>

        {q && (
          <div className="quiz-card">
            <h3 className="quiz-card__question">{q.question}</h3>
            <div className="quiz-card__options">
              {(q.options || q.answers || []).map((opt) => {
                const val = opt.value || opt.option_key || opt.label
                const label = opt.label || opt.text
                const isSelected = answers[q.id] === val
                return (
                  <button
                    key={val}
                    className={`quiz-option${isSelected ? ' quiz-option--selected' : ''}`}
                    onClick={() => selectAnswer(q.id, val)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="quiz-card__nav">
              <button className="btn btn--outline" onClick={goPrev} disabled={current === 0}>
                ← Back
              </button>
              {current < questions.length - 1 ? (
                <button
                  className="btn btn--primary"
                  onClick={goNext}
                  disabled={!answers[q.id]}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="btn btn--primary"
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                >
                  {submitting ? 'Calculating...' : 'See My Results →'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
