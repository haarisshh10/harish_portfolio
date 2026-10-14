import {
  type Density,
  type FieldModel,
  type Frame,
  densityCount,
  useFieldCanvas,
} from '../../hooks/useFieldCanvas'

/**
 * Drifting marks heading for the contact CTA — flow reads as "send it my way".
 *
 * The same engine as the hero fields, with the original firefly physics kept
 * intact: lazy wander, per-particle pulse, cursor startle and additive flare,
 * edge wrapping. The cursor *shoves* these rather than attracting them, which is
 * the opposite of the hero's constellation — one field that reacts to you, one
 * you react to.
 *
 * Marks read as flow and direction, which suits a portfolio built on pipelines
 * and agent graphs. Depth scales size, opacity and travel rate together, so the
 * field has parallax instead of reading as a flat sheet of stickers.
 */

type Mark = {
  x: number
  y: number
  /** Heading, reused as the resting rotation. */
  a: number
  speed: number
  phase: number
  rate: number
  size: number
  /** 0 = far background, 1 = near. Drives size, opacity and travel rate. */
  depth: number
  kind: number
  colour: number
}

const COLOURS = ['#7c5cff', '#22d3ee', '#c084fc']
const WHITE = '#ffffff'

const INFLUENCE = 200
const SPRITE = 48

/** Pre-rendered mark size as a fraction of the sprite box. */
const EXTENT = 0.3

const KINDS = 4
const SETTLE_STEPS = 90

/**
 * Draws one mark centred on the origin, `s` being its half-extent. Paths are
 * built at unit scale and stroked or filled — mixed weight reads better than a
 * uniform one, and the filled shapes stay legible when they shrink.
 */
function drawMark(ctx: CanvasRenderingContext2D, kind: number, s: number) {
  ctx.beginPath()

  switch (kind) {
    // Solid arrow: shaft plus head, as one path so it fills as a single shape.
    case 0:
      ctx.rect(-s, -s * 0.24, s * 1.25, s * 0.48)
      ctx.moveTo(s * 0.05, -s * 0.62)
      ctx.lineTo(s * 0.95, 0)
      ctx.lineTo(s * 0.05, s * 0.62)
      ctx.closePath()
      ctx.fill()
      break

    // Double chevron, stroked — reads as motion rather than a solid object.
    case 1:
      ctx.moveTo(-s * 0.5, -s * 0.65)
      ctx.lineTo(s * 0.1, 0)
      ctx.lineTo(-s * 0.5, s * 0.65)
      ctx.moveTo(s * 0.1, -s * 0.65)
      ctx.lineTo(s * 0.7, 0)
      ctx.lineTo(s * 0.1, s * 0.65)
      ctx.stroke()
      break

    // Plus sign.
    case 2:
      ctx.moveTo(0, -s * 0.75)
      ctx.lineTo(0, s * 0.75)
      ctx.moveTo(-s * 0.75, 0)
      ctx.lineTo(s * 0.75, 0)
      ctx.stroke()
      break

    // Diamond.
    default:
      ctx.moveTo(0, -s * 0.72)
      ctx.lineTo(s * 0.72, 0)
      ctx.lineTo(0, s * 0.72)
      ctx.lineTo(-s * 0.72, 0)
      ctx.closePath()
      ctx.fill()
  }
}

/**
 * Renders one mark to its own offscreen canvas. Every particle then costs a
 * single drawImage plus a rotation — building these paths per frame for ~70
 * particles is one of the more expensive things you can ask of a 2D context.
 */
function makeSprite(kind: number, colour: string) {
  const c = document.createElement('canvas')
  c.width = SPRITE
  c.height = SPRITE
  const x = c.getContext('2d')
  if (x) {
    x.translate(SPRITE / 2, SPRITE / 2)
    x.fillStyle = colour
    x.strokeStyle = colour
    x.lineWidth = SPRITE * EXTENT * 0.3
    x.lineCap = 'round'
    x.lineJoin = 'round'
    drawMark(x, kind, SPRITE * EXTENT)
  }
  return c
}

