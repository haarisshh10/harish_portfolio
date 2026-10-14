import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../animations/gsap'
import { AGENT_EDGES, AGENT_NODES } from '../../data/agentGraph'

const NODE_W = 138
const NODE_H = 56

export default function AgentGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const runRef = useRef<HTMLSpanElement>(null)
  const statusRef = useRef<HTMLSpanElement>(null)
  const costRef = useRef<HTMLSpanElement>(null)
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({})
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([])
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setCompact(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const mm = gsap.matchMedia()

    // Reduced motion: the graph is shown fully lit and static. It reads as a
    // completed run rather than an empty box.
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.ag-node', { opacity: 1 })
      gsap.set('.ag-node-dot', { fill: '#34d399' })
      gsap.set('.ag-line', { strokeOpacity: 0.6 })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const boxes = AGENT_NODES.map((n) => {
          const p = compact ? n.compact : n.desktop
          return { ...n, cx: p.x, cy: p.y }
        })
        const byId = Object.fromEntries(boxes.map((b) => [b.id, b]))

        const nodes = boxes.map((b) => nodeRefs.current[b.id]).filter(Boolean) as SVGGElement[]
        const lines = gsap.utils.toArray<SVGLineElement>('.ag-line')
        const pulses = pulseRefs.current.filter(Boolean) as SVGCircleElement[]

        // Start from an idle, unlit graph.
        gsap.set(nodes, { opacity: 0.55 })
        gsap.set('.ag-node-dot', { fill: '#3f3f46', scale: 1, transformOrigin: 'center' })
        gsap.set(lines, { strokeOpacity: 0.26 })
        gsap.set(pulses, { opacity: 0 })

              let runCount = 0

        // Every tween is parented to the timeline because only timeline methods
        // accept a position argument — gsap.to/fromTo are start-now only.
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 })

        const travel = (edgeIndex: number, start: number, duration: number) => {
          const [from, to] = AGENT_EDGES[edgeIndex]
          const a = byId[from]
          const b = byId[to]
          const dot = pulses[edgeIndex]
          const line = lines[edgeIndex]
          if (!dot || !line) return

          tl.fromTo(
            dot,
            { attr: { cx: a.cx, cy: a.cy }, opacity: 0 },
            { attr: { cx: b.cx, cy: b.cy }, opacity: 1, duration, ease: 'power1.inOut' },
            start,
          )
          tl.to(dot, { opacity: 0, duration: 0.18, ease: 'power2.in' }, start + duration)
          tl.fromTo(
            line,
            { strokeOpacity: 0.26 },
            { strokeOpacity: 0.95, duration: duration * 0.5, ease: 'power1.inOut' },
            start,
          )
          tl.to(line, { strokeOpacity: 0.26, duration: 0.5 }, start + duration)
        }

        const light = (id: string, at: number, hold = 0.9) => {
          const g = nodeRefs.current[id]
          if (!g) return
          const dotEl = g.querySelector('.ag-node-dot')

          tl.to(g, { opacity: 1, duration: 0.22, ease: 'power2.out' }, at)
          if (dotEl) {
            tl.to(
              dotEl,
              { fill: '#34d399', scale: 1.6, duration: 0.22, ease: 'power2.out' },
              at,
            )
            tl.to(dotEl, { scale: 1, duration: 0.4, ease: 'power2.inOut' }, at + 0.22)
          }
          tl.to(g, { opacity: 0.55, duration: 0.5, ease: 'power2.inOut' }, at + hold)
        }

        tl.call(() => {
          runCount += 1
          if (runRef.current) {
            runRef.current.textContent = String(1400 + runCount).padStart(4, '0')
          }
          if (costRef.current) costRef.current.textContent = '0.0000'
          if (statusRef.current) statusRef.current.textContent = 'running'
        })

        // input → route
        light('input', 0, 0.5)
        travel(0, 0.25, 0.5)

        // route fans out to both branches in parallel — the actual behaviour a
        // level-parallel DAG executor gives you, and the reason this graph
        // exists rather than a decorative one.
        light('route', 0.8, 0.7)
        travel(1, 1.05, 0.45)
        travel(2, 1.05, 0.45)

        light('retrieve', 1.55, 0.7)
        light('tool', 1.55, 0.7)
        travel(3, 1.8, 0.5)
        travel(4, 1.8, 0.5)

        light('respond', 2.35, 0.9)
        travel(5, 2.6, 0.5)

        light('output', 3.15, 1.2)

        // Total spend counts up across the run, exactly like a live receipt.
        const spend = { v: 0 }
        tl.to(
          spend,
          {
            v: 0.0121,
            duration: 3.4,
            ease: 'none',
            onUpdate: () => {
              if (costRef.current) costRef.current.textContent = spend.v.toFixed(4)
            },
          },
          0.4,
        )

        tl.call(
          () => {
            if (statusRef.current) statusRef.current.textContent = 'complete'
          },
          undefined,
          3.3,
        )

        tl.to(
          { dummy: 0 },
          {
            dummy: 1,
            duration: 0.9,
            ease: 'power1.inOut',
            onComplete: () => {
              if (statusRef.current) statusRef.current.textContent = 'idle'
            },
          },
          3.5,
        )
      }, svg)

      return () => ctx.revert()
    })

    return () => mm.revert()
  }, [compact])

  const view = compact ? '0 0 380 720' : '0 0 1046 380'
  const boxes = AGENT_NODES.map((n) => {
    const p = compact ? n.compact : n.desktop
    return { ...n, ...p }
  })
  const byId = Object.fromEntries(boxes.map((b) => [b.id, b]))

  return (
    <div className="relative mx-auto w-full max-w-[1080px]">
      {/* Readout bar */}
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
        <span className="label-xs text-faint">
          run <span className="text-accent-3">#<span ref={runRef}>1401</span></span>
        </span>
        <span className="label-xs text-faint">
          status{' '}
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span ref={statusRef}>idle</span>
          </span>
        </span>
        <span className="label-xs text-faint">
          est. cost{' '}
          <span ref={costRef} className="font-mono text-xs text-accent-2">0.0000</span>
        </span>
        <span className="label-xs ml-auto hidden text-faint sm:block">
          6 nodes · 2 parallel branches
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={view}
        className="w-full overflow-visible"
        role="img"
        aria-label="Animated directed acyclic graph of an AI agent run: input, model router, parallel retrieval and tool-call branches, response, output."
      >
        {/* Edges */}
        {AGENT_EDGES.map(([from, to], i) => {
          const a = byId[from]
          const b = byId[to]
          return (
            <line
              key={i}
              className="ag-line"
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#ag-edge)"
              strokeWidth="1.25"
              strokeOpacity="0.16"
            />
          )
        })}

        {/* Travelling pulses */}
        {AGENT_EDGES.map((_, i) => (
          <circle
            key={`p${i}`}
            ref={(el) => {
              pulseRefs.current[i] = el
            }}
            r="4.5"
            fill="#22d3ee"
            opacity={0}
            className="drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]"
          />
        ))}

        {/* Nodes */}
        {boxes.map((n) => (
          <g
            key={n.id}
            ref={(el) => {
              nodeRefs.current[n.id] = el
            }}
            className="ag-node"
            transform={`translate(${n.x - NODE_W / 2} ${n.y - NODE_H / 2})`}
          >
            <rect
              width={NODE_W}
              height={NODE_H}
              rx="10"
              fill="#0b0b11"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            <circle className="ag-node-dot" cx="14" cy="17" r="3.75" fill="#52525b" />
            <text
              x="28"
              y="22"
              fill="#f4f4f5"
              fontSize="12.5"
              fontWeight="600"
              fontFamily="var(--font-mono)"
            >
              {n.label}
            </text>
            <text
              x="15"
              y="42"
              fill="#6b6b78"
              fontSize="10.5"
              fontFamily="var(--font-mono)"
            >
              {n.sub}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="ag-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}