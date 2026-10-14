import { ArrowUp } from 'lucide-react'
import { nav, site } from '../../config/site'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="label-xs text-faint transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <span className="font-mono text-xs text-faint">
              © {year} {site.name}
            </span>
            <a
              href="#top"
              aria-label="Back to top"
              className="group grid h-10 w-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground"
            >
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}