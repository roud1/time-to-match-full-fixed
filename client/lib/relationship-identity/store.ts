import type { RelationshipIdentity, RelationshipPersonality } from "@/client/lib/relationship-identity/types"

const KEY = "ttm-relationship-identity"
const VERSION = 1

type Store = {
  version: number
  byProfile: Record<string, RelationshipIdentity>
}

const DEFAULT: Store = { version: VERSION, byProfile: {} }

function load(): Store {
  if (typeof window === "undefined") return { ...DEFAULT }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT }
  }
}

function save(s: Store) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function getRelationshipIdentity(profileId: number): RelationshipIdentity | undefined {
  return load().byProfile[String(profileId)]
}

export function persistRelationshipIdentity(identity: RelationshipIdentity) {
  const s = load()
  const prev = s.byProfile[String(identity.profileId)]
  if (prev && prev.personality !== identity.personality) {
    identity = { ...identity, updatedAt: Date.now() }
  }
  s.byProfile[String(identity.profileId)] = identity
  save(s)
}

export function touchPersonality(
  profileId: number,
  personality: RelationshipPersonality
): RelationshipPersonality {
  const prev = getRelationshipIdentity(profileId)
  if (!prev) return personality
  if (prev.personality === personality) return personality
  return personality
}
