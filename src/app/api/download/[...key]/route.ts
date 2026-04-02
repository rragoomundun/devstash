import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { key } = await params
  const objectKey = key.join('/')
  const fileUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${objectKey}`

  let upstream: Response
  try {
    upstream = await fetch(fileUrl)
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
  const contentLength = upstream.headers.get('content-length')

  const headers = new Headers({
    'Content-Type': contentType,
    'Cache-Control': 'private, max-age=3600',
  })
  if (contentLength) headers.set('Content-Length', contentLength)

  return new NextResponse(upstream.body, { headers })
}
