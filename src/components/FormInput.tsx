import { forwardRef } from 'react'

interface FormInputProps {
  label: string
  type?: 'text' | 'email' | 'url' | 'textarea'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string | null
  required?: boolean
  rows?: number
  className?: string
  description?: string
}

const FormInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormInputProps>(
  ({ label, type = 'text', placeholder, value, onChange, error, required, rows, className = '', description }, ref) => {
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
        
        {type === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows || 4}
            className={`${baseClasses} ${errorClasses} resize-none min-h-[100px]`}
            required={required}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseClasses} ${errorClasses}`}
            required={required}
          />
        )}
        
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
)

FormInput.displayName = 'FormInput'

export default FormInput