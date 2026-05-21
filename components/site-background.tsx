/** Static ambient background — graphite cinematic, CSS-only motion. */
export function SiteBackground() {
  return (
    <div className="site-bg-root fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 55% at 50% -8%, rgba(255, 255, 255, 0.05) 0%, transparent 52%),
            radial-gradient(ellipse 50% 40% at 92% 35%, rgba(120, 130, 160, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 45% 38% at 4% 70%, rgba(90, 95, 115, 0.05) 0%, transparent 48%),
            linear-gradient(180deg, #050506 0%, #08080a 42%, #050506 100%)
          `,
        }}
      />
      <div className="site-bg-aurora absolute inset-[-50%] opacity-25 cin-gradient-shift" />
      <div className="site-bg-orb site-bg-orb-a absolute rounded-full site-bg-orb-blur bg-white/[0.04]" />
      <div className="site-bg-orb site-bg-orb-b absolute rounded-full site-bg-orb-blur bg-slate-400/[0.05]" />
      <div className="absolute inset-0 site-bg-grid opacity-30" />
      <div className="absolute inset-0 site-bg-stars opacity-50" />
      <div className="absolute inset-0 site-bg-vignette" />
      <div className="absolute inset-0 site-bg-noise" />
    </div>
  )
}
