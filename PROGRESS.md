
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
- Placement lock and steal window — `frontend/src/features/timeline/TimelinePlacement.tsx` — player locks their slot before a pass/reveal or simulated steal rebattle; steal costs one token and correct placements cannot be stolen. The current solo simulation does not yet transfer ownership to a second player's timeline.
- Multi-round gameplay state — `frontend/src/App.tsx` — tracks round number, used songs, official timeline, and draws the next unused configured song after placement.
- Token actions — `frontend/src/App.tsx` — skip song for 1 token and direct chronological claim for 3 tokens, with round progression and timeline carry-forward.
- Ten-card win condition — `frontend/src/App.tsx` — correct placements and direct claims trigger a victory screen when the official timeline reaches 10 cards.
- Game state reducer — `frontend/src/App.tsx` — countdown, listening, guessing, reveal, placement, and victory phases.
- Starting token correction — `frontend/src/App.tsx` — game begins with 1 token (confirmed rules).
- Token chip UI — `frontend/src/App.tsx`, `frontend/src/index.css` — clickable chip balance opens a power-up menu; color changes by balance (red at 0, ivory at 1, black/gold at 2, gold at 3+). Skip (1) and Direct Claim (3) are available there.
- Song dataset — `frontend/src/data/songs.json` — initial collection of 50 songs.
- Song type — `frontend/src/types/song.ts` — shared song data interface.
- Song selection — `frontend/src/utils/songUtils.ts` — random unused song selection.
- YouTube IFrame API integration — `frontend/src/features/player/YouTubePlayer.tsx` — embedded playback and player controls.
- YouTube player styling — `frontend/src/features/player/YouTubePlayer.css` — responsive embedded player.
- YouTube IDs — `frontend/src/data/songs.json` — initial five songs configured with video IDs.

## In progress

- Local Mode — lobby, rotating active-player indicator, per-player chip balances, individual timeline persistence between turns, and player selection in the steal window are implemented. Steal picker excludes the current player and disables players with zero chips. Reveal feedback now labels steal success/failure and explains the result. Full rebattle ownership transfer is still pending.


- Player reliability — `frontend/src/features/player/YouTubePlayer.tsx`
  - Shared YouTube API loader.
  - API loading timeout and retry handling.
  - Player lifecycle cleanup.
  - Safe playback controls.
  - Callback reference stability.
  - Playback error handling.

## Next up

1. Complete local steal rebattle against the selected player's timeline and transfer card ownership.
2. Test local lobby and game flow (`npm run build`).
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

Milestone 2.8b — Local turn state and steal selection

Status: Implemented in GitHub; local build/test not run.

Files:
- `frontend/src/App.tsx` — tracks active player, rotates turns, preserves player chip balances and timelines between turns, and shows active player in the top bar.
- `frontend/src/features/timeline/TimelinePlacement.tsx` — steal window presents a player picker. Current player is excluded; players with no chips are disabled; choosing a stealer commits the chip and opens rebattle placement. Reveal feedback identifies steal success/failure.
- `frontend/src/features/timeline/TimelinePlacement.css` — picker and reveal result styles.

Limitations: selected stealer's timeline is not yet loaded for rebattle, and a successful steal does not yet transfer the official card into that player's timeline. This milestone establishes selection and local turn state; ownership resolution remains next.

## Previous milestone

Milestone 2.7b — Placement lock and steal-window simulation

Status: Implemented in GitHub; local build/test not run.

Files:
- `frontend/src/features/timeline/TimelinePlacement.tsx` — placement is locked first; a steal window appears before reveal. The user can pass or spend one token to simulate a steal and choose a rebattle slot. Song reveal happens after the decision. A correctly placed original card is protected from stealing.
- `frontend/src/App.tsx` — connects simulated steal token cost to the token balance.
- `frontend/src/features/timeline/TimelinePlacement.css` — styles steal-window controls.

Limitation: This is a single-player simulation only. It does not model first-commit arbitration, a separate opponent timeline, or transfer ownership. Those require player state/multiplayer.

## Previous milestone

Milestone 2.7 — Win condition

Status: Implemented in GitHub; local build/test not run.

Files:
- `frontend/src/App.tsx` — checks official timeline count after correct placements and direct claims; switches to a victory phase at 10 official cards and shows a victory screen with restart action. Temporary reference card is excluded because it is not stored in the official timeline.

Note: Steal mechanics are deferred until player/opponent state and multiplayer turn flow exist. The current single-player prototype cannot accurately simulate the confirmed first-commit, token-cost, and card-transfer rules.

## Next milestone

Milestone 2.7c — Persistent player timelines and opponent ownership
