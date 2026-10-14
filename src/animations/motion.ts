import { gsap } from './gsap'

const NO_MOTION = '(prefers-reduced-motion: no-preference)'

type Revertible = { revert: () => void }
const hasRevert = (v: unknown): v is Revertible =>
  typeof v === 'object' && v !== null && typeof (v as Revertible).revert === 'function'

/**
 * Runs a reveal only when the user has not asked for reduced motion.
 *
 * Scroll reveals are the one thing on this site that can hide content outright
 * — `gsap.from` applies `opacity: 0` the moment it is created — so they must
 * never be left half-applied. Under `prefers-reduced-motion` nothing is
 * animated at all, which leaves every element at its natural visible style.
 *
 * `reveal` may return either a plain cleanup function or a gsap Context; both
 * are torn down when the component unmounts or the preference changes.
 */
export function onNoMotionPreference(reveal: () => unknown) {
  const mm = gsap.matchMedia()

  mm.add(NO_MOTION, () => {
    const cleanup = reveal()
    if (typeof cleanup === 'function') return cleanup as () => void
    if (hasRevert(cleanup)) return () => cleanup.revert()
  })

  return () => mm.revert()
}

/** Shared ScrollTrigger defaults so every section reveals at the same depth. */
export const REVEAL = { start: 'top 78%', once: true } as const