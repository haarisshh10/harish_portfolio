import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { gsap } from '../../animations/gsap'
import { onNoMotionPreference } from '../../animations/motion'
import { site } from '../../config/site'
import Magnetic from '../ui/Magnetic'
import FlowField from './fields/FlowField'
import { HERO_DENSITY } from './fields/shared'

const GLYPHS = 'HARISH'.split('')

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)

  // Pointer over the name lights each glyph by proximity. Written straight to
  // the style property so moving the mouse never triggers a React render.
  //
  // Deliberately not gated on `(pointer: fine)` — that query is wrong in some
  // hybrid/embedded setups, and silently disabling the hero's one interaction
  // is worse than the handful of wasted listeners on touch devices. Touch
  // simply never emits the hover this needs.
  useEffect(() => {
    const name = nameRef.current
    if (!name) return

    const glyphs = Array.from(
      name.querySelectorAll<HTMLElement>('.hero-glyph'),
    )
    if (!glyphs.length) return

    let centres: { x: number; y: number }[] = []

    const measure = () => {
      centres = glyphs.map((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      })
    }

    measure()

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return

      for (let i = 0; i < glyphs.length; i++) {
        const c = centres[i]
        if (!c) continue
        const d = Math.hypot(e.clientX - c.x, e.clientY - c.y)
        const g = Math.max(0, 1 - d / 190)
        glyphs[i].style.setProperty('--g', g.toFixed(3))
      }
    }

    const onLeave = () => {
      for (const el of glyphs) el.style.setProperty('--g', '0')
    }

    const ro = new ResizeObserver(measure)
    ro.observe(name)

    name.addEventListener('pointermove', onMove)
    name.addEventListener('pointerleave', onLeave)
    return () => {
      ro.disconnect()
      name.removeEventListener('pointermove', onMove)
      name.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    return onNoMotionPreference(() =>
      gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

        tl.from('.hero-kicker', { opacity: 0, y: 12, duration: 0.8 })
          .from('.hero-glyph', {
            opacity: 0,
            yPercent: 60,
            duration: 1.4,
            stagger: 0.06,
          })
          .from('.hero-bio', { opacity: 0, y: 18, duration: 0.9 }, 0.5)
          .from('.hero-cta', { opacity: 0, y: 16, duration: 0.8, stagger: 0.07 }, 0.75)
          .from('.hero-meta > *', { opacity: 0, duration: 0.6, stagger: 0.05 }, 0.9)
          .from('.hero-scroll', { opacity: 0, duration: 0.8 }, 1.2)
      }, root),
    )
  }, [])

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-32 text-center sm:px-8"
    >
      {/* Particle layer, mounted above the backdrop and below the scrim. */}
      <FlowField density={HERO_DENSITY} />

      {/* Keeps the backdrop from muddying the type. Sits above the field, which
          is what lets the field stay bright at the edges while the headline
          area is damped down to nothing. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_54%_42%_at_50%_46%,rgba(5,5,6,0.76),transparent_76%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center">
        <div className="hero-kicker mb-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <span className="label-xs text-accent-3">{site.role}</span>
          <span className="h-px w-8 bg-border-strong" />
          <span className="h-px w-8 bg-border-strong" />
          <span className="label-xs text-muted">{site.location}</span>
        </div>

        <h1
          ref={nameRef}
          className="select-none text-[clamp(3.25rem,17vw,11rem)] font-bold leading-[0.9] tracking-[-0.04em]"
        >
          <span className="flex justify-center">
            {GLYPHS.map((glyph, i) => (
              <span key={i} className="hero-glyph inline-block will-change-transform">
                {glyph}
              </span>
            ))}
          </span>
        </h1>

        <p className="hero-bio mt-10 max-w-xl text-balance text-lg leading-relaxed text-muted md:text-xl">
          {site.tagline}
        </p>

        <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Magnetic
            href="#work"
            className="hero-cta label-xs flex w-full items-center justify-center gap-2 rounded-full border border-border-strong bg-white/[0.05] px-7 py-3.5 text-foreground transition-colors hover:bg-white/[0.11] sm:w-auto"
          >
            See the work
            <ArrowDown className="h-3.5 w-3.5" />
          </Magnetic>

          <Magnetic
            href={`mailto:${site.email}`}
            className="hero-cta label-xs flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-void transition-transform hover:scale-[1.03] sm:w-auto"
          >
            {site.email}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Magnetic>
        </div>

        <div className="hero-meta mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[
            { k: 'Building', v: 'RAG · Agents · Tool use' },
            { k: 'Stack', v: 'Angular · Spring Boot · TS' },
            { k: 'Focus', v: 'AI products · DX' },
          ].map((item) => (
            <div key={item.k} className="text-center">
              <div className="label-xs text-faint">{item.k}</div>
              <div className="mt-1.5 font-mono text-[13px] text-foreground">{item.v}</div>
            </div>
          ))}
        </div>

        <div className="hero-scroll mt-14 flex flex-col items-center gap-3">
          <span className="relative h-12 w-px overflow-hidden bg-border">
            <span className="absolute inset-x-0 top-0 h-4 animate-[scrollDot_2.2s_ease-in-out_infinite] bg-accent" />
          </span>
          <span className="label-xs text-faint">Scroll to explore</span>
        </div>
      </div>

      <style>{`@keyframes scrollDot{0%{transform:translateY(-100%)}60%,100%{transform:translateY(260%)}}`}</style>
    </section>
  )
}