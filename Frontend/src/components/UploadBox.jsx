import { useState, useRef, useCallback } from 'react'

export default function UploadBox({ onFileSelect }) {
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileSelect(file)
  }, [onFileSelect])

  const handleChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleRemove = () => {
    setPreview(null)
    onFileSelect(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      className={`upload-zone${dragging ? ' upload-zone--active' : ''}${preview ? ' upload-zone--filled' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !preview && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {preview ? (
        <div className="upload-zone__preview">
          <img src={preview} alt="Preview" className="upload-zone__img" />
          <button
            className="upload-zone__remove"
            onClick={(e) => { e.stopPropagation(); handleRemove() }}
          >
            ✕ Remove
          </button>
        </div>
      ) : (
        <div className="upload-zone__prompt">
          <div className="upload-zone__icon">📷</div>
          <p className="upload-zone__text">
            Drag &amp; drop your photo here
          </p>
          <p className="upload-zone__sub">or click to browse</p>
          <p className="upload-zone__hint">JPG, PNG, WEBP · Max 5MB</p>
        </div>
      )}
    </div>
  )
}
