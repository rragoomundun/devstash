import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollFadeIn } from './ScrollFadeIn'

export function CtaSection() {
  return (
    <section className="py-25 px-6 text-center">
      <ScrollFadeIn className="max-w-150 mx-auto">
        <h2 className="text-[clamp(24px,4vw,36px)] font-bold tracking-[-0.02em] mb-3">
          Ready to organize your knowledge?
        </h2>
        <p className="text-base text-zinc-400 mb-7">
          Join developers who stopped losing their best work.
        </p>
        <Button size="lg" render={<Link href="/register" />}>
          Get Started Free
        </Button>
      </ScrollFadeIn>
    </section>
  )
}
