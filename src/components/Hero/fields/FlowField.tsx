import {
  type Density,
  type FieldModel,
  type Frame,
  useFieldCanvas,
} from '../../../hooks/useFieldCanvas'
import { WHITE, disc, drawSprite, spriteSet } from './shared'

/**
 * Flow field — ribbons of light you can stir with the cursor.
 *
 * Not a scatter of particles: a continuous vector field, and every tracer in it
 * is advected along the field direction. Because each tracer keeps a short
 * position history, it renders as a head-and-tail streak — the bright leading
 * end with a fading tail behind it — and the tails trace the flow lines, so the
 * field's structure reads as moving strokes rather than dots.
 *
 * Each tracer has a depth that scales its size, speed and brightness
 * together, giving the field parallax and dimension rather than a flat sheet,
 * and a hot-spot near the cursor brightens the tracers it passes through.
 *
 * The cursor injects a vortex: inside its radius every tracer's heading is bent
 * by an amount falling off smoothly to zero at the edge, with a slight inward
 * pull, so streamlines curve around the pointer and the field gathers toward it
 * — move the mouse and you stir the medium; let go and it relaxes.
 *
 * Tracers carry a life and respawn, keeping density even and stopping streamlines
 * from collapsing into knots over time.
 *
 * Runs on the shared field engine, so it gets DPR-correct sizing, the GSAP
 * ticker, IntersectionObserver gating and the reduced-motion branch for free.
 */

type P = {
  x: number
  y: number
  /** Ring buffer of recent positions — the tail is drawn from these. */
  tx: Float32Array
  ty: Float32Array
  head: number
  life: number
  maxLife: number
  speed: number
  /** 0 = far, 1 = near. Scales size, brightness and travel rate together. */
  depth: number
}

const INK = '#8f7bff'
const VORTEX_R = 240
/** Recent positions kept per tracer, and how many the tail spans. */
const HIST = 12
const TAIL_POINTS = 7

/**
 * Heading of the flow at a point. A sum of sines is smooth, cheap and
 * divergence-free enough that tracers slide along it instead of piling up.
 */
function flow(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.0042 + t * 0.26) +
    Math.cos(y * 0.0051 - t * 0.19) +
    Math.sin((x + y) * 0.0027 + t * 0.13) +
    Math.cos((x - y) * 0.0035 - t * 0.11)
  ) * 1.5
}

/** Cursor influence: an angular bend (the swirl) plus a slight inward pull. */
function vortex(x: number, y: number, cx: number, cy: number) {
  const d = Math.hypot(x - cx, y - cy)
  if (d > VORTEX_R || d < 1) return { bend: 0, pull: 0 }
  const s = 1 - d / VORTEX_R
  // Squared falloff keeps the exact centre from snapping tracers into a perfect
  // ring, and reaches zero smoothly at the edge so there is no visible boundary.
  return { bend: s * s * 3, pull: s * s * 0.5 }
}

function createModel(_density: Density): FieldModel {
  const head = spriteSet(disc, [WHITE])[0]
  let ps: P[] = []
  let w = 0
  let h = 0
  let time = 0

  const count = () => (w < 640 ? 260 : 480)

  const spawn = (p: P) => {
    p.x = Math.random() * w
    p.y = Math.random() * h
    p.maxLife = 3 + Math.random() * 5
    p.life = p.maxLife
    p.depth = Math.random()
    // Near tracers travel faster, so the field parallaxes as it drifts.
    p.speed = (0.5 + Math.random() * 0.8) * (0.55 + p.depth * 0.9)
    // A respawn must not streak across the screen from wherever the tracer used
    // to be, so the whole history is rewound to the spawn point.
    for (let k = 0; k < HIST; k++) {
      p.tx[k] = p.x
      p.ty[k] = p.y
    }
    p.head = 0
  }

  const seed = () => {
    ps = Array.from({ length: count() }, () => ({
      x: 0,
      y: 0,
      tx: new Float32Array(HIST),
      ty: new Float32Array(HIST),
      head: 0,
      life: 0,
      maxLife: 1,
      speed: 1,
      depth: 0,
    }))
    ps.forEach(spawn)
  }

  const step = (f: Frame, animate: boolean) => {
    const { ctx, pointer, dt } = f
    if (animate) time += dt

    const stirring = pointer.inside
    ctx.lineCap = 'round'

    for (const p of ps) {
      let hot = 0

      if (animate) {
        p.life -= dt
        if (p.life <= 0 || p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
          spawn(p)
        }

        const v = stirring ? vortex(p.x, p.y, pointer.x, pointer.y) : { bend: 0, pull: 0 }
        hot = v.bend === 0 ? 0 : 1 - Math.hypot(p.x - pointer.x, p.y - pointer.y) / VORTEX_R

        const a = flow(p.x, p.y, time) + v.bend
        p.x += Math.cos(a) * p.speed
        p.y += Math.sin(a) * p.speed
        if (v.pull) {
          p.x += (pointer.x - p.x) * v.pull * 0.02
          p.y += (pointer.y - p.y) * v.pull * 0.02
        }

        p.head = (p.head + 1) % HIST
        p.tx[p.head] = p.x
        p.ty[p.head] = p.y
      }

      // Fade in over the first sliver of life and out over the last, so
      // respawns never pop.
      const edge = Math.min(p.life, p.maxLife - p.life)
      const fade = Math.max(0, Math.min(1, edge / 0.6))
      // Low base alpha, because additive overlap multiplies it up wherever the
      // flow bunches.
      const alpha = fade * (0.12 + p.depth * 0.3 + hot * 0.2)

      // Tail: a short polyline drawn backwards from the head along the recent
      // path — this is what makes the streamlines legible instead of dots.
      ctx.globalAlpha = alpha
      ctx.strokeStyle = INK
      ctx.lineWidth = (0.9 + p.depth * 1.4) * (1 + hot * 0.6)
      ctx.beginPath()
      ctx.moveTo(p.tx[p.head], p.ty[p.head])
      for (let k = 1; k <= TAIL_POINTS; k++) {
        const idx = (p.head - k + HIST) % HIST
        ctx.lineTo(p.tx[idx], p.ty[idx])
      }
      ctx.stroke()

      // Head: brighter than the tail so the leading end reads as a point.
      ctx.globalAlpha = Math.min(1, alpha * 1.8)
      drawSprite(ctx, head, p.x, p.y, (1.1 + p.depth * 1.3) * (1 + hot * 0.5))
    }

    ctx.globalAlpha = 1
  }

  return {
    resize(nw, nh) {
      w = nw
      h = nh
      seed()
    },

    frame(f) {
      f.ctx.clearRect(0, 0, w, h)
      step(f, true)
    },

    // Reduced motion: one settled frame of the field, frozen.
    settle(f) {
      f.ctx.clearRect(0, 0, w, h)
      // `edge` (which drives the fade) is min(life, maxLife - life). A tracer
      // that has never ticked has maxLife - life === 0 and would draw at zero
      // alpha, so park life mid-window for the static frame.
      for (const p of ps) {
        p.life = p.maxLife * 0.5
        for (let s = 0; s < 4; s++) {
          const a = flow(p.x, p.y, 0)
          p.x += Math.cos(a) * p.speed
          p.y += Math.sin(a) * p.speed
          p.head = (p.head + 1) % HIST
          p.tx[p.head] = p.x
          p.ty[p.head] = p.y
        }
      }
      step(f, false)
    },
  }
}

export default function FlowField({ density }: { density: Density }) {
  const { canvasRef, wrapRef } = useFieldCanvas(density, createModel)

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}