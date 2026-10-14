import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { nav, site } from '../../config/site'

const SCROLL_THRESHOLD = 24

export default function Navbar() {
  const { scrollY, scrollYProgress } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('')

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > SCROLL_THRESHOLD)
  })

  useEffect(() => {
    const sections = nav
      .map((item) => document.querySelector(item.href))
      .filter(Boolean) as Element[]

    // Track every section's visibility and derive the active one from the whole
    // set — watching only the intersecting entries would strand the highlight on
    // whatever section fired last.
    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = `#${entry.target.id}`
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
        }

        const first = nav.find((item) => visible.has(item.href))
        setActive(first?.href ?? '')
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="mx-auto max-w-[1600px] px-5 pt-5 sm:px-8 lg:px-12">
          <nav
            className={`flex items-center justify-between rounded-full py-2.5 pl-6 pr-2.5 transition-all duration-500 ${
              scrolled
                ? 'border border-border bg-void/70 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl'
                : 'border border-transparent'
            }`}
          >
            <a
              href="#top"
              className="label-xs shrink-0 text-foreground transition-opacity hover:opacity-70"
            >
              {site.handle}
            </a>

            <div className="hidden items-center md:flex">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`label-xs relative rounded-full px-4 py-2 transition-colors duration-300 ${
                    active === item.href
                      ? 'text-foreground'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {active === item.href && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full border border-border bg-white/[0.05]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={site.links.github}
                target="_blank"
                rel="noreferrer"
                className="label-xs rounded-full px-4 py-2 text-muted transition-colors hover:text-foreground max-md:hidden"
              >
                GitHub
              </a>
              <a
                href="#contact"
                className="group label-xs flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-void transition-transform duration-300 hover:scale-[1.04]"
              >
                Hire me
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground md:hidden"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Scroll progress hairline */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="mx-auto mt-2 h-px w-[calc(100%-2.5rem)] origin-left bg-gradient-to-r from-accent via-accent-3 to-accent-2 sm:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)]"
        />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-void/95 px-6 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {nav.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.06 * i + 0.08, duration: 0.5 }}
                  className="flex items-baseline justify-between border-b border-border py-5 text-[clamp(2rem,11vw,3.25rem)] font-bold tracking-[-0.03em] text-foreground"
                >
                  {item.label}
                  <span className="label-xs text-faint">0{i + 1}</span>
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-12 flex flex-col gap-2 font-mono text-sm text-muted"
            >
              <a href={`mailto:${site.email}`} className="hover:text-foreground">
                {site.email}
              </a>
              <a
                href={site.links.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                {site.handle}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}