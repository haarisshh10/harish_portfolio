/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT ME — every placeholder below is wired to the UI.
 *  Sourced from your résumé; swap anything that's stale.
 * ─────────────────────────────────────────────────────────────
 */
export const site = {
  name: 'Harish K',
  handle: '@haarisshh10',
  role: 'AI / Full-Stack Engineer',
  tagline:
    'I build full-stack products, then put an agent in the middle of them — with the trace, the cost and the failure modes left visible.',
  location: 'Visakhapatnam, Andhra Pradesh',

  email: 'harishveera2001@gmail.com',
  phone: '+91 70367 60715',

  links: {
    github: 'https://github.com/haarisshh10',
    linkedin: 'https://www.linkedin.com/in/harish-kukkala-6069b5250',
  },

  resumeUrl: '/resume.pdf',

  /**
   * Optional. Point this at an image in /public and it replaces the HK monogram
   * in the identity card / About portrait.
   *
     * Use the pre-sized derivatives, not the originals — the 6.8 MB mypic.png
   * and the 600x800 "shared image.jpeg" both now live outside public/ in
   * .assets-raw/. portrait-400.jpg is 37 KB and covers the slot to 2x.
   */
  avatar: '/portrait-400.jpg' as string | undefined,
} as const

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'Stack', href: '#stack' },
  { label: 'Experience', href: '#experience' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const