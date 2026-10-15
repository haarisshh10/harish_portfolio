export type Project = {
  slug: string
  index: string
  title: string
  kicker: string
  year: string
  repo: string
  live?: string
  summary: string
  problem: string
  highlights: string[]
  stack: string[]
  metrics: { label: string; value: string }[]
  /** Lines typed out inside the terminal-style demo card. */
  demo: string[]
  /** Which live visual the panel shows. Defaults to the terminal card. */
  visual?: 'graph' | 'terminal'
  hue: string
  /**
   * Explicit colour stops for the section's ambient wash. Kept separate from
   * `hue` (a Tailwind class string) because the background needs real colour
   * values it can interpolate, not utility classes.
   */
  glow: [string, string, string]
}

export const projects: Project[] = [
  {
    slug: 'formicflow',
    index: '01',
    title: 'FormicFlow',
    kicker: 'AI Workflow Automation Platform',
    year: '2026',
    repo: 'https://github.com/haarisshh10/FormicFlow',
    live: 'https://formicflow.vercel.app',
    summary:
      'A node canvas where you assemble RAG pipelines and AI agents, run them with live streaming traces, and see every token and cent before you press Run.',
    problem:
      'Hosted AI workflow builders mark up tokens 300–1000%. FormicFlow inverts that: bring-your-own-key across 15 providers, and a pre-flight forecaster that prices the whole graph before execution starts.',
    highlights: [
      'DAG orchestrator — topological sort with level-parallel fan-out, join, cycle detection and exponential-backoff retries',
      'Agent nodes with tool calling, RAG retrieval and cross-node variable injection via {{nodes.<label>.output}}',
      'SSE streaming trace panel: text deltas, tool calls, per-node latency and real token cost as it happens',
      'Human-in-the-loop approval gates and A/B compare branches that pause the stream and resume on decision',
      'Smart routing falls back across providers on invalid keys or sub-$2 balances',
      'Export a finished graph to TypeScript AI SDK, LangGraph, n8n, MCP server or a Next.js route',
    ],
    stack: [
      'TypeScript',
      'Node.js',
      'LLM APIs',
      'RAG',
      'AI Agents',
      'Zustand',
      'Supabase',
      'Stripe',
      'Tailwind 4',
    ],
    visual: 'graph',
    metrics: [
      { label: 'Providers', value: '15' },
      { label: 'Models', value: '47' },
      { label: 'Node types', value: '6' },
      { label: 'Export targets', value: '5' },
    ],
    demo: [
      '$ formicflow run --graph seo_pipeline',
      '▸ validating graph ......... ok (12 nodes, 30 edges)',
      '▸ resolving models .......... ok (openai/gpt-4o-mini)',
      '▸ cost forecast ............. $0.0412  ← confirm',
      '',
      '  [retriever]  ▸ 4 chunks · embedding 0.31s',
      '  [researcher] ▸ streaming… 1,204 tok  $0.0031',
      '  [writer]     ▸ tool_call → knowledge',
      '  [seo]        ▸ streaming…   410 tok  $0.0044',
      '',
      '✓ run complete — $0.0173 actual vs $0.0412 forecast',
    ],
    hue: 'from-[#7c5cff] via-[#a855f7] to-[#22d3ee]',
    glow: ['#7c5cff', '#a855f7', '#22d3ee'],
  },
  {
    slug: 'sho-vee',
    index: '02',
    title: 'Sho-vee',
    kicker: 'Creator Marketplace',
    year: '2026',
    repo: 'https://github.com/haarisshh10/shoo-vee',
    summary:
      'A marketplace where one account discovers creators, hires them, browses work, and picks up gigs — plus a full studio for the people making it.',
    problem:
      'Most marketplaces split buyers and creators into two silos and two logins. Sho-vee uses a single account; the Studio unlocks when a creator profile is activated, and Admin is a permission rather than a place.',
    highlights: [
      'One account, three surfaces — Marketplace, Studio and Admin-as-permission, gated on a creator_profile row',
      'Onboarding captures intent (hire / showcase / find gigs) as independent preference flags',
      'TanStack Start + Router + Query with a typed route tree across ~30 routes',
      'Drizzle ORM against PostgreSQL with Better Auth sessions',
      'Playwright end-to-end suite covering the marketplace-to-studio activation path',
      'Agent-graded codebase — an AGENTS.md project guide documents the surface rules',
    ],
    stack: [
      'TypeScript',
      'React 19',
      'TanStack',
      'Tailwind 4',
      'shadcn/ui',
      'Drizzle ORM',
      'PostgreSQL',
      'Better Auth',
      'Nitro',
    ],
    metrics: [
      { label: 'Accounts', value: 'One' },
      { label: 'Surfaces', value: '3' },
      { label: 'ORM', value: 'Drizzle' },
      { label: 'E2E', value: 'Playwright' },
    ],
    demo: [
      '$ pnpm dev',
      '✓ vite ready in 412ms',
      '✓ nitro server on :3000',
      '✓ postgres connected — 14 tables',
      '',
      '  /discover      creators · city · gear · rating',
      '  /shots         community feed',
      '  /gigs          short-term crew work',
      '  /app/studio    unlocked after activation',
      '  /admin         permission-gated, never in nav',
    ],
    hue: 'from-[#22d3ee] via-[#38bdf8] to-[#7c5cff]',
    glow: ['#22d3ee', '#38bdf8', '#7c5cff'],
  },
  {
    slug: 'techmotion',
    index: '03',
    title: 'TechMotion',
    kicker: 'Deterministic SVG Engine',
    year: '2025',
    repo: 'https://github.com/haarisshh10/TechMotion',
    summary:
      'A Node engine that turns engineering diagrams into animated, deterministic SVG output and rendered motion assets.',
    problem:
      'Diagram animations are usually hand-tuned in a browser and lost on export. TechMotion makes the animation deterministic — the same input always produces the same frame — so it can be rendered, diffed and shipped as an asset.',
    highlights: [
      'Deterministic render pipeline: identical input always yields identical output',
      'Engineering diagrams in, high-quality animated output out',
      'Node CLI front-end over a composable template + topic system',
      'Companion Vite web UI with a live Node server for previewing renders',
      'node:test suite covering the render core',
    ],
    stack: ['Node.js', 'Commander', 'Vite', 'JavaScript', 'node:test'],
    metrics: [
      { label: 'Determinism', value: '100%' },
      { label: 'Interface', value: 'CLI' },
      { label: 'Tests', value: 'node:test' },
      { label: 'Output', value: 'SVG → GIF' },
    ],
    demo: [
      '$ techmotion render --in diagram.svg --out anim.svg',
      '',
      '  parsing ................ 24 nodes',
      '  resolving topics ........ 11',
      '  interpolating ........... 120 frames',
      '  encoding ................ svg',
      '',
      '✓ deterministic — checksum 9f2a1c matches prior run',
    ],
    hue: 'from-[#f472b6] via-[#c084fc] to-[#7c5cff]',
    glow: ['#c084fc', '#f472b6', '#7c5cff'],
  },
]

