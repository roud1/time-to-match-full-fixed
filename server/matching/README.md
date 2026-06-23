# Matching Service

Orchestrates discover swipes (like/pass), mutual match creation, and compatibility-ranked feed.

## Structure

```
server/matching/
├── index.ts              # public exports
├── matching.service.ts   # recordLike, recordPass, getDiscoverFeed
├── compatibility.ts      # weighted scoring (interests, age, geo, activity)
├── repository.ts         # candidate queries, activity signals
└── types.ts              # domain types
```

## Compatibility weights

| Signal    | Weight | Method                          |
|-----------|--------|---------------------------------|
| Interests | 40%    | Jaccard on interest IDs         |
| Age       | 20%    | Fit vs viewer age preference    |
| Geo       | 25%    | Haversine distance              |
| Activity  | 15%    | Recency, completeness, swipes   |

## API flow

```
Client → api/handlers/discover/* → matchingService → repository / likes / match-engine
```

- **POST /api/discover/like** → `matchingService.recordLike` → `likes.createMutualMatchLikes` on mutual
- **POST /api/discover/pass** → `matchingService.recordPass`
- **GET /api/discover** → `matchingService.getDiscoverFeed` → ranked profiles with `compatibilityScore` + breakdown

## Response shape

```json
{
  "profiles": [{
    "id": "uuid",
    "compatibilityScore": 78,
    "compatibilityBreakdown": { "interests": 85, "age": 100, "geo": 62, "activity": 55 },
    "compatibility": 78
  }]
}
```

`compatibility` is kept for backward compatibility with existing clients.
