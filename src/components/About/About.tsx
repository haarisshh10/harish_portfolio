import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'
import { onNoMotionPreference, REVEAL } from '../../animations/motion'
import { capabilities, stats } from '../../data/projects'
import { site } from '../../config/site'
import PortraitCard from './PortraitCard'
import ScrambleText from '../ui/ScrambleText'

export default function About() {
  const rootRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    return onNoMotionPreference(() =>
      gsap.context(() => {
        gsap.from('.ab-reveal', {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: root, ...REVEAL },
        })

        // The capability rail draws itself as the list scrolls past, so the
        // section reads as one connected thread rather than a stack of cards.
        const rail = railRef.current
        if (rail) {
          gsap.fromTo(
            rail,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: rail.parentElement,
                start: 'top 72%',
                end: 'bottom 72%',
                scrub: 0.5,
              },
            },
          )
        }

        root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count)
          if (!Number.isFinite(target)) return
          const suffix = el.dataset.suffix ?? ''
          const obj = { v: 0 }
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            snap: { v: 1 },
            onUpdate: () => {
              el.textContent = `${Math.round(obj.v)}${suffix}`
            },
            scrollTrigger: { trigger: root, ...REVEAL },
          })
        })
      }, root),
    )
  }, [])

  return (
    <section
      ref={rootRef}
      id="about"
      className="scroll-mt-24 border-t border-border py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
        {/* Portrait + identity. Lives here rather than in the hero so the hero
            can stay a single idea. */}
        <div className="ab-reveal mb-16 flex flex-col gap-8 border-b border-border pb-12 sm:flex-row sm:items-center">
          {site.avatar && (
            <PortraitCard src={site.avatar} alt={`${site.name}, ${site.role}`} />
          )}

          <div>
            <span className="label-xs text-accent-3">About</span>
            <p className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {site.name}
            </p>
            <p className="mt-2 font-mono text-sm text-muted">{site.role}</p>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
              Based in {site.location}. Currently building connected-mobility and
              fleet software at Varroc Connect, and agent systems on the side.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { label: site.handle, href: site.links.github },
                { label: 'LinkedIn', href: site.links.linkedin },
                { label: site.email, href: `mailto:${site.email}` },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  {...(social.href.startsWith('http')
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                  className="label-xs rounded-full border border-border bg-white/[0.03] px-4 py-2 text-muted transition-colors hover:border-border-strong hover:text-foreground"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {/* Headline decodes into place on scroll. */}
            <h2 className="ab-reveal text-balance text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-[0.95] tracking-[-0.045em]">
              <ScrambleText text="Started building" className="block" />
              <span className="text-aurora block">
                <ScrambleText text="full-stack." delay={0.12} />
              </span>
              <ScrambleText text="Now building" delay={0.24} className="block" />
              <span className="text-aurora block">
                <ScrambleText text="agents." delay={0.36} />
              </span>
            </h2>

            <div className="ab-reveal mt-8 space-y-5 text-[15px] leading-relaxed text-muted">
              <p>
                I wanted to be a full-stack developer, so I learned both ends —
                Angular and React in the browser, Spring Boot and Node behind it,
                SQL underneath, Docker around the whole thing.
              </p>
              <p>
                Then the interesting problems moved. A form that submits is done;
                a form that retrieves the right chunks, calls the right tool,
                routes to the cheapest funded model, and shows you the receipt
                before it spends anything — that is still being worked on. So I
                stopped treating AI as a feature and started treating it as the
                system.
              </p>
              <p>
                I do both because they are the same job: know what the user
                actually needs, then make the machinery behind it trustworthy.
              </p>
            </div>
          </div>

          {/* Capabilities on a rail that draws as you scroll. */}
          <div className="relative lg:col-span-7">
            <span
              aria-hidden="true"
              className="absolute left-[15px] top-2 bottom-2 w-px origin-top bg-border md:left-[19px]"
            />
            <span
              ref={railRef}
              aria-hidden="true"
              className="absolute left-[15px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-accent via-accent-3 to-accent-2 md:left-[19px]"
              style={{ transform: 'scaleY(0)' }}
            />

            <ol className="relative space-y-4">
              {capabilities.map((cap, i) => (
                <li key={cap.title} className="ab-reveal group relative pl-12 md:pl-16">
                  {/* Node marker on the rail. */}
                  <span className="absolute left-0 top-6 grid h-[30px] w-[30px] place-items-center rounded-full border border-border bg-surface md:h-[38px] md:w-[38px]">
                    <span className="font-mono text-[10px] text-faint transition-colors duration-300 group-hover:text-foreground">
                      0{i + 1}
                    </span>
                  </span>

                  <div className="rounded-2xl border border-border bg-surface p-7 transition-colors duration-300 group-hover:border-border-strong md:p-9">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                      {cap.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-[15px]">
                      {cap.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Stats */}
        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="ab-reveal bg-surface px-6 py-8">
              <dd
                data-count={stat.value}
                data-suffix={stat.suffix}
                className="text-[clamp(2.25rem,5vw,3.25rem)] font-bold leading-none tracking-[-0.04em] text-foreground"
              >
                {stat.value}
                {stat.suffix}
              </dd>
              <dt className="label-xs mt-3 text-faint">{stat.label}</dt>
            </div>
          ))}
        </dl>

        <p className="ab-reveal mt-10 max-w-2xl text-sm leading-relaxed text-muted">
          Based in {site.location}. Every project on this page is real work from
          public repositories — no concept pieces.
        </p>
      </div>
    </section>
  )
}
