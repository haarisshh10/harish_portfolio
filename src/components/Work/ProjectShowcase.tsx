import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap } from '../../animations/gsap'
import { onNoMotionPreference } from '../../animations/motion'
import { GitHubIcon } from '../icons/GitHubIcon'
import { projects, type Project } from '../../data/projects'
import ProjectPage from './ProjectPage'
import ProjectRail from './ProjectRail'
import AgentGraph from '../Hero/AgentGraph'

/* ── Terminal-style demo card ─────────────────────────────────── */
function DemoCard({ lines, band }: { lines: string[]; band: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    return onNoMotionPreference(() =>
      gsap.context(() => {
        gsap.from('.demo-char', {
          opacity: 0,
          duration: 0.12,
          ease: 'none',
          stagger: { each: 0.004, from: 'start' },
          scrollTrigger: { trigger: root, start: 'top 85%', once: true },
        })
        gsap.from('.demo-prompt', {
          opacity: 0,
          x: -8,
          duration: 0.4,
          stagger: 0.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: root, start: 'top 85%', once: true },
        })
      }, root),
    )
  }, [])

  return (
    <div
      ref={ref}
      className="panel relative overflow-hidden rounded-2xl p-5 font-mono text-[12px] leading-[1.75] shadow-[0_30px_80px_-40px_rgba(0,0,0,1)] sm:p-6 sm:text-[13px]"
    >
      {/* Accent band, tinted to this project's palette. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
        style={{ background: band }}
      />
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="label-xs ml-2 text-faint">run.log</span>
      </div>

      <div className="min-h-[16rem] whitespace-pre-wrap break-words text-muted">
        {lines.map((line, i) => (
          <div key={i} className={line.trimStart().startsWith('$') ? 'demo-prompt' : ''}>
            {line.trimStart().startsWith('$') ? (
              <>
                <span className="text-accent-2">$ </span>
                {line.trim().slice(2).split('').map((c, j) => (
                  <span key={j} className="demo-char inline-block text-foreground">
                    {c}
                  </span>
                ))}
              </>
            ) : line ? (
              line.split('').map((c, j) => (
                <span key={j} className="demo-char inline-block">
                  {c}
                </span>
              ))
            ) : (
              <br />
            )}
          </div>
        ))}
        <span className="demo-char inline-block h-4 w-2 translate-y-0.5 bg-accent-2" />
      </div>
    </div>
  )
}

/* ── One project's content ─────────────────────────────────────
   Rendering only — the page frame, colour identity and scroll
   transition all live in <ProjectPage>. */
function PanelBody({ project }: { project: Project }) {
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* ── Left: identity + narrative ── */}
        <div className="relative lg:col-span-7">
          {/* Title carries this project's own palette so each reads as its own
              page rather than a repeat of the same heading. */}
          <h3
            className="pj-reveal mt-1 bg-clip-text text-balance text-[clamp(2.25rem,5.6vw,3.75rem)] font-bold leading-[0.92] tracking-[-0.045em] text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(100deg, var(--pj-a), var(--pj-b) 52%, var(--pj-c))',
            }}
          >
            {project.title}
          </h3>

          <p className="pj-reveal mt-2.5 font-mono text-sm" style={{ color: 'var(--pj-b)' }}>
            {project.kicker}
          </p>

          <p className="pj-reveal mt-5 max-w-xl text-[17px] leading-relaxed text-foreground/85">
            {project.summary}
          </p>

          <p className="pj-reveal mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {project.problem}
          </p>

          <ul className="pj-reveal mt-7 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {project.highlights.map((h) => (
              <li
                key={h}
                className="group/li relative bg-surface p-4 transition-colors duration-300 hover:bg-elevated"
              >
                <span
                  className="absolute inset-y-0 left-0 w-px scale-y-0 transition-transform duration-500 group-hover/li:scale-y-100"
                  style={{
                    background: 'linear-gradient(180deg, var(--pj-a), var(--pj-c))',
                  }}
                />
                <span className="text-[13px] leading-relaxed text-muted transition-colors duration-300 group-hover/li:text-foreground">
                  {h}
                </span>
              </li>
            ))}
          </ul>

          <div className="pj-reveal mt-6 flex flex-wrap items-center gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="pj-reveal mt-6 flex flex-wrap gap-3">
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="label-xs group inline-flex items-center gap-2 rounded-full border border-border-strong bg-white/[0.04] px-5 py-3 text-foreground transition-colors hover:bg-white/[0.09]"
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              Source
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="label-xs group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-void"
              >
                Live site
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>

        {/* ── Right: metrics + demo ── */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <dl className="pj-reveal mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4 lg:grid-cols-2">
              {project.metrics.map((m) => (
                <div key={m.label} className="bg-surface px-4 py-4">
                  <dd
                    data-count={/^\d+$/.test(m.value) ? m.value : undefined}
                    className="text-2xl font-bold tracking-tight text-foreground"
                  >
                    {m.value}
                  </dd>
                  <dt className="label-xs mt-1.5 text-faint">{m.label}</dt>
                </div>
              ))}
            </dl>

            <div className="pj-reveal">
              {project.visual !== 'graph' && (
                <DemoCard
                  lines={project.demo}
                  band="linear-gradient(90deg, var(--pj-a), var(--pj-c))"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Graph panels get the full panel width — at five columns the SVG
          scales down far enough to make its labels unreadable. */}
      {project.visual === 'graph' && (
        <div className="pj-reveal mt-10 rounded-2xl border border-border bg-surface/40 p-6 md:p-9">
          <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="label-xs" style={{ color: 'var(--pj-b)' }}>
              Live architecture
            </span>
            <span className="label-xs text-faint">
              The same executor that runs a workflow on this product
            </span>
          </div>
          <AgentGraph />
        </div>
      )}
    </>
  )
}

/* ── Section wrapper ─────────────────────────────────────────── */
export default function ProjectShowcase() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    return onNoMotionPreference(() =>
      gsap.context(() => {
        gsap.from('.work-heading span', {
          yPercent: 115,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: root, start: 'top 80%', once: true },
        })
      }, root),
    )
  }, [])

  return (
    <div ref={rootRef} id="work" className="scroll-mt-24">
      <ProjectRail />
      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 sm:px-8 lg:px-12">
        <div className="work-heading overflow-hidden border-t border-border pt-10">
          <span className="label-xs block pb-4 text-accent-3">Selected work</span>
          <h2 className="text-balance text-[length:var(--text-section)] font-bold leading-[0.92] tracking-[-0.045em] text-foreground">
            <span className="block">What I build,</span>
            <span className="text-aurora block">end to end.</span>
          </h2>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
        {projects.map((project) => (
          <ProjectPage
            key={project.slug}
            index={project.index}
            slug={project.slug}
            glow={project.glow}
            year={project.year}
            total={projects.length}
          >
            <PanelBody project={project} />
          </ProjectPage>
        ))}
      </div>
    </div>
  )
}
