import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'
import { onNoMotionPreference } from '../../animations/motion'

const GLYPHS = '▚▞█▓▒░<>/\\{}[]()=+*#@$%&'

type Props = {
  text: string
  className?: string
  /** Seconds before the decode starts. */
  delay?: number
  /** How long the full decode takes. */
  duration?: number
  /** Chars per frame during the scramble phase. */
  speed?: number
  /** Reveal only once the element scrolls into view. */
  start?: string
}

/**
 * Text that decodes into place.
 *
 * Characters resolve left-to-right out of a scramble, like a terminal settling on
 * real output. The real string is kept in `aria-label` so assistive tech reads
 * the finished text regardless of what the visual is doing.
 *
 * The visual text is written straight to the node on every tick — no React state,
 * so a 30-character headline decoding at 60fps costs zero renders.
 */
export default function ScrambleText({
  text,
  className = '',
  delay = 0,
  duration = 1.1,
  speed = 26,
  start = 'top 85%',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced motion: write the final text once and animate nothing.
    el.textContent = text

    return onNoMotionPreference(() => {
      const chars = [...text]
      const n = chars.length
      const state = { p: 0 }

      const paint = () => {
        const p = state.p
        // Characters resolve left-to-right; anything left of the cursor is real.
        const resolved = Math.floor(p * n)
        let out = ''
        for (let i = 0; i < n; i++) {
          const c = chars[i]
          if (c === ' ' || c === '\n') {
            out += c
            continue
          }
          if (i < resolved) out += c
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        el.textContent = out
      }

      paint()

      gsap.to(state, {
        p: 1,
        duration,
        delay,
        ease: 'none',
        onUpdate: paint,
        onComplete: () => {
          el.textContent = text
        },
        scrollTrigger: { trigger: el, start, once: true },
      })
    })
  }, [text, delay, duration, speed, start])

  return (
    <span ref={ref} className={className} aria-label={text} role="text">
      {text}
    </span>
  )
}
