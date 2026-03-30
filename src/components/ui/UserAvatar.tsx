import Image from 'next/image'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name?: string | null
  image?: string | null
  size?: number
  className?: string
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserAvatar({ name, image, size = 28, className }: UserAvatarProps) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? 'User'}
        width={size}
        height={size}
        className={cn('rounded-full object-cover', className)}
      />
    )
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground select-none shrink-0',
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
