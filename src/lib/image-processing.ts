import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

export interface ImageSizes {
  thumbnail: { width: number; height: number }
  medium: { width: number; height: number }
  large: { width: number; height: number }
}

export const DEFAULT_IMAGE_SIZES: ImageSizes = {
  thumbnail: { width: 200, height: 200 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 }
}

export interface ProcessedImage {
  thumbnailUrl: string
  mediumUrl: string
  largeUrl: string
  originalUrl: string
  fileSize: number
  mimeType: string
}

export async function processImageUploads(
  files: File[],
  uploadsDir: string = 'public/uploads/artworks'
): Promise<ProcessedImage[]> {
  // Ensure uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true })
  
  const processedImages: ProcessedImage[] = []
  
  for (const file of files) {
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const baseName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const ext = path.extname(baseName).toLowerCase()
    const nameWithoutExt = baseName.replace(ext, '')
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`)
    }
    
    // Process original image
    const originalPath = path.join(uploadsDir, baseName)
    await fs.writeFile(originalPath, fileBuffer)
    
    // Generate different sizes
    const thumbnailPath = path.join(uploadsDir, `${nameWithoutExt}-thumb${ext}`)
    const mediumPath = path.join(uploadsDir, `${nameWithoutExt}-medium${ext}`)
    const largePath = path.join(uploadsDir, `${nameWithoutExt}-large${ext}`)
    
    await sharp(fileBuffer)
      .resize(DEFAULT_IMAGE_SIZES.thumbnail.width, DEFAULT_IMAGE_SIZES.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath)
    
    await sharp(fileBuffer)
      .resize(DEFAULT_IMAGE_SIZES.medium.width, DEFAULT_IMAGE_SIZES.medium.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath)
    
    await sharp(fileBuffer)
      .resize(DEFAULT_IMAGE_SIZES.large.width, DEFAULT_IMAGE_SIZES.large.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 90 })
      .toFile(largePath)
    
    processedImages.push({
      originalUrl: `/uploads/artworks/${baseName}`,
      thumbnailUrl: `/uploads/artworks/${nameWithoutExt}-thumb${ext}`,
      mediumUrl: `/uploads/artworks/${nameWithoutExt}-medium${ext}`,
      largeUrl: `/uploads/artworks/${nameWithoutExt}-large${ext}`,
      fileSize: fileBuffer.length,
      mimeType: file.type
    })
  }
  
  return processedImages
}

export async function deleteImageFiles(imageUrls: string[]): Promise<void> {
  for (const url of imageUrls) {
    try {
      const filePath = path.join(process.cwd(), 'public', url)
      await fs.unlink(filePath)
    } catch (error) {
      console.warn(`Failed to delete image file: ${url}`, error)
    }
  }
}

export function validateImageFile(file: File): void {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size too large: ${file.size} bytes. Maximum allowed: ${MAX_FILE_SIZE} bytes`)
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`)
  }
}