# Homepage

## Overview

Convert the `prototypes/homepage/` mockup into the real Next.js marketing homepage at the root `/` route (public, outside the `(app)` group). Replaces any existing root redirect.

## Route & File Structure

```
src/app/
  page.tsx                          ← server root, composes all sections
  layout.tsx                        ← minimal layout (no sidebar/topbar)
  (homepage)/
    components/
      Navbar.tsx                    ← server shell
      NavbarClient.tsx              ← 'use client': scroll opacity + mobile menu toggle
      HeroSection.tsx               ← server shell
      ChaosAnimation.tsx            ← 'use client': rAF bouncing icons
      DashboardMockup.tsx           ← server: static mini-dashboard preview
      FeaturesSection.tsx           ← server: features grid
      AiSection.tsx                 ← server: AI checklist + code editor mockup
      PricingSection.tsx            ← server shell
      PricingToggle.tsx             ← 'use client': monthly/yearly state
      CtaSection.tsx                ← server
      Footer.tsx                    ← server
```

## Sections

### Navbar
- Logo (⬡ DevStash), nav links (Features → `#features`, Pricing → `#pricing`)
- Actions: **Sign In** → `/sign-in`, **Get Started** → `/register`
- Hamburger menu on mobile (client-side toggle)
- Background transitions from transparent to semi-opaque on scroll (client-side scroll listener)

### Hero
- Headline + sub-copy (server)
- CTAs: **Get Started Free** → `/register`, **See Features** → `#features`
- Visual: two boxes side-by-side
  - Left: `ChaosAnimation` — 8 SVG icons (Notion, GitHub, Slack, VS Code, Monitor, Terminal, File, Bookmark) bouncing with mouse-repel physics using `requestAnimationFrame`
  - Arrow between them (static SVG)
  - Right: `DashboardMockup` — static mini sidebar + 6 item cards (server)
- On mobile: boxes stack vertically, arrow rotates 90°

### Features Grid
- 6 cards: Code Snippets, AI Prompts, Terminal Commands, Notes & Docs, Instant Search, Collections
- Each card: colored icon circle, title, description
- Use accent colors matching item type system (blue, amber, cyan, green, indigo, slate)
- Static server component, no interaction needed

### AI Section (Pro)
- Left: "Pro Feature" badge, heading, checklist (Auto-Tag, AI Summary, Explain Code, Prompt Optimizer)
- Right: static code editor mockup (window dots, syntax-highlighted lines, AI tags bar)
- Side-by-side on desktop, stacked on mobile

### Pricing
- `PricingSection` renders the two cards; `PricingToggle` is a client island for monthly/yearly switch
- Monthly: Pro = $8/mo. Yearly: Pro = $6/mo (billed $72/yr)
- Free card CTA → `/register`, Pro card CTA → `/register`
- Featured/highlighted styling on Pro card ("Most Popular" badge)

### CTA Section
- Simple centered block: heading, sub-copy, **Get Started Free** → `/register`

### Footer
- Logo + tagline
- Three columns: Product (Features `#features`, Pricing `#pricing`, Changelog `#`), Resources (Docs `#`, Blog `#`, Status `#`), Company (About `#`, Privacy `#`, Terms `#`)
- Copyright year (client component or `new Date().getFullYear()` in server)

## Implementation Notes

- Use shadcn `Button` for CTAs; use `asChild` with Next.js `Link` where appropriate
- Scroll animations: `IntersectionObserver` in a `ScrollFadeIn` wrapper client component, or CSS `@keyframes` with `animation-play-state` toggled via a data attribute — pick whichever is simpler
- `ChaosAnimation` initializes on mount; re-init particles on `ResizeObserver`; cancel `rAF` on unmount
- No auth checks needed — this is a fully public page
- Keep the homepage layout (`layout.tsx`) separate from the `(app)` layout so the sidebar/topbar do not render
- Dark background to match the rest of the app (`bg-background`)
