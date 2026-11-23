# TimeTune — Progress

Last updated: 2026-11-24

## Done

### Frontend
- Game frontend foundation — `frontend/` — React 19, TypeScript, Vite, Tailwind CSS v4.
- Visual design system — `frontend/src/index.css` — dark editorial music aesthetic with red/orange and lime accents, Space Grotesk and DM Mono.
- Vinyl record visual and tonearm.
- Countdown, listening, guessing, reveal, timeline placement, and victory phases.
- Multi-round gameplay state and unused-song selection.
- Token actions: skip song for 1 token and direct chronological claim for 3 tokens.
- Ten-card win condition.
- Song dataset — initial 50-song frontend collection.
- Local Mode frontend — lobby, editable names, rotating active-player indicator, player chip balances and timelines, steal picker, rebattle, successful ownership transfer, and pass-the-device handoff.
- Local round-resolution synchronization — finalized round ownership/timeline is passed directly into round advancement to avoid stale React state; steal token cost is persisted; temporary reference cards are excluded from official outcomes.

### Backend foundation — Milestone 4.0
- Maven/Spring Boot 3.4.4 project scaffold under `backend/`, targeting Java 21.
- OOP domain objects: `Song` record, encapsulated `Player`, `TokenBank`, `Timeline`, and `GameSession`.
- Timeline validates chronological insertion and allows same-year placements; win threshold is 10 official cards.
- TokenBank enforces the 5-token cap and prevents overspending.
- Song catalog repository with five development seed songs.
- GameSessionService creates local sessions, draws unused songs, and prepares audio through an abstraction.
- Provider-neutral `AudioProvider` interface and `MockAudioProvider`; no external streaming integration.
- REST endpoints: health, create local game, fetch metadata-free song prompt, and reveal metadata.
- DTOs separate API payloads from domain models.
- `CONTRACT.md` records endpoint shapes and known phase-validation limitations.
- Initial domain tests added for timeline ordering/same-year behavior and token balance.

## In progress

- Frontend Local Mode QA and edge-case verification. Build and browser testing have not been run in this environment.
- Backend foundation is committed to GitHub but has not been compiled or executed. The initial catalogue is only five seed entries and is not yet synchronized with the 50-song frontend catalogue.
- Backend session persistence, phase/turn validation, token actions, placement/steal rules, and frontend integration are not yet implemented.

## Next up

1. Verify backend build and tests using JDK 21 + Maven.
2. Expand/import the existing frontend song catalogue into a backend catalogue with stable IDs and metadata.
3. Add server-side game phase and turn state; gate reveal so metadata is unavailable before the reveal phase.
4. Implement server-authoritative placement, token actions, steal arbitration, and victory.
5. Define WebSocket contract for multiplayer only after REST/domain rules stabilize.
6. Add persistence and session recovery.
7. Create typed frontend API client and mock implementation using the same interface.
8. Connect Local Mode frontend to backend while preserving existing UI.
9. Continue frontend QA, responsive/accessibility review, and gameplay edge-case testing.

## Decisions / notes

- OOP is a core project requirement and learning objective. Favor encapsulated domain models, focused services, composition, interfaces, and polymorphism; avoid a monolithic GameManager.
- Preserve the existing TimeTune visual design.
- Game rules must remain independent of the audio provider.
- Intended product UX is audio-only during guessing: no title, artist, year, music video, album art, or artist imagery until reveal.
- Spotify was discussed as a desired music source, but Spotify platform use is restricted for music-guessing games. Do not implement Spotify SDK/API playback or workarounds. Use provider-neutral interfaces and mock audio for development.
- The current frontend still contains historical YouTube playback code; backend work must not treat that as the committed long-term audio architecture.
- No audio provider integration is confirmed. Playback errors must not crash the game.
- Do not expose song title, artist, or year before the reveal phase; backend prompt DTO intentionally contains only song ID and mock audio status.
- Follow `GAME-DESIGN.md` as gameplay source of truth and `MASTER-PROMPT.md` for technical conventions.

## Current milestone

Milestone 4.0 — OOP backend foundation

Status: Implemented in GitHub; compile/test not run.

Files:
- `CONTRACT.md` — initial REST API contract.
- `backend/pom.xml`, `backend/README.md` — Maven/Spring Boot project.
- `backend/src/main/java/com/timetune/domain/` — Song, Player, TokenBank, Timeline, GameSession.
- `backend/src/main/java/com/timetune/service/GameSessionService.java` — session creation and unused-song selection.
- `backend/src/main/java/com/timetune/repository/SongCatalog.java` — development seed catalogue.
- `backend/src/main/java/com/timetune/audio/` — provider interface and mock provider.
- `backend/src/main/java/com/timetune/api/` — health and local-game/prompt/reveal endpoints plus DTOs.
- `backend/src/test/java/com/timetune/domain/TimelineTest.java` — initial domain tests.

Limitations: no persistence, reveal phase gating, token action endpoints, placement resolution, steal arbitration, WebSocket multiplayer, frontend integration, or real audio playback yet. The prompt endpoint is metadata-free, but reveal is currently callable at any time; phase authorization is a next milestone.

## Previous milestone

Milestone 3.1 — Local round resolution synchronization

Status: Implemented in GitHub; local build/test not run.

- `frontend/src/features/timeline/TimelinePlacement.tsx` passes finalized round ownership/timeline into round advancement.
- `frontend/src/App.tsx` resolves card ownership and steal-chip deduction before win checks.

Remaining verification: run build/tests and manually check handoff privacy, direct claim score sync, chip sync, empty timeline rebattle, and steal-to-win.

