"use client"

type ZoneConnectorProps = {
  label: string
}

export function ZoneConnector({ label }: ZoneConnectorProps) {
  return (
    <div className="xp-connector" aria-hidden>
      <span className="xp-connector__line" />
      <span className="xp-connector__dot" />
      <span className="xp-connector__label">{label}</span>
      <span className="xp-connector__dot" />
      <span className="xp-connector__line" />
    </div>
  )
}