export const stackMarquee = [
  'TypeScript',
  'Java',
  'Python',
  'Angular',
  'React',
  'Spring Boot',
  'Node.js',
  'REST APIs',
  'RAG',
  'AI Agents',
  'Tool Calling',
  'Model Routing',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Tailwind',
  'Docker',
  'Prometheus',
  'Grafana',
  'OpenTelemetry',
]

/* ── Experience ─────────────────────────────────────────────── */
export type Role = {
  company: string
  role: string
  period: string
  domain: string
  current?: boolean
  points: string[]
  stack: string[]
}

export const experience: Role[] = [
  {
    company: 'Varroc Connect',
    role: 'Junior Software Engineer',
    period: 'Aug 2025 — Present',
    domain: 'Connected Mobility & Fleet Management',
    current: true,
    points: [
      'Ship enterprise Angular + TypeScript applications for connected mobility and fleet management.',
      'Build and integrate Java / Spring Boot REST services backed by SQL databases.',
      'Run the full SDLC slice — features, defect fixes, unit and automated test suites, code review.',
      'Stand up POCs and prototypes for capabilities still being evaluated.',
      'Work across Docker, Linux, Nginx, Prometheus, Grafana, OpenTelemetry and OpenSearch.',
      'Contribute to IoT edge computing and subscription / payment integrations.',
      'Use Copilot, Claude and OpenCode for development, debugging, review and test authoring.',
    ],
    stack: [
      'Angular',
      'TypeScript',
      'Spring Boot',
      'Java',
      'SQL',
      'Docker',
      'Prometheus',
      'Grafana',
      'OpenSearch',
    ],
  },
  {
    company: 'Varroc Connect',
    role: 'Software Engineer Intern',
    period: 'Feb 2025 — Jul 2025',
    domain: 'Enterprise Web',
    points: [
      'Developed Angular modules and wired them to Spring Boot REST APIs.',
      'Worked across Java, Spring Boot, SQL, Docker, Linux and Git.',
      'Wrote unit tests, fixed defects and delivered enhancement releases.',
    ],
    stack: ['Angular', 'Spring Boot', 'Java', 'SQL', 'Docker', 'Git'],
  },
]

/* ── Open source ────────────────────────────────────────────── */
export const oss = {
  org: 'grafana',
  repo: 'opensearch-datasource',
  commit: 'f6447ba',
  pr: '#1136',
  title: 'Fix Logs Volume supplementary queries for PPL log queries',
  body: 'Shipped a fix to the Grafana OpenSearch datasource: the Logs Volume panel was returning incorrect supplementary query results for PPL (Pipes Language) log queries. Added the implementation change plus unit tests covering the PPL log path.',
  url: 'https://github.com/grafana/opensearch-datasource/pull/1136',
}

export const capabilities = [
  {
    title: 'Agent orchestration',
    body: 'DAG engines, RAG retrieval, tool calling, human-in-the-loop approval gates, token-cost accounting and multi-provider model routing.',
  },
  {
    title: 'Full-stack delivery',
    body: 'Angular and React on the front, Spring Boot and Node on the back, MySQL and Postgres underneath — through to Docker, CI/CD and observability.',
  },
  {
    title: 'Enterprise discipline',
    body: 'Unit and automated testing, code review, debugging and POCs on real connected-mobility and fleet products, not side projects.',
  },
]

export const stats = [
  { value: 2, suffix: '+', label: 'Years in production' },
  { value: 19, suffix: '', label: 'Public repos' },
  { value: 15, suffix: '', label: 'LLM providers wired' },
  { value: 1, suffix: '', label: 'OSS PR into Grafana' },
]