import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap'
import { onNoMotionPreference } from '../../animations/motion'
import { projects } from '../../data/projects'

/**
 * Project rail — a slim scroll-progress indicator for the work section.
 *
 * Replaces an earlier full-viewport colour wash that was expensive: that version
 * stacked one full-screen gradient layer per project, which is a lot of GPU
 * compositing memory (each a viewport-sized surface) and re-rasterises during
 * every cross-fade. Four of those layers on a laptop-sized viewport is tens of
 * megabytes of compositing memory on its own.
 *
 * This does the same job — it tracks which project you are on and carries that
 * project's colour — with a few dozen pixels of DOM instead of four
 * viewport-sized surfaces. The active dot takes the project's accent and
 * expands; a hairline fills between the dots as you scroll.
 *
 * Hidden below `lg`, where there is no room for a rail and thumbs rule.
 */
export default function ProjectRail() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    return onNoMotionPreference(() =>
      gsap.context(() => {
        const panels = document.querySelectorAll<HTMLElement>('[data-pj-panel]')
        if (!panels.length) return

        const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-rail-dot]'))
        const fill = root.querySelector<HTMLElement>('[data-rail-fill]')

        const setActive = (i: number) => {
          dots.forEach((dot, k) => {
            const on = k === i
            dot.style.backgroundColor = on ? projects[i].glow[0] : ''
            dot.style.borderColor = on ? projects[i].glow[0] : ''
            dot.style.transform = on ? 'scale(1.7)' : 'scale(1)'
          })
        }

        setActive(0)

        // Drive the fill from overall section progress — one scrubbed tween,
        // rather than per-panel callbacks.
        if (fill) {
          const section = document.getElementById('work')
          if (section) {
            gsap.fromTo(
              fill,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top center',
                  end: 'bottom center',
                  scrub: 0.4,
                },
              },
            )
          }
        }

        panels.forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: panel,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => setActive(i),
            onEnterBack: () => setActive(i),
          })
        })

        // Fade the whole rail out when the section is off screen.
        const section = document.getElementById('work')
        if (section) {
          ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              gsap.to(root, { opacity: self.isActive ? 1 : 0, duration: 0.4 })
            },
          })
        }
      }, root),
    )
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 opacity-0 lg:block"
    >
      <div className="relative flex flex-col items-center gap-6 py-2">
        {/* Progress hairline behind the dots. */}
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
        <span
          data-rail-fill
          className="absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 bg-gradient-to-b from-accent via-accent-3 to-accent-2"
          style={{ transform: 'scaleY(0)' }}
        />
        {projects.map((p) => (
          <span
            key={p.slug}
            data-rail-dot
            title={p.title}
            className="relative h-2 w-2 rounded-full border border-border-strong bg-void transition-transform duration-300"
          />
        ))}
      </div>
    </div>
  )
}