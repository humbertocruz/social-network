// src/app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { verifyAuth } from '@/lib/auth'
import { 
  ROLES, 
  UPLOAD_LIMITS, 
  ERRORS, 
  ROLE_FEATURES 
} from '@/lib/constants'

export async function POST(req: Request) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: ERRORS.AUTH.UNAUTHORIZED }, 
        { status: 401 }
      )
    }

    const user = await verifyAuth(token)

    // Check if user can upload images based on role
    if (!ROLE_FEATURES[user.role].canUploadImages) {
      return NextResponse.json(
        { error: 'Your account type does not support file uploads' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'image' or 'video'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (type === 'image' && !UPLOAD_LIMITS.ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: ERRORS.UPLOAD.INVALID_TYPE },
        { status: 400 }
      )
    }

    if (type === 'video' && !UPLOAD_LIMITS.ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: ERRORS.UPLOAD.INVALID_TYPE },
        { status: 400 }
      )
    }

    // Validate file size
    const sizeLimit = type === 'image' 
      ? UPLOAD_LIMITS.IMAGE_SIZE 
      : UPLOAD_LIMITS.VIDEO_SIZE

    if (file.size > sizeLimit) {
      return NextResponse.json(
        { error: ERRORS.UPLOAD.FILE_TOO_LARGE },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${user.id}-${timestamp}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true
    })

    // Save to database
    await prisma.gallery.create({
      data: {
        type,
        url: blob.url,
        userId: user.id
      }
    })

    return NextResponse.json({
      url: blob.url,
      type,
      size: file.size
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// Helper function to handle chunked uploads for larger files
async function handleChunkedUpload(req: Request) {
  const formData = await req.formData()
  const chunkNumber = parseInt(formData.get('chunkNumber') as string)
  const totalChunks = parseInt(formData.get('totalChunks') as string)
  const fileId = formData.get('fileId') as string
  const chunk = formData.get('chunk') as File

  // Here you would:
  // 1. Save the chunk temporarily
  // 2. Check if all chunks are received
  // 3. Combine chunks if complete
  // 4. Upload the complete file
  // 5. Clean up temporary chunks

  // This is a placeholder for the actual implementation
  return NextResponse.json({
    success: true,
    chunkReceived: chunkNumber,
    complete: chunkNumber === totalChunks
  })
}

// Helper to validate upload permissions
function validateUploadPermissions(userRole: string) {
  return ROLE_FEATURES[userRole].canUploadImages
}

// Helper to validate file type
function validateFileType(fileType: string, uploadType: 'image' | 'video') {
  const acceptedTypes = uploadType === 'image' 
    ? UPLOAD_LIMITS.ACCEPTED_IMAGE_TYPES 
    : UPLOAD_LIMITS.ACCEPTED_VIDEO_TYPES

  return acceptedTypes.includes(fileType)
}

// API route configuration
export const config = {
  api: {
    bodyParser: false,
  },
}
