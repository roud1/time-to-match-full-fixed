/** Static ambient background — soft light theme, CSS-only motion. */
export function SiteBackground() {
  return (
    <div className="site-bg-root fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="site-bg-base absolute inset-0" />
      <div className="site-bg-aurora absolute inset-[-50%] opacity-20 cin-gradient-shift" />
      <div className="site-bg-orb site-bg-orb-a absolute rounded-full site-bg-orb-blur" />
      <div className="site-bg-orb site-bg-orb-b absolute rounded-full site-bg-orb-blur" />
      <div className="absolute inset-0 site-bg-grid opacity-30" />
      <div className="absolute inset-0 site-bg-stars opacity-30" />
      <div className="absolute inset-0 site-bg-vignette" />
      <div className="absolute inset-0 site-bg-noise" />
    </div>
  )
}
