/**
 * Geometry for the agent run DAG.
 *
 * Single source of truth for the node/edge layout, kept out of the component so
 * the layout can be referenced from more than one place without drifting.
 */
export type Pt = { x: number; y: number }

export type AgentNodeSpec = {
  id: string
  label: string
  sub: string
  /** Cost in dollars this node burns per run, formatted for the readout. */
  cost: string
  desktop: Pt
  compact: Pt
}

export const AGENT_NODES: AgentNodeSpec[] = [
  {
    id: 'input',
    label: 'input',
    sub: 'query',
    cost: '0.0000',
    desktop: { x: 92, y: 190 },
    compact: { x: 190, y: 62 },
  },
  {
    id: 'route',
    label: 'model_router',
    sub: 'cheapest funded',
    cost: '0.0011',
    desktop: { x: 300, y: 190 },
    compact: { x: 190, y: 196 },
  },
  {
    id: 'retrieve',
    label: 'retrieve',
    sub: '4 chunks · 0.31s',
    cost: '0.0008',
    desktop: { x: 522, y: 74 },
    compact: { x: 92, y: 352 },
  },
  {
    id: 'tool',
    label: 'tool_call',
    sub: 'knowledge.search',
    cost: '0.0004',
    desktop: { x: 522, y: 306 },
    compact: { x: 288, y: 352 },
  },
  {
    id: 'respond',
    label: 'respond',
    sub: 'streamed',
    cost: '0.0098',
    desktop: { x: 762, y: 190 },
    compact: { x: 190, y: 506 },
  },
  {
    id: 'output',
    label: 'output',
    sub: 'traced',
    cost: '—',
    desktop: { x: 952, y: 190 },
    compact: { x: 190, y: 640 },
  },
]

export const AGENT_EDGES = [
  ['input', 'route'],
  ['route', 'retrieve'],
  ['route', 'tool'],
  ['retrieve', 'respond'],
  ['tool', 'respond'],
  ['respond', 'output'],
] as const

/**
 * Stages a trace token walks through. The fan-out at `route` is what makes this
 * a DAG walk rather than a path walk: a token picks one branch per stage and
 * rejoins at `respond`.
 */
export const AGENT_STAGES: readonly (readonly number[])[] = [
  [0],
  [1, 2],
  [3, 4],
  [5],
]

export const AGENT_NODE_BY_ID = Object.fromEntries(
  AGENT_NODES.map((n) => [n.id, n]),
) as Record<string, AgentNodeSpec>