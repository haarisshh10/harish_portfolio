import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'
import { onNoMotionPreference, REVEAL } from '../../animations/motion'
import { experience, oss } from '../../data/projects'
import { GitHubIcon } from '../icons/GitHubIcon'

export default function Experience() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    return onNoMotionPreference(() =>
      gsap.context(() => {
        gsap.from('.exp-reveal', {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: root, ...REVEAL },
        })
      }, root),
    )
  }, [])

  return (
    <section
      ref={rootRef}
      id="experience"
      className="scroll-mt-24 border-t border-border py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <span className="label-xs text-accent-3">Experience</span>
        <h2 className="exp-reveal mt-5 max-w-3xl text-balance text-[length:var(--text-section)] font-bold leading-[0.92] tracking-[-0.045em] text-foreground">
          Two years on enterprise
          <span className="text-aurora"> mobility software.</span>
        </h2>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border">
          {experience.map((job) => (
            <li key={`${job.company}-${job.role}`} className="exp-reveal bg-surface p-7 md:p-10">
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Role header */}
                <div className="lg:col-span-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                      {job.role}
                    </h3>
                    {job.current && (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1">
                        <span className="label-xs text-emerald-300">Current</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm font-medium text-accent-3">{job.company}</span>
                    <span className="h-px w-6 bg-border-strong" />
                    <span className="font-mono text-xs text-faint">{job.period}</span>
                  </div>

                  <p className="mt-2 text-sm text-muted">{job.domain}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {job.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-border bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contributions */}
                <ul className="lg:col-span-8">
                  {job.points.map((point) => (
                    <li
                      key={point}
                      className="group flex gap-4 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rotate-45 bg-accent" />
                      <span className="text-[15px] leading-relaxed text-muted transition-colors duration-300 group-hover:text-foreground">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        {/* ── Open source contribution ── */}
        <div className="exp-reveal mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-white/[0.02] px-6 py-3.5 md:px-8">
            <GitHubIcon className="h-4 w-4 text-muted" />
            <span className="font-mono text-sm text-foreground">
              {oss.org} / {oss.repo}
            </span>
            <span className="ml-auto flex items-center gap-2">
              <span className="rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[11px] text-accent-3">
                {oss.commit}
              </span>
              <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted">
                {oss.pr}
              </span>
            </span>
          </div>

          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="label-xs text-accent-3">Open source contribution</span>
              <h3 className="mt-3 text-balance text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {oss.title}
              </h3>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{oss.body}</p>
            </div>

            <div className="lg:col-span-5 lg:justify-self-end">
              <a
                href={oss.url}
                target="_blank"
                rel="noreferrer"
                className="label-xs group inline-flex items-center gap-2 rounded-full border border-border-strong bg-white/[0.04] px-5 py-3 text-foreground transition-colors hover:bg-white/[0.09]"
              >
                View on GitHub
                <GitHubIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}