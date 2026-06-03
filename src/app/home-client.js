'use client'

import { useState, useEffect, useRef } from 'react'

/* ─── Animated Counter ─── */
export function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─── Scroll-reveal wrapper ─── */
export function ScrollReveal({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

/* ─── Logo Wall ─── */
const logoWallBrands = [
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'Vercel', slug: 'vercel' },
  { name: 'OpenAI', slug: 'openai' },
  { name: 'Google', slug: 'google' },
  { name: 'GitHub', slug: 'github' },
  { name: 'Resend', slug: 'resend' },
]

export function LogoWall() {
  return (
    <section className="py-12 border-y border-zinc-800 overflow-hidden bg-zinc-950">
      <div className="relative">
        <div className="flex gap-16 animate-scroll" style={{ width: `${logoWallBrands.length * 2 * 160}px` }}>
          {[...logoWallBrands, ...logoWallBrands].map((brand, i) => (
            <div key={i} className="flex items-center justify-center min-w-[120px]">
              <img
                src={`https://cdn.simpleicons.org/${brand.slug}/888888`}
                alt={brand.name}
                className="h-8 w-auto opacity-50 hover:opacity-80 transition-opacity duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
