interface FormSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  error?: string | null
  required?: boolean
  placeholder?: string
  className?: string
  description?: string
}

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
  required,
  placeholder,
  className = '',
  description
}: FormSelectProps) {
  const baseClasses = "form-input"
  const errorClasses = error ? "border-accent focus:border-accent focus:ring-accent/20" : ""

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2 font-source-sans">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500 mb-2 font-source-sans">{description}</p>
      )}
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseClasses} ${errorClasses} cursor-pointer`}
        required={required}
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-accent">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-source-sans">{error}</span>
        </div>
      )}
    </div>
  )
}