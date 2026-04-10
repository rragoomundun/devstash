import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { uploadToR2 } from '@/lib/r2'
import { randomUUID } from 'crypto'

const IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
])

const FILE_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'application/xml',
  'text/xml',
  'text/csv',
  'application/toml',
])

const IMAGE_MAX_BYTES = 5 * 1024 * 1024   // 5 MB
const FILE_MAX_BYTES = 10 * 1024 * 1024   // 10 MB

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  })
  if (!user?.isPro) {
    return NextResponse.json(
      { error: 'File uploads require a Pro subscription.' },
      { status: 403 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const mimeType = file.type
  const isImage = IMAGE_MIME_TYPES.has(mimeType)
  const isFile = FILE_MIME_TYPES.has(mimeType)

  if (!isImage && !isFile) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const maxBytes = isImage ? IMAGE_MAX_BYTES : FILE_MAX_BYTES
  if (file.size > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024)
    return NextResponse.json(
      { error: `File too large. Max ${maxMb} MB for this type.` },
      { status: 400 }
    )
  }

  const ext = file.name.split('.').pop() ?? ''
  const key = `${session.user.id}/${randomUUID()}${ext ? `.${ext}` : ''}`
  const buffer = Buffer.from(await file.arrayBuffer())

  let fileUrl: string
  try {
    fileUrl = await uploadToR2(key, buffer, mimeType)
  } catch (err) {
    console.error('[upload] R2 error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  return NextResponse.json({
    fileUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
  })
}
