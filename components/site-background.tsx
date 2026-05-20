/** Static ambient background — CSS-only animations (no Framer on every route). */
export function SiteBackground() {
  return (
    <div className="site-bg-root fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% -15%, rgba(236, 72, 153, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 95% 40%, rgba(168, 85, 247, 0.16) 0%, transparent 50%),
            radial-gradient(ellipse 55% 45% at 5% 75%, rgba(244, 114, 182, 0.12) 0%, transparent 45%),
            linear-gradient(165deg, #050508 0%, #0a0a10 35%, #08080e 65%, #06060a 100%)
          `,
        }}
      />
      <div className="site-bg-aurora absolute inset-[-50%] opacity-40" />
      <div className="site-bg-orb site-bg-orb-a absolute rounded-full site-bg-orb-blur bg-pink-500/20" />
      <div className="site-bg-orb site-bg-orb-b absolute rounded-full site-bg-orb-blur bg-purple-600/18" />
      <div className="absolute inset-0 site-bg-grid" />
      <div className="absolute inset-0 site-bg-stars" />
      <div className="absolute inset-0 site-bg-vignette" />
      <div className="absolute inset-0 site-bg-noise" />
    </div>
  )
}
