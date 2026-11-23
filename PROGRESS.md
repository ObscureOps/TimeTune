# TimeTune Progress

## Current milestone: Backend foundation (in progress)

### Completed in this milestone
- Added Java 21 Spring Boot backend project structure.
- Added application entry point and basic server configuration.
- Added OOP domain models: `Song`, `Player`, `Timeline`, `TokenBank`, and `GameSession`.
- Encapsulated player token economy (1 starting token, 5-token cap).
- Encapsulated official timeline, temporary reference-card handling, chronological validation, and 10-card win check.
- Added session mode/status, player roster, turn index, and used-song tracking.
- Kept domain models independent of HTTP and audio provider concerns.

### Not yet completed / not verified
- No repository build or automated tests have been run in this environment.
- No database, repositories, REST controllers, services, API contract, or WebSocket support yet.
- No frontend API integration.
- No real audio provider integration. Playback remains a provider-neutral future interface/mock.
- Gradle wrapper is not yet committed.

## Next concrete step
Add domain unit tests and focused game services for token actions, timeline placement, session setup, and song selection; then add the first REST API and document its contract before frontend integration.

## Project principles
- Java + Spring Boot backend; React/Vite/TypeScript frontend.
- OOP is a central learning goal: encapsulated domain behavior, composition, focused responsibilities, and no monolithic game manager.
- Server-authoritative game rules for multiplayer.
- Provider-neutral audio; mock states for development.
- Preserve the existing frontend design unless redesign is requested.

Reminder: save local changes and commit/push them to GitHub after each milestone.
