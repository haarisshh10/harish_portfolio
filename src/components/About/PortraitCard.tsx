import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'

type Props = {
  src: string
  alt: string
}

/**
 * Interactive portrait — a duotone card that tracks the cursor.
 *
 * Two ideas working together:
 *   1. The photo sits at low saturation; an accent-coloured radial spotlight
 *      follows the cursor across it, so the image resolves into colour where you
 *      are looking. That makes the portrait a live surface rather than a picture
 *      stuck in a corner.
 *   2. The card turns slightly in 3D toward the cursor, giving it depth without
 *      a canvas or WebGL.
 *
 * Everything is written straight to style via quickTo, so pointermove never
 * triggers a React render. Under reduced motion the spotlight is pinned to the
 * centre and the card stays flat — the accent wash still reads, it just doesn't
 * follow anything.
 */
export default function PortraitCard({ src, alt }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const glow = glowRef.current
    const tilt = tiltRef.current
    if (!card || !glow || !tilt) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(glow, { opacity: 0.5 })
        gsap.set(tilt, { rotateX: 0, rotateY: 0, scale: 1 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const setGX = gsap.quickSetter(glow, 'x', 'px')
        const setGY = gsap.quickSetter(glow, 'y', 'px')
        const setGlow = gsap.quickSetter(glow, 'opacity')
        const setRX = gsap.quickSetter(tilt, 'rotateX', 'deg')
        const setRY = gsap.quickSetter(tilt, 'rotateY', 'deg')
        const setS = gsap.quickSetter(tilt, 'scale')

        let rect = card.getBoundingClientRect()
        let halfW = glow.offsetWidth / 2
        let halfH = glow.offsetHeight / 2

        const measure = () => {
          rect = card.getBoundingClientRect()
          halfW = glow.offsetWidth / 2
          halfH = glow.offsetHeight / 2
        }

        // The card is measured in viewport space, but About mounts below the
        // fold — so a rect captured once at mount goes stale the moment the page
        // scrolls and the spotlight can never detect the cursor being "inside".
        // Re-measure on scroll/resize (cheap, single rect read) and keep the
        // cached values so pointermove itself never forces a layout.
        const onScrollOrResize = () => measure()
        measure()

        const onMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch') return
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height

          // Spotlight tracks the cursor even outside the card, so the glow eases
          // in and out rather than popping at the edges.
          setGX(x - halfW)
          setGY(y - halfH)
          setGlow(inside ? 0.62 : 0.18)

          // Tilt follows proportionally, capped so it never looks broken.
          const nx = Math.max(-1, Math.min(1, x / rect.width - 0.5))
          const ny = Math.max(-1, Math.min(1, y / rect.height - 0.5))
          setRY(nx * 12)
          setRX(-ny * 10)
          setS(1.04)
        }

        const onLeave = () => {
          setGlow(0.18)
          setRX(0)
          setRY(0)
          setS(1)
        }

        window.addEventListener('pointermove', onMove, { passive: true })
        window.addEventListener('pointerleave', onLeave)
        document.addEventListener('pointerleave', onLeave)
        window.addEventListener('scroll', onScrollOrResize, { passive: true })
        window.addEventListener('resize', onScrollOrResize, { passive: true })
        const ro = new ResizeObserver(measure)
        ro.observe(card)

        // Slow idle breath so the card is never completely dead.
        const breathe = gsap.to(tilt, {
          scale: 1.015,
          duration: 4.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })

        return () => {
          breathe.kill()
          ro.disconnect()
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerleave', onLeave)
          document.removeEventListener('pointerleave', onLeave)
          window.removeEventListener('scroll', onScrollOrResize)
          window.removeEventListener('resize', onScrollOrResize)
        }
      })
    }, card)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={cardRef} className="relative w-44 shrink-0 sm:w-60 [perspective:1200px]">
      <div
        ref={tiltRef}
        className="relative overflow-hidden rounded-2xl border border-border-strong will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <img
          src={src}
          alt={alt}
          width={240}
          height={320}
          className="aspect-[3/4] w-full object-cover saturate-[0.75] transition-[filter] duration-500 hover:saturate-100"
          loading="lazy"
          decoding="async"
        />

        {/* Cursor-tracked accent spotlight. Pointer-events none so it never
            blocks the photo or any links. */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute h-[190px] w-[190px] rounded-full opacity-[0.18] blur-2xl will-change-transform"
          style={{
            background:
              'radial-gradient(closest-side, rgba(124,92,255,0.75), rgba(34,211,238,0.35) 55%, transparent 78%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Very light accent tint so the card reads as part of the palette when
            idle — kept low because the source photo is already bright, and a
            stronger wash flattens it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-accent-2/8"
        />

        {/* Edge light. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent via-accent-3 to-accent-2"
        />
      </div>
    </div>
  )
}
