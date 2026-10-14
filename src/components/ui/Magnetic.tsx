import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../../animations/gsap'

type Props = {
  children: ReactNode
  href: string
  className?: string
  strength?: number
  external?: boolean
}

/**
 * Magnetic wrapper — the element drifts toward the cursor while the label
 * drifts less, so the surface separates from its text on approach.
 * Uses quickTo so every mousemove is a transform write, never a re-render.
 */
export default function Magnetic({
  children,
  href,
  className = '',
  strength = 0.35,
  external = false,
}: Props) {
  const zoneRef = useRef<HTMLAnchorElement>(null)
  const btnRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const zone = zoneRef.current
    const btn = btnRef.current
    const label = labelRef.current
    if (!zone || !btn || !label) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const ctx = gsap.context(() => {
      const x = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' })
      const y = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' })
      const lx = gsap.quickTo(label, 'x', { duration: 0.7, ease: 'power3.out' })
      const ly = gsap.quickTo(label, 'y', { duration: 0.7, ease: 'power3.out' })

      const onMove = (e: PointerEvent) => {
        const r = zone.getBoundingClientRect()
        const dx = gsap.utils.mapRange(r.left, r.right, -r.width / 2, r.width / 2, e.clientX)
        const dy = gsap.utils.mapRange(r.top, r.bottom, -r.height / 2, r.height / 2, e.clientY)
        x(dx * strength)
        y(dy * strength)
        lx(dx * strength * 0.3)
        ly(dy * strength * 0.3)
      }

      const onLeave = () => {
        gsap.to([btn, label], { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
      }

      zone.addEventListener('pointermove', onMove)
      zone.addEventListener('pointerleave', onLeave)
      return () => {
        zone.removeEventListener('pointermove', onMove)
        zone.removeEventListener('pointerleave', onLeave)
      }
    }, zone)

    return () => ctx.revert()
  }, [strength])

  return (
    <a
      ref={zoneRef}
      href={href}
      className="relative inline-block p-5 -m-5"
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <div ref={btnRef} className={className}>
        <span ref={labelRef} className="pointer-events-none inline-flex items-center gap-2">
          {children}
        </span>
      </div>
    </a>
  )
}