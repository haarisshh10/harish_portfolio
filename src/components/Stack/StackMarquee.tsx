import { stackMarquee } from '../../data/projects'

function Row({
  items,
  reverse = false,
  duration = 38,
  muted = false,
}: {
  items: string[]
  reverse?: boolean
  duration?: number
  muted?: boolean
}) {
  const doubled = [...items, ...items]

  return (
    <div
      className="group flex w-max shrink-0 animate-marquee items-center gap-10 pr-10 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
      style={{
        animationDirection: reverse ? 'reverse' : 'normal',
        animationDuration: `${duration}s`,
      }}
    >
      {doubled.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center gap-10">
          <span
            className={`text-[clamp(1.5rem,4vw,3rem)] font-semibold tracking-[-0.03em] whitespace-nowrap ${
              muted ? 'text-faint/60' : 'text-foreground/85'
            }`}
          >
            {item}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
        </span>
      ))}
    </div>
  )
}

export default function StackMarquee() {
  return (
    <section id="stack" className="scroll-mt-24 border-y border-border py-14 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex items-baseline justify-between gap-6">
          <span className="label-xs text-accent-3">Stack</span>
          <span className="label-xs hidden text-faint sm:block">
            Everything below shipped in production
          </span>
        </div>
      </div>

      <div
        className="relative flex flex-col gap-4 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        }}
      >
        <Row items={stackMarquee} />
        <Row items={[...stackMarquee].reverse()} reverse duration={48} muted />
      </div>
    </section>
  )
}