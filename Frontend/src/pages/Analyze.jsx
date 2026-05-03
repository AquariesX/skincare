import { useState, useRef, useCallback, useEffect } from 'react'
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
  const [cameraError, setCameraError] = useState('')

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  // ── Attach camera stream after video element is rendered ──────
  // The video element only exists in the DOM when cameraActive=true.
  // We must wait for React to re-render before setting srcObject.
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current
      video.srcObject = streamRef.current
      video.play().catch((err) => {
        console.warn('Video play error:', err)
      })
    }
  }, [cameraActive])

  // ── Cleanup stream on unmount ─────────────────────────────────
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

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
    setCameraError('')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Your browser does not support camera access. Please use Chrome or Firefox.')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })
      streamRef.current = stream
      // Set cameraActive AFTER storing stream — useEffect attaches srcObject
      setCameraActive(true)
      setCaptured(false)
      setFile(null)
      setPreview(null)
    } catch (err) {
      console.error('Camera error:', err.name, err.message)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission denied. Please click the camera icon in your browser address bar and allow access, then try again.'
        )
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.')
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application. Please close it and try again.')
      } else {
        setCameraError(`Camera error: ${err.message || 'Unknown error'}`)
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera is not ready yet. Wait a moment and try again.')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) { setError('Failed to capture photo. Please try again.'); return }
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
    setCameraError('')
    startCamera()
  }

  const switchTab = (t) => {
    if (cameraActive) stopCamera()
    setTab(t)
    setFile(null)
    setPreview(null)
    setCaptured(false)
    setError('')
    setCameraError('')
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
      const msg = err.response?.data?.error || 'Analysis failed. Please try again.'
      setError(msg)
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
                {cameraError ? (
                  <div className="camera-error-box">
                    <span className="camera-error-icon">⚠️</span>
                    <p>{cameraError}</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={startCamera}>
                      Try Again
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={startCamera}>
                    Open Camera
                  </button>
                )}
              </div>
            )}

            {/* Video element — always rendered when cameraActive, srcObject set by useEffect */}
            {cameraActive && (
              <div className="camera-zone__live">
                <video
                  ref={videoRef}
                  className="camera-video"
                  autoPlay
                  playsInline
                  muted
                />
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
                  <span className="capture-label">✓ Photo captured</span>
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
