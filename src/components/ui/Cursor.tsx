import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, summary, [data-cursor="interactive"]'

/**
 * Custom pointer: a solid dot inside a ring, both tracking the pointer exactly.
 * The ring swells and inverts over anything clickable.
 *
 * Both layers write the same coordinates. An earlier version eased the ring
 * toward the pointer, which read as input lag rather than as a trailing
 * flourish — the pointer is the one thing on screen that must never feel like
 * it is behind where you already are. Motion now lives only in the hover state.
 *
 * The native cursor is hidden lazily — on the first real pointermove — rather
 * than on a media query. `(pointer: fine)` is unreliable on hybrid touch
 * devices and reports false in some embedded contexts, and hiding the cursor
 * before a replacement is definitely running leaves the page unusable. This way
 * touch keeps its native behaviour and the cursor is only suppressed once we
 * know a mouse exists.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let live = false
    let hot = false

    const setX = gsap.quickSetter(dot, 'x', 'px')
    const setY = gsap.quickSetter(dot, 'y', 'px')
    const setRX = gsap.quickSetter(ring, 'x', 'px')
    const setRY = gsap.quickSetter(ring, 'y', 'px')

    const setHot = (next: boolean) => {
      if (next === hot) return
      hot = next
      gsap.to(ring, {
        scale: next ? 2 : 1,
        borderColor: next ? 'rgba(192,132,252,0.9)' : 'rgba(255,255,255,0.26)',
        backgroundColor: next ? 'rgba(192,132,252,0.10)' : 'rgba(255,255,255,0)',
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      })
      gsap.to(dot, {
        opacity: next ? 0 : 1,
        scale: next ? 0.4 : 1,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return

      if (!live) {
        live = true
        x = e.clientX
        y = e.clientY
        document.documentElement.classList.add('cursor-none')
        gsap.fromTo(
          [dot, ring],
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' },
        )
      }

      x = e.clientX
      y = e.clientY

      const target = e.target as Element | null
      setHot(!!target?.closest?.(INTERACTIVE))
    }

    const onLeave = () => {
      live = false
      gsap.to([dot, ring], { opacity: 0, duration: 0.25, ease: 'power2.out' })
    }

    const tick = () => {
      setX(x)
      setY(y)
      setRX(x)
      setRY(y)
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    gsap.ticker.add(tick)

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.documentElement.classList.remove('cursor-none')
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    // Always in the DOM. Display is NOT gated on a pointer media query — those
    // disagree with reality on hybrid devices, and getting it wrong collapses
    // this layer to zero size so nothing renders at all. Touch safety lives in
    // the handler instead: touch pointer events are ignored, and the native
    // cursor is only hidden once a real mouse has moved.
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-0"
        style={{ borderColor: 'rgba(255,255,255,0.26)', willChange: 'transform' }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground opacity-0"
        style={{ willChange: 'transform' }}
      />
    </div>
  )
}