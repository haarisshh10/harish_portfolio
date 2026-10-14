import type { Density } from '../../../hooks/useFieldCanvas'

/** One disciplined aurora pair, matching the site accents. */
export const PALETTE = ['#7c5cff', '#22d3ee', '#c084fc'] as const
export const WHITE = '#ffffff'

/** Pre-rendered sprite box. Marks are rasterised once, then cost one drawImage. */
export const SPRITE = 40

export type Glyph = (ctx: CanvasRenderingContext2D, s: number) => void

/**
 * Rasterises one glyph to its own offscreen canvas.
 *
 * Repeated shapes are rebuilt-per-frame-expensive, so each is built once and
 * then only scaled and rotated.
 */
export function makeSprite(colour: string, glyph: Glyph) {
  const c = document.createElement('canvas')
  c.width = SPRITE
  c.height = SPRITE
  const x = c.getContext('2d')
  if (x) {
    x.translate(SPRITE / 2, SPRITE / 2)
    x.fillStyle = colour
    x.strokeStyle = colour
    x.lineCap = 'round'
    x.lineJoin = 'round'
    x.lineWidth = SPRITE * 0.06
    glyph(x, SPRITE / 2)
  }
  return c
}

export function spriteSet(glyph: Glyph, colours: readonly string[] = PALETTE) {
  return colours.map((c) => makeSprite(c, glyph))
}

export const disc: Glyph = (c, s) => {
  c.beginPath()
  c.arc(0, 0, s * 0.9, 0, Math.PI * 2)
  c.fill()
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  r: number,
  rotation = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  if (rotation) ctx.rotate(rotation)
  ctx.drawImage(sprite, -r, -r, r * 2, r * 2)
  ctx.restore()
}

/** Hero runs `low` — it sits behind 11rem type, so it stays a background. */
export const HERO_DENSITY: Density = 'low'