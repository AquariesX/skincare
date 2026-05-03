import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import { predictSkin } from '../services/api'

export default function Analyze() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('upload')       // 'upload' | 'camera'
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [captured, setCaptured] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  // ── File upload ───────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(selected.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.')
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }
    setError('')
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setCaptured(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFileChange({ target: { files: [dropped] } })
  }

  // ── Camera ────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
      setCaptured(false)
      setFile(null)
      setPreview(null)
    } catch {
      setError('Camera access denied. Please allow camera permission and try again.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      const capturedFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
      setFile(capturedFile)
      setPreview(canvas.toDataURL('image/jpeg'))
      setCaptured(true)
      stopCamera()
    }, 'image/jpeg', 0.92)
  }, [stopCamera])

  const retake = () => {
    setFile(null)
    setPreview(null)
    setCaptured(false)
    startCamera()
  }

  const switchTab = (t) => {
    if (cameraActive) stopCamera()
    setTab(t)
    setFile(null)
    setPreview(null)
    setCaptured(false)
    setError('')
  }

  // ── Analyze ───────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) { setError('Please select or capture an image first.'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await predictSkin(file)
      if (cameraActive) stopCamera()
      navigate('/results', { state: { result: data } })
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Analyzing your skin with AI..." />

  return (
    <div className="analyze-page">
      <div className="analyze-page__inner">
        <div className="analyze-header">
          <span className="analyze-badge">AI Analysis</span>
          <h1>Analyze Your Skin</h1>
          <p>Upload a photo or use your camera for instant AI-powered skin analysis</p>
        </div>

        {/* Tips */}
        <div className="analyze-tips">
          {['Good lighting', 'No filters', 'Face centered', 'Clear focus'].map((tip) => (
            <div key={tip} className="analyze-tip">✓ {tip}</div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="analyze-tabs">
          <button
            className={`analyze-tab ${tab === 'upload' ? 'analyze-tab--active' : ''}`}
            onClick={() => switchTab('upload')}
          >
            📁 Upload Image
          </button>
          <button
            className={`analyze-tab ${tab === 'camera' ? 'analyze-tab--active' : ''}`}
            onClick={() => switchTab('camera')}
          >
            📷 Use Camera
          </button>
        </div>

        {/* Upload tab */}
        {tab === 'upload' && (
          <div
            className="upload-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="upload-zone__preview">
                <img src={preview} alt="Preview" className="upload-preview-img" />
                <div className="upload-zone__actions">
                  <button className="btn btn-ghost btn-sm" onClick={(e) => {
                    e.stopPropagation()
                    setFile(null); setPreview(null)
                  }}>
                    Remove
                  </button>
                  <span className="upload-zone__filename">{file?.name}</span>
                </div>
              </div>
            ) : (
              <div className="upload-zone__empty">
                <div className="upload-zone__icon">🖼️</div>
                <p className="upload-zone__main">Drop your image here or click to browse</p>
                <p className="upload-zone__sub">JPG, PNG, WEBP — max 5MB</p>
                <button className="btn btn-secondary btn-sm" onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}>
                  Choose File
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Camera tab */}
        {tab === 'camera' && (
          <div className="camera-zone">
            {!cameraActive && !captured && (
              <div className="camera-zone__start">
                <div className="camera-icon">📷</div>
                <p>Click below to open your camera</p>
                <button className="btn btn-primary" onClick={startCamera}>
                  Open Camera
                </button>
              </div>
            )}

            {cameraActive && (
              <div className="camera-zone__live">
                <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                <div className="camera-controls">
                  <button className="btn btn-primary" onClick={capturePhoto}>
                    📸 Capture Photo
                  </button>
                  <button className="btn btn-ghost" onClick={stopCamera}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {captured && preview && (
              <div className="camera-zone__captured">
                <img src={preview} alt="Captured" className="upload-preview-img" />
                <div className="camera-controls">
                  <button className="btn btn-ghost btn-sm" onClick={retake}>
                    🔄 Retake
                  </button>
                  <span className="capture-label">Photo captured ✓</span>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {error && <div className="alert alert--error">{error}</div>}

        <button
          className="btn btn-primary btn-lg btn-full analyze-submit"
          onClick={handleAnalyze}
          disabled={!file || loading}
        >
          Analyze My Skin →
        </button>

        <p className="analyze-privacy">
          🔒 Your image is processed securely and used only for analysis.
        </p>
        <p className="analyze-disclaimer">
          ⚠️ This tool provides educational information only — not a medical diagnosis. Consult a dermatologist for medical concerns.
        </p>
      </div>
    </div>
  )
}
