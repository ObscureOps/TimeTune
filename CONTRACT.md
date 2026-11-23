# TimeTune API Contract

Version: 0.1.0 (backend foundation)

## Principles
- Backend is authoritative for song selection and metadata reveal.
- Prompt responses never include title, artist, year, genre, or artwork.
- Domain objects encapsulate state; controllers only translate HTTP requests/responses.
- Audio is provider-neutral. Development uses a mock provider; no streaming-provider integration is implemented.

## REST

### GET /api/health
Response: `{ "status": "UP" }`

### POST /api/games/local
Request: `{ "playerNames": ["Player 1", "Player 2"] }`
Response: `{ "gameId": "...", "players": [{ "id": "...", "name": "...", "tokens": 1, "officialCards": 0 }] }`
Creates a local session and draws its first song.

### GET /api/games/{gameId}/prompt
Response: `{ "songId": "...", "audioStatus": "MOCK_READY" }`
Must not expose identifying song metadata.

### POST /api/games/{gameId}/reveal
Response: `{ "songId": "...", "title": "...", "artist": "...", "year": 2000, "genre": "..." }`
Returns metadata for the current song. Reveal phase authorization/state gating is not implemented in this foundation milestone and must be added before gameplay integration.

## WebSocket
Not defined yet. Do not implement multiplayer messages until their payloads and authority rules are added here.

## Known foundation limitations
- The initial backend catalogue is a small development seed; it is not yet synchronized with the frontend dataset.
- Session persistence, turn progression, token actions, timeline placement, steal resolution, and phase validation are not implemented yet.
- Audio playback is mocked only.
