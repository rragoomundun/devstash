import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChaosAnimation } from './ChaosAnimation'
import { DashboardMockup } from './DashboardMockup'
import { ScrollFadeIn } from './ScrollFadeIn'

export function HeroSection() {
  return (
    <section className="pt-35 pb-25 px-6 max-w-6xl mx-auto flex flex-col gap-18 items-center">
      <ScrollFadeIn className="text-center max-w-170">
        <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-5">
          Stop Losing Your{' '}
          <br />
          <span className="bg-linear-to-br from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
            Developer Knowledge
          </span>
        </h1>
        <p className="text-lg text-zinc-400 leading-[1.7] mb-9">
          Your snippets, prompts, commands, and notes are scattered across Notion, GitHub, Gists,
          bookmarks, and chat histories. DevStash brings them all into one fast, searchable hub.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" render={<Link href="/register" />}>
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" render={<a href="#features" />}>
            See Features
          </Button>
        </div>
      </ScrollFadeIn>

      <ScrollFadeIn className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-5">
        {/* Chaos box */}
        <div className="bg-zinc-900 border border-white/8 rounded-xl overflow-hidden h-70">
          <div className="text-[11px] font-medium tracking-[0.06em] uppercase text-zinc-600 px-3.5 py-2.5 border-b border-white/8">
            Your knowledge today...
          </div>
          <div className="h-[calc(100%-36px)]">
            <ChaosAnimation />
          </div>
        </div>

        {/* Arrow */}
        <div className="text-indigo-500 w-15 shrink-0 mx-auto md:mx-0 rotate-90 md:rotate-0 animate-[pulse-arrow_2s_ease-in-out_infinite]">
          <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 12 H48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M40 4 L52 12 L40 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Dashboard mockup */}
        <div className="bg-zinc-900 border border-white/8 rounded-xl overflow-hidden h-70">
          <div className="text-[11px] font-medium tracking-[0.06em] uppercase text-zinc-600 px-3.5 py-2.5 border-b border-white/8">
            ...with DevStash
          </div>
          <div className="h-[calc(100%-36px)]">
            <DashboardMockup />
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  )
}
