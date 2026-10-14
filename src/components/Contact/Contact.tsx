import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { site } from '../../config/site'
import ArrowField from '../Hero/ArrowField'

async function copyText(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }

  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'fixed'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(el)
  return ok
}

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleCopy = async () => {
    const ok = await copyText(site.email)
    if (!ok) {
      window.location.href = `mailto:${site.email}`
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2200)
  }

  const links = [
    { label: 'GitHub', href: site.links.github, handle: site.handle },
    { label: 'LinkedIn', href: site.links.linkedin, handle: 'harishk' },
    { label: 'Phone', href: `tel:${site.phone.replace(/\s/g, '')}`, handle: site.phone },
    { label: 'Résumé', href: site.resumeUrl, handle: 'PDF' },
  ]

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 overflow-hidden border-t border-border py-16 md:py-24"
    >
      {/* Drifting marks heading for the CTA — flow reads as "send it my way". */}
      <ArrowField />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_38%_48%,rgba(5,5,6,0.72),transparent_76%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <span className="label-xs text-accent-3">Contact</span>

        <h2 className="mt-5 max-w-4xl text-balance text-[clamp(2.25rem,8vw,6rem)] font-bold leading-[0.9] tracking-[-0.05em]">
          Got something
          <span className="text-aurora block">worth shipping?</span>
        </h2>

        {/* ── Copy-to-clipboard email ── */}
        <div className="mt-14">
          <button
            onClick={handleCopy}
            aria-live="polite"
            className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface/40 px-6 py-10 text-left transition-colors duration-500 hover:border-border-strong hover:bg-surface/70 sm:px-10 sm:py-14"
          >
            {/* Aurora sweep on hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(120% 140% at 50% 120%, rgba(124,92,255,0.28), transparent 60%)',
              }}
            />

            {/* Border beam that runs once on copy */}
            <AnimatePresence>
              {copied && (
                <motion.span
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                >
                  <motion.span
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-accent-2 to-transparent blur-[6px]"
                    initial={{ x: '-30%' }}
                    animate={{ x: '130%' }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                  />
                </motion.span>
              )}
            </AnimatePresence>

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-[clamp(1.05rem,4.5vw,2.75rem)] tracking-tight text-foreground break-all">
                {site.email}
              </span>

              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-strong bg-white/[0.04] sm:h-14 sm:w-14">
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 460, damping: 22 }}
                      className="absolute inset-0 grid place-items-center rounded-full bg-emerald-400/15"
                    >
                      <Check className="h-6 w-6 text-emerald-300" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid place-items-center"
                    >
                      <Copy className="h-5 w-5 text-muted transition-colors group-hover:text-foreground sm:h-6 sm:w-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </div>

            <span className="label-xs relative mt-5 block text-faint">
              {copied ? 'Copied to clipboard' : 'Click to copy'}
            </span>
          </button>
        </div>

        {/* ── Outbound links ── */}
        <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.href.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                className="group flex items-center justify-between gap-4 bg-surface px-6 py-7 transition-colors duration-300 hover:bg-elevated"
              >
                <span>
                  <span className="block text-base font-medium tracking-tight text-foreground">
                    {link.label}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-faint">
                    {link.handle}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-2" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}