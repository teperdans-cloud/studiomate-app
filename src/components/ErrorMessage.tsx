interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({ 
  title = "Something went wrong", 
  message, 
  onRetry, 
  className = "" 
}: ErrorMessageProps) {
  return (
    <div className={`bg-accent-50 border border-accent-200 rounded-organic p-4 shadow-warm-sm ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-accent-800 font-source-sans">{title}</h3>
          <p className="mt-1 text-sm text-accent-700 font-source-sans">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm bg-accent-100 text-accent-800 px-3 py-1 rounded-organic hover:bg-accent-200 transition-colors duration-300 font-source-sans"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}