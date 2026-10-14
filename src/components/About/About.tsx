import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'
import { onNoMotionPreference, REVEAL } from '../../animations/motion'
import { capabilities, stats } from '../../data/projects'
import { site } from '../../config/site'

export default function About() {
  const rootRef = useRef<HTMLElement>(null)

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
            <div className="relative w-44 shrink-0 self-start sm:w-60">
              <div className="overflow-hidden rounded-2xl border border-border-strong">
                <img
                  src={site.avatar}
                  alt={`${site.name}, ${site.role}`}
                  width={240}
                  height={320}
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent via-accent-3 to-accent-2"
              />
            </div>
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
            <h2 className="ab-reveal text-balance text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-[0.95] tracking-[-0.045em]">
              Started building
              <span className="text-aurora"> full-stack.</span>
              <br />
              Now building
              <span className="text-aurora"> agents.</span>
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

          <div className="lg:col-span-7">
            <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {capabilities.map((cap, i) => (
                <li key={cap.title} className="ab-reveal group relative bg-surface p-7 md:p-9">
                  <span className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-gradient-to-b from-accent to-accent-2 transition-transform duration-700 group-hover:scale-y-100" />
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-faint">0{i + 1}</span>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                      {cap.title}
                    </h3>
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-[15px]">
                    {cap.body}
                  </p>
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