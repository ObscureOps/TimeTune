# TimeTune Backend
Java 21 + Spring Boot OOP backend.
## Run
`cd backend && gradle bootRun` (requires Java 21 and Gradle 8; wrapper not committed).
## Included
- 50 song seed catalogue, synced to frontend seed metadata.
- Repository abstraction, deterministic UUIDs, SongCatalogService.
- GameSession/Player/Timeline/TokenBank domain, session creation, turn selection, chronological placement, 10-card win.
- REST endpoints for songs and game lifecycle.
- Mock audio provider.
## Endpoints
- GET /api/songs and /api/songs/{catalogueId}
- POST /api/games body: {"playerNames":["A","B"],"mode":"LOCAL"}
- POST /api/games/{id}/start; GET /api/games/{id}; GET /api/games/{id}/prompt
- POST /api/games/{id}/placement body: {"playerId":"UUID","insertionIndex":0}
- POST /api/games/{id}/reveal
Sessions are in-memory. Steals, token actions, persistence, websocket, auth, frontend integration and real audio are not implemented. Reveal timing needs stricter phase enforcement before production.