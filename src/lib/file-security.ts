// File security utilities for safe file uploads

export interface FileValidationOptions {
  maxSize: number
  allowedTypes: string[]
  allowedExtensions: string[]
  maxFiles?: number
}

export const PDF_VALIDATION: FileValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf'],
  allowedExtensions: ['.pdf'],
  maxFiles: 1
}

export class FileSecurityError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'FileSecurityError'
  }
}

export function validateFileType(file: File, options: FileValidationOptions): void {
  // Check MIME type
  if (!options.allowedTypes.includes(file.type)) {
    throw new FileSecurityError(
      `Invalid file type: ${file.type}. Allowed: ${options.allowedTypes.join(', ')}`,
      'INVALID_TYPE'
    )
  }
  
  // Check file size
  if (file.size > options.maxSize) {
    throw new FileSecurityError(
      `File too large: ${file.size} bytes. Maximum: ${options.maxSize} bytes`,
      'FILE_TOO_LARGE'
    )
  }
  
  // Check for empty files
  if (file.size === 0) {
    throw new FileSecurityError('Empty files are not allowed', 'EMPTY_FILE')
  }
}

export function sanitizeAndValidateFileName(fileName: string): string {
  // Remove dangerous characters and patterns
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.\./g, '')
  
  if (!sanitized || sanitized.length === 0) {
    throw new FileSecurityError('Invalid filename', 'INVALID_FILENAME')
  }
  
  if (sanitized.length > 255) {
    throw new FileSecurityError('Filename too long', 'FILENAME_TOO_LONG')
  }
  
  return sanitized
}

export async function validateFileUploadRequest(
  request: Request,
  options: FileValidationOptions
): Promise<void> {
  // Check content length
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > options.maxSize * (options.maxFiles || 1)) {
    throw new FileSecurityError('Request too large', 'REQUEST_TOO_LARGE')
  }
}

export function validateFileContents(buffer: Buffer, expectedType: string): void {
  switch (expectedType) {
    case 'application/pdf':
      if (!buffer.subarray(0, 5).toString().startsWith('%PDF')) {
        throw new FileSecurityError('Invalid PDF file signature', 'INVALID_SIGNATURE')
      }
      break
  }
  
  // Check for embedded scripts in the first 1KB
  const headerText = buffer.subarray(0, 1024).toString('ascii').toLowerCase()
  const dangerousPatterns = [
    '<script',
    'javascript:',
    'vbscript:',
    'onload=',
    'onerror=',
    '<?php',
    '<%',
    'eval('
  ]
  
  for (const pattern of dangerousPatterns) {
    if (headerText.includes(pattern)) {
      throw new FileSecurityError('Potentially malicious content detected', 'MALICIOUS_CONTENT')
    }
  }
}