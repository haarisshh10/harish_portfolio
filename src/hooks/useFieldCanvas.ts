import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'

/**
 * Per-section particle field engine.
 *
 * One place for the plumbing every hero/contact field needs: DPR-correct canvas
 * sizing, window-level pointer tracking with a rolling path, IntersectionObserver
 * gating, the shared GSAP ticker, and the prefers-reduced-motion branch. Fields
 * supply only their particle model.
 *
 * Sharing this is what keeps two live fields on the page cheap. The previous
 * arrangement bound `window.pointermove` and a ticker callback per instance, so
 * every additional field duplicated page-wide per-mouse-move work.
 */

export type Density = 'low' | 'med' | 'high'

/**
 * Hero runs `low` — it sits behind 11rem type, and a field that reads well on a
 * full-bleed contact section overwhelms a headline. Contact runs `med`.
 */
export const DENSITY: Record<Density, { desktop: number; mobile: number }> = {
  low: { desktop: 40, mobile: 22 },
  med: { desktop: 70, mobile: 36 },
  high: { desktop: 110, mobile: 52 },
}

export function densityCount(density: Density, width: number) {
  return width < 640 ? DENSITY[density].mobile : DENSITY[density].desktop
}

/** Rolling pointer history. Long enough to draw a comet, short enough to be free. */
const PATH_MAX = 28

/** A backgrounded tab can hand us a multi-second gap; clamping stops every
 *  particle from teleporting on the first tick after it. */
const MAX_DT = 1 / 30

export type Pointer = {
  x: number
  y: number
  /** Recent positions, oldest first. Only appended while the pointer actually moves. */
  path: { x: number; y: number }[]
  /** px per 60fps frame, smoothed and time-normalised. Decays toward zero on
   *  its own — see `decayInput` in the ticker. */
  speed: number
  vx: number
  vy: number
  inside: boolean
}

export type Frame = {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
  /** Seconds since the previous frame, clamped to MAX_DT. */
  dt: number
  time: number
  pointer: Pointer
}

export type FieldModel = {
  /** (Re)build particle state for a canvas size. */
  resize(w: number, h: number): void
  /** One animation frame. */
  frame(f: Frame): void
  /** One static frame for prefers-reduced-motion. */
  settle(f: Frame): void
}

export type FieldModelFactory = (density: Density) => FieldModel

export function useFieldCanvas(density: Density, create: FieldModelFactory) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Held in a ref rather than a dependency: every render builds a new factory
  // closure, and re-running the effect would tear down the canvas each time.
  const createRef = useRef(create)
  createRef.current = create

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const model = createRef.current(density)
    const pointer: Pointer = {
      x: -9999,
      y: -9999,
      path: [],
      speed: 0,
      vx: 0,
      vy: 0,
      inside: false,
    }

    let w = 0
    let h = 0
    let time = 0
    let prev = 0
    let lastMoveAt = 0
    let visible = true
    let staticMode = false

    const frame = (dt: number): Frame => ({ ctx, w, h, dt, time, pointer })

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      model.resize(w, h)
      // Assigning canvas.width above wipes the bitmap, so a static frame has to be
      // redrawn here — the observer fires long after the reduced-motion branch ran.
      if (staticMode) model.settle(frame(0))
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const last = pointer.path[pointer.path.length - 1]

      const now = performance.now()
      // Normalise to pixels per 60fps frame. Pointer events arrive at whatever
      // rate the device feels like, so a raw per-event delta would make the
      // same physical gesture read as fast on a 144Hz display and slow on a
      // 30Hz one — and every field below gates its behaviour on this number.
      const gap = lastMoveAt ? Math.max((now - lastMoveAt) / 1000, 1 / 240) : 1 / 60
      lastMoveAt = now

      if (last) {
        const d = Math.hypot(x - last.x, y - last.y)
        // Sub-2px jitter is the pointer sitting still. Recording it would keep
        // appending duplicate path points and slowly stretch the comet's tail.
        if (d < 2) return
        const perFrame = (d / gap) * (1 / 60)
        pointer.vx = ((x - last.x) / gap) * (1 / 60)
        pointer.vy = ((y - last.y) / gap) * (1 / 60)
        pointer.speed += (perFrame - pointer.speed) * 0.3
      }

      pointer.x = x
      pointer.y = y
      pointer.path.push({ x, y })
      if (pointer.path.length > PATH_MAX) pointer.path.shift()
      pointer.inside =
        x >= -60 && x <= rect.width + 60 && y >= -60 && y <= rect.height + 60
    }

    const onLeave = () => {
      pointer.inside = false
      pointer.speed = 0
      pointer.vx = 0
      pointer.vy = 0
      pointer.path.length = 0
      lastMoveAt = 0
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { threshold: 0 },
    )
    io.observe(wrap)

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    window.addEventListener('resize', resize)
    // On window rather than the wrap: hero content sits above this layer, so a
    // listener bound to the wrap would miss every pointermove over the headline.
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      staticMode = true
      resize()
      model.settle(frame(0))
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      staticMode = false
      resize()
      const tick = () => {
        const now = performance.now() / 1000
        const dt = prev ? Math.min(now - prev, MAX_DT) : 1 / 60
        prev = now

        // Pointer velocity is measured per event, so a stopped mouse would leave
        // it pinned at its last value and fields gated on speed would emit
        // forever. Decay it on the clock instead of the event.
        const decay = Math.pow(0.02, dt)
        pointer.speed *= decay
        pointer.vx *= decay
        pointer.vy *= decay

        // Decay runs even while hidden, otherwise scrolling back to the hero
        // would resume with stale input.
        if (!visible) return

        time += dt
        model.frame(frame(dt))
      }
      prev = 0
      gsap.ticker.add(tick)
      return () => {
        gsap.ticker.remove(tick)
        prev = 0
      }
    })

    return () => {
      mm.revert()
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [density])

  return { canvasRef, wrapRef }
}