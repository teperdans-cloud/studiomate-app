import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { validateFileUploadRequest, validateFileType, validateFileContents, sanitizeAndValidateFileName, PDF_VALIDATION, FileSecurityError } from '@/lib/file-security'
import { parseCV } from '@/lib/cv-parser'

export async function POST(request: NextRequest) {
  try {
    // Validate upload request and apply rate limiting
    await validateFileUploadRequest(request, PDF_VALIDATION)
    
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('cv') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Enhanced file validation
    validateFileType(file, PDF_VALIDATION)
    sanitizeAndValidateFileName(file.name)
    
    // Validate file contents
    const cvBuffer = Buffer.from(await file.arrayBuffer())
    validateFileContents(cvBuffer, file.type)

    try {
      // Parse the CV using enhanced parser
      const parsedData = await parseCV(cvBuffer)

      return NextResponse.json({
        message: 'CV parsed successfully',
        parsedData,
        suggestions: {
          bio: parsedData.bio,
          skills: parsedData.skills,
          experience: parsedData.experience,
          education: parsedData.education,
          awards: parsedData.awards
        }
      })

    } catch (parseError) {
      console.error('CV parsing error:', parseError)
      return NextResponse.json({ 
        error: 'Failed to parse CV. Please ensure it\'s a valid PDF with readable text.' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('CV parse endpoint error:', error)
    
    if (error instanceof FileSecurityError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}