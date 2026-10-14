import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap } from '../../animations/gsap'
import { onNoMotionPreference, REVEAL } from '../../animations/motion'

type Props = {
  /** Index string, e.g. "01". */
  index: string
  slug: string
  /** Three colour stops driving this project's entire identity. */
  glow: readonly [string, string, string]
  year: string
  total: number
  children: ReactNode
}

/**
 * Project page — gives each project its own colour identity and a scroll-driven
 * "page settles into place" transition.
 *
 * Colour is scoped to the panel itself (frame border, inner glow, title, kicker)
 * via three custom properties, deliberately NOT a full-viewport wash. An earlier
 * version stacked one full-screen gradient layer per project, which is a
 * viewport-sized render surface each — that was tens of megabytes of GPU
 * compositing memory on its own and was what made scrolling stutter. Scoping the
 * colour to the card gives the same per-project identity for a few kilobytes.
 *
 * The motion is transform/opacity/clip only, all compositor properties, so the
 * transition never triggers a repaint of the panel's contents.
 */
export default function ProjectPage({
  index,
  slug,
  glow,
  year,
  total,
  children,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const frame = frameRef.current
    const band = bandRef.current
    if (!section || !frame) return

    return onNoMotionPreference(() =>
      gsap.context(() => {
        // The page settles: it arrives tilted and smaller, then squares up.
        // rotateX needs perspective on an ancestor, set below.
        gsap.fromTo(
          frame,
          { rotateX: 15, y: 70, scale: 0.94, opacity: 0 },
          {
            rotateX: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.15,
            ease: 'expo.out',
            scrollTrigger: { trigger: section, ...REVEAL },
          },
        )

        // The accent band wipes in across the top of the frame.
        if (band) {
          gsap.fromTo(
            band,
            { scaleX: 0, transformOrigin: 'left center' },
            {
              scaleX: 1,
              duration: 1.2,
              ease: 'expo.out',
              scrollTrigger: { trigger: section, ...REVEAL },
            },
          )
        }

        // Inner copy follows, so the frame lands before its contents.
        gsap.from('.pj-reveal', {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.07,
          ease: 'expo.out',
          scrollTrigger: { trigger: section, ...REVEAL },
        })

        // Numeric metrics count up on first reveal; word metrics stay verbatim.
        section.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count)
          if (!Number.isFinite(target)) return

          const suffix = el.dataset.suffix ?? ''
          const obj = { v: 0 }
          gsap.to(obj, {
            v: target,
            duration: 1.4,
            ease: 'power2.out',
            snap: { v: 1 },
            onUpdate: () => {
              el.textContent = `${Math.round(obj.v)}${suffix}`
            },
            scrollTrigger: { trigger: section, ...REVEAL },
          })
        })
      }, section),
    )
  }, [])

  return (
    <section
      ref={sectionRef}
      id={slug}
      data-pj-panel
      className="relative scroll-mt-24 border-t border-border py-14 md:py-20"
      style={
        {
          '--pj-a': glow[0],
          '--pj-b': glow[1],
          '--pj-c': glow[2],
        } as CSSProperties
      }
    >
      {/* Perspective parent for the frame's rotateX, so the tilt reads as a
          plane turning toward the viewer. */}
      <div className="mx-auto w-full max-w-[1600px] px-5 [perspective:1600px] sm:px-8 lg:px-12">
        <div
          ref={frameRef}
          className="pj-frame relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            ref={bandRef}
            aria-hidden="true"
            className="mb-9 h-px w-full origin-left"
            style={{
              background:
                'linear-gradient(90deg, var(--pj-a), var(--pj-b) 45%, transparent)',
            }}
          />

          <div className="mb-6 flex items-baseline justify-between gap-4">
            <span className="font-mono text-xs text-faint">
              {index} / {String(total).padStart(2, '0')}
            </span>
            <span className="font-mono text-xs text-faint">{year}</span>
          </div>

          {children}
        </div>
      </div>
    </section>
  )
}
