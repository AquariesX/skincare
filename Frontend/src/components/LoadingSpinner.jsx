export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-overlay">
      <div className="spinner-box">
        <div className="spinner"></div>
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  )
}
