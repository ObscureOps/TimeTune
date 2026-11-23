
# TimeTune — Progress

Last updated: 2026-11-23

## Done

- Game frontend foundation — `frontend/` — React 19, TypeScript, Vite, and Tailwind CSS v4.
- Visual design system — `frontend/src/index.css` — dark editorial music aesthetic with red/orange and lime accents, Space Grotesk and DM Mono.
- Vinyl record visual — `frontend/src/App.tsx` — animated record and label.
- Tonearm visual — `frontend/src/App.tsx` — SVG tonearm with playback states.
- Countdown phase — `frontend/src/App.tsx` — countdown before listening begins.
- Listening phase — `frontend/src/App.tsx` — music playback and waveform progress.
- Guessing phase — `frontend/src/App.tsx` — song title and artist inputs.
- Reveal phase — `frontend/src/App.tsx` — displays song details and guess result.
- Timeline placement — `frontend/src/features/timeline/TimelinePlacement.tsx` — placement interface, chronological timeline, and timeline carry-forward between rounds.
- Multi-round gameplay state — `frontend/src/App.tsx` — tracks round number, used songs, official timeline, and draws the next unused configured song after placement.
- Token actions — `frontend/src/App.tsx` — skip song for 1 token and direct chronological claim for 3 tokens, with round progression and timeline carry-forward.
- Game state reducer — `frontend/src/App.tsx` — countdown, listening, guessing, reveal, and placement phases.
- Starting token correction — `frontend/src/App.tsx` — game begins with 1 token (confirmed rules).
- Token actions — `frontend/src/App.tsx` — skipping costs 1 token; direct claim costs 3 and adds the card in chronological order without placement risk. Token spending is disabled when insufficient tokens.
- Song dataset — `frontend/src/data/songs.json` — initial collection of 50 songs.
- Song type — `frontend/src/types/song.ts` — shared song data interface.
- Song selection — `frontend/src/utils/songUtils.ts` — random unused song selection.
- YouTube IFrame API integration — `frontend/src/features/player/YouTubePlayer.tsx` — embedded playback and player controls.
- YouTube player styling — `frontend/src/features/player/YouTubePlayer.css` — responsive embedded player.
- YouTube IDs — `frontend/src/data/songs.json` — initial five songs configured with video IDs.

## In progress

- Player reliability — `frontend/src/features/player/YouTubePlayer.tsx`
  - Shared YouTube API loader.
  - API loading timeout and retry handling.
  - Player lifecycle cleanup.
  - Safe playback controls.
  - Callback reference stability.
  - Playback error handling.

## Next up

1. Test multi-round timeline and token actions locally (`npm run build`).
2. Replace `YouTubePlayer.tsx` with the improved implementation.
2. Test API loading, player initialization, play, pause, replay, skip, and cleanup.
3. Verify playback behavior when changing songs.
4. Improve error messaging for unavailable or restricted videos.
5. Configure YouTube video IDs for the remaining songs.
6. Test the complete gameplay loop.
7. Review guess matching and token rules against `GAME-DESIGN.md`.
8. Implement the authoritative game rules in the backend.
9. Build the typed API client and mock layer.
10. Implement multiplayer rooms and server-authoritative turn handling.
11. Implement the server-enforced steal window.
12. Add reconnect and room-state recovery.
13. Polish responsive layouts and accessibility.

## Decisions / notes

- Preserve the existing TimeTune visual design.
- The player interface must remain independent of the game rules.
- The YouTube IFrame API is the current permitted audio implementation.
- Audio is embedded from YouTube and is not hosted by TimeTune.
- Song metadata remains in the song dataset.
- Playback errors must not crash the game.
- Spotify playback integration is not part of this implementation.
- Do not expose song title, artist, or year before the reveal phase in multiplayer.
- Follow `GAME-DESIGN.md` as the authoritative gameplay reference.
- Follow `MASTER-PROMPT.md` for technical conventions and delivery requirements.

## Current milestone

Milestone 2.6 — Token actions and rule alignment

Status: Implemented in GitHub; local build/test not run.

Files:
- `frontend/src/App.tsx` — stores official timeline, round count, and used song IDs; draws the next unused configured song and resets listening phases. Implements skip (1 token) and direct claim (3 tokens), with correct chronological insertion for direct claims.
- `frontend/src/features/timeline/TimelinePlacement.tsx` — accepts carried timeline state and reports successful placements to the game state. The initial reference song is used only for the first placement and is not carried into the official timeline.

## Next milestone

Milestone 2.7 — Steal mechanics and win condition
