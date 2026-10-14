/**
 * AuroraField — the site backdrop.
 *
 * Deliberately CSS-only: three drifting radial gradients composited under a
 * masked grid and a film grain. No WebGL context, no per-frame JS, so it costs
 * nothing on scroll and never competes with the GSAP ticker.
 */
export default function AuroraField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void"
    >
      {/* Drifting aurora blooms */}
      <div className="absolute -top-[30vh] left-1/2 h-[85vh] w-[120vw] -translate-x-1/2 animate-drift will-change-transform">
        <div className="absolute left-[8%] top-0 h-[55vh] w-[55vw] rounded-full bg-[radial-gradient(closest-side,rgba(124,92,255,0.30),transparent)] blur-[60px]" />
        <div className="absolute right-[4%] top-[8%] h-[48vh] w-[46vw] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.20),transparent)] blur-[70px]" />
      </div>

      <div className="absolute top-[45vh] left-[-15vw] h-[70vh] w-[70vw] animate-drift rounded-full bg-[radial-gradient(closest-side,rgba(192,132,252,0.14),transparent)] blur-[90px] [animation-delay:-11s] will-change-transform" />

      {/* Vignette that keeps text legible over the blooms */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_40%,transparent_35%,rgba(5,5,6,0.85)_100%)]" />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}