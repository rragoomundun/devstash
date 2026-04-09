'use client'

import { useEffect, useRef } from 'react'

const SVGS = [
  // Notion
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.29 2.29c-.42-.326-.98-.7-2.055-.607L3.01 2.89c-.466.046-.56.28-.374.466l1.823 1.852zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.84c-.56.047-.747.327-.747.98zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.607.327-1.166.514-1.633.514-.746 0-.933-.234-1.493-.933l-4.571-7.182v6.95l1.446.327s0 .84-1.166.84l-3.22.187c-.093-.187 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.453-.233 4.759 7.275V9.2l-1.213-.14c-.093-.513.28-.886.746-.933l3.22-.187z"/></svg>',
  // GitHub
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>',
  // Slack
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z"/></svg>',
  // VS Code
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.583 2.002L7.637 10.596 3.213 7.569l-1.21.752v7.358l1.21.752 4.424-3.027 9.946 8.594L22 19.9V4.1l-4.417-2.098zM7.396 14.358L4.542 12l2.854-2.358v4.716zM17.583 17.1l-7.474-5.1 7.474-5.1v10.2z"/></svg>',
  // Monitor
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  // Terminal
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  // File
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  // Bookmark
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotSpeed: number
  scale: number
  scaleDir: number
}

function initParticles(w: number, h: number): Particle[] {
  return SVGS.map(() => {
    const angle = Math.random() * Math.PI * 2
    return {
      x: Math.random() * (w - 40),
      y: Math.random() * (h - 40),
      vx: 0.6 * Math.cos(angle),
      vy: 0.6 * Math.sin(angle),
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.8,
      scale: 0.9 + 0.2 * Math.random(),
      scaleDir: Math.random() > 0.5 ? 1 : -1,
    }
  })
}

export function ChaosAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create icon elements
    const iconEls = SVGS.map(svg => {
      const el = document.createElement('div')
      el.style.cssText =
        'position:absolute;width:60px;height:60px;color:#8888a4;opacity:0.7;display:flex;align-items:center;justify-content:center;will-change:transform;'
      el.innerHTML = `<span style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;">${svg}</span>`
      container.appendChild(el)
      return el
    })

    let mouse = { x: -9999, y: -9999 }
    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMouseLeave = () => { mouse = { x: -9999, y: -9999 } }
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)

    let particles = initParticles(container.clientWidth, container.clientHeight)
    let rafId = 0

    const tick = () => {
      const W = container.clientWidth
      const H = container.clientHeight

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const el = iconEls[i]

        const dx = p.x + 30 - mouse.x
        const dy = p.y + 30 - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 80 && dist > 0) {
          const force = ((80 - dist) / 80) * 0.5
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        p.vx *= 0.98
        p.vy *= 0.98

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed < 0.3) {
          const a = Math.atan2(p.vy, p.vx)
          p.vx = 0.6 * Math.cos(a) * 0.5
          p.vy = 0.6 * Math.sin(a) * 0.5
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > W - 60) { p.x = W - 60; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > H - 60) { p.y = H - 60; p.vy = -Math.abs(p.vy) }

        p.rotation += p.rotSpeed
        p.scale += 0.001 * p.scaleDir
        if (p.scale > 1.1) p.scaleDir = -1
        if (p.scale < 0.85) p.scaleDir = 1

        el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${p.scale})`
      }

      rafId = requestAnimationFrame(tick)
    }

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId)
      particles = initParticles(container.clientWidth, container.clientHeight)
      rafId = requestAnimationFrame(tick)
    })
    ro.observe(container)
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      iconEls.forEach(el => el.remove())
    }
  }, [])

  return <div ref={containerRef} className="relative w-full h-full overflow-hidden" />
}
