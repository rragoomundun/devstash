import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  basePath: string
}

export function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const href = (p: number) => `${basePath}?page=${p}`
  const pages = getPageNumbers(page, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      {page === 1 ? (
        <span className={itemClass(false, true)}>
          <ChevronLeft className="size-4" />
        </span>
      ) : (
        <Link href={href(page - 1)} className={itemClass(false, false)}>
          <ChevronLeft className="size-4" />
        </Link>
      )}

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="flex size-8 items-center justify-center text-sm text-muted-foreground">
            …
          </span>
        ) : p === page ? (
          <span key={p} className={itemClass(true, false)}>{p}</span>
        ) : (
          <Link key={p} href={href(p)} className={itemClass(false, false)}>{p}</Link>
        )
      )}

      {page === totalPages ? (
        <span className={itemClass(false, true)}>
          <ChevronRight className="size-4" />
        </span>
      ) : (
        <Link href={href(page + 1)} className={itemClass(false, false)}>
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

function itemClass(active: boolean, disabled: boolean) {
  return cn(
    'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
    active && 'bg-primary text-primary-foreground',
    disabled && 'cursor-not-allowed text-muted-foreground/40',
    !active && !disabled && 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const visible = new Set<number>([1, total])
  for (let p = Math.max(1, current - 1); p <= Math.min(total, current + 1); p++) {
    visible.add(p)
  }
  const sorted = [...visible].sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i])
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      result.push('ellipsis')
    }
  }
  return result
}
