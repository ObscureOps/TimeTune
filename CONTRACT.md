# TimeTune API Contract
Catalogue: GET /api/songs; GET /api/songs/{catalogueId}.
Game: POST /api/games body {"playerNames":["A","B"],"mode":"LOCAL"|"MULTIPLAYER"}; 2-8 players. POST /api/games/{id}/start. GET /api/games/{id}. GET /api/games/{id}/prompt returns songId/audioStatus only. POST /api/games/{id}/placement body {"playerId":"UUID","insertionIndex":0}. POST /api/games/{id}/reveal returns current metadata.
Security/maturity: prompt hides title/artist/year. Reveal is not phase-authorized yet. Sessions are in-memory. No websocket, persistence, auth, steals, or token endpoints.