# TimeTune API Contract

## Status
No API endpoints or WebSocket event shapes are finalized yet. This document must be updated before either frontend or backend depends on new transport contracts.

## Planned REST surface (not implemented)
- `POST /api/games` — create a game session.
- `POST /api/games/{gameId}/players` — add a player to a waiting session.
- `POST /api/games/{gameId}/start` — start a session.
- `GET /api/games/{gameId}` — retrieve current game state with phase-safe song metadata.

## Planned real-time surface (not implemented)
WebSocket/STOMP vs raw WebSocket remains undecided. Planned event categories: player joined/ready, game started, turn changed, placement committed, steal window opened/closed, reveal, tokens updated, game finished.

## Security/data boundary
Song title, artist, and release year must not be sent to clients before the reveal phase. Audio integration is provider-neutral and mock-based during development.
