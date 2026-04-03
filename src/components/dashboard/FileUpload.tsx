'use client'

import { useRef, useState } from 'react'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import { formatBytes } from '@/lib/format'

const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.svg'
const FILE_ACCEPT = '.pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini'

interface UploadedFile {
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

interface FileUploadProps {
  itemType: 'file' | 'image'
  value: UploadedFile | null
  onChange: (file: UploadedFile | null) => void
}

export function FileUpload({ itemType, value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const accept = itemType === 'image' ? IMAGE_ACCEPT : FILE_ACCEPT

  async function uploadFile(file: File) {
    setIsUploading(true)
    setError(null)
    setProgress(10)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setProgress(40)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      setProgress(90)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Upload failed')
        return
      }

      onChange(data as UploadedFile)
      setProgress(100)
    } catch {
      setError('Upload failed')
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return
    uploadFile(files[0])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleRemove() {
    onChange(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (value) {
    const isImage = value.mimeType.startsWith('image/')

    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.fileUrl}
            alt={value.fileName}
            className="max-h-48 w-full rounded object-contain mb-2"
          />
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <FileText className="size-8 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{value.fileName}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(value.fileSize)}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          onClick={handleRemove}
        >
          <X className="size-3.5" />
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50 hover:bg-muted/20'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        {itemType === 'image' ? (
          <ImageIcon className="size-8 text-muted-foreground" />
        ) : (
          <Upload className="size-8 text-muted-foreground" />
        )}

        <div>
          <p className="text-sm font-medium">
            {isUploading ? 'Uploading…' : 'Drop file here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {itemType === 'image'
              ? 'PNG, JPG, GIF, WebP, SVG — max 5 MB'
              : 'PDF, TXT, MD, JSON, YAML, XML, CSV, TOML — max 10 MB'}
          </p>
        </div>

        {isUploading && (
          <div className="w-full max-w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
