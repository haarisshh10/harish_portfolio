import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../animations/gsap'

/**
 * Module-level singleton. React's StrictMode mounts/unmounts effects twice in
 * development; creating Lenis inside the effect would attach two wheel
 * listeners racing each other and fighting over the scroll position. Keeping a
 * single shared instance avoids that entirely.
 */
let lenisInstance: Lenis | null = null

function getLenis() {
  if (!lenisInstance) {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      autoRaf: false,
    })
    lenisInstance.on('scroll', ScrollTrigger.update)
  }
  return lenisInstance
}

/**
 * Drives Lenis smooth scrolling through GSAP's ticker so every animation on
 * the page shares a single, raf-aligned clock.
 */
export function useLenis() {
  useEffect(() => {
    const lenis = getLenis()

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
    }
  }, [])
}