function createModel(density: Density): FieldModel {
  const sprites = COLOURS.map((_, i) =>
    Array.from({ length: KINDS }, (_, k) => makeSprite(k, COLOURS[i])),
  )
  // A white copy of each mark for the flare pass. Composited additively so a
  // startled mark brightens toward white instead of merely growing.
  const hot = Array.from({ length: KINDS }, (_, k) => makeSprite(k, WHITE))

  const pointer = { x: -9999, y: -9999, inside: false }
  let w = 0
  let h = 0
  let marks: Mark[] = []

  const step = (f: Frame, advance: boolean) => {
    const time = f.time

    for (const m of marks) {
      let near = 0

      if (advance) {
        // Lazy wander: a slow heading wobble on a per-mark phase.
        const wobble =
          Math.sin(time * 0.55 + m.phase) * 1.5 +
          Math.cos(time * 0.37 + m.phase * 2.1) * 1.2

        if (pointer.inside) {
          const dx = m.x - pointer.x
          const dy = m.y - pointer.y
          const d = Math.hypot(dx, dy)
          if (d < INFLUENCE && d > 0.5) {
            near = 1 - d / INFLUENCE
            // Startled, not repelled: they ease away while flaring. A hard shove
            // empties the radius instantly and you never see the light that
            // makes the interaction obvious.
            m.x += (dx / d) * near * near * 0.5
            m.y += (dy / d) * near * near * 0.5
          }
        }

        m.x += Math.cos(m.a + wobble) * m.speed
        m.y += Math.sin(m.a + wobble) * m.speed

        if (m.x < -40) m.x = w + 40
        if (m.x > w + 40) m.x = -40
        if (m.y < -40) m.y = h + 40
        if (m.y > h + 40) m.y = -40
      }

      // Pulse. Squaring the sine sharpens each mark into a distinct beat
      // instead of a slow swell, and the per-mark rate keeps the field out of
      // step with itself.
      const pulse = 0.5 + 0.5 * Math.sin(time * m.rate + m.phase * 3.1)
      const flare = pulse * pulse

      const radius = m.size * (1 + flare * 0.3 + near * 1.5)
      const alpha = 0.16 + m.depth * 0.3 + flare * 0.12 + near * 0.62

      // Marks lean into their heading, which reads as drifting direction
      // rather than a random tilt.
      const tilt = m.a + Math.sin(time * 0.3 + m.phase) * 0.5

      f.ctx.save()
      f.ctx.translate(m.x, m.y)
      f.ctx.rotate(tilt)
      f.ctx.globalAlpha = Math.min(1, alpha)
      f.ctx.drawImage(sprites[m.colour][m.kind], -radius, -radius, radius * 2, radius * 2)

      if (near > 0.02) {
        f.ctx.globalCompositeOperation = 'lighter'
        f.ctx.globalAlpha = near * 0.85
        const hot2 = radius * (1 + near * 0.35)
        f.ctx.drawImage(hot[m.kind], -hot2, -hot2, hot2 * 2, hot2 * 2)
        f.ctx.globalCompositeOperation = 'source-over'
      }
      f.ctx.restore()
    }

    f.ctx.globalAlpha = 1
  }

  return {
    resize(nw, nh) {
      w = nw
      h = nh
      const count = densityCount(density, w)
      marks = Array.from({ length: count }, () => {
        const depth = Math.random()
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          a: Math.random() * Math.PI * 2,
          speed: 0.16 + depth * 0.42,
          phase: Math.random() * Math.PI * 2,
          rate: 0.7 + Math.random() * 1.9,
          size: 9 + depth * 13,
          depth,
          kind: Math.floor(Math.random() * KINDS),
          colour: Math.floor(Math.random() * COLOURS.length),
        }
      })
    },

    frame(f) {
      pointer.x = f.pointer.x
      pointer.y = f.pointer.y
      pointer.inside = f.pointer.inside
      f.ctx.clearRect(0, 0, w, h)
      step(f, true)
    },

    // Advance the wander without painting, so the static frame shows the field
    // settled mid-drift rather than every mark stacked at its spawn point.
    settle(f) {
      f.ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < SETTLE_STEPS; i++) {
        f.time += 1 / 60
        step(f, false)
        f.ctx.clearRect(0, 0, w, h)
      }
      step(f, false)
    },
  }
}

export default function ArrowField() {
  const { canvasRef, wrapRef } = useFieldCanvas('med', createModel)

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}