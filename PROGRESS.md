# TimeTune Progress

## Backend milestone
Implemented: Java/Spring OOP foundation; 50-song catalogue matching frontend seed; repository/service; stable UUID mapping; game creation for 2-8 players; unique temporary reference songs; start/prompt/turn progression; chronological placement; 10-card win check; REST controllers; mock audio provider; legacy UUID API conflicts reconciled.

## Recent fix
Removed the redundant `TimeTuneBackendApplication.java` Spring Boot entry point. `TimeTuneApplication.java` remains the single application entry point, resolving Gradle's ambiguity about which main class to launch.

Commit: `90e313ec28d10a50ac28a5da5f0443cc550ac956`

## Verification status
- Earlier compile errors were resolved after pulling commit `5832247`.
- Local `gradle bootRun` then failed at `:resolveMainClassName` because two Spring Boot main classes were present.
- The duplicate entry point has now been removed on GitHub.
- **Not yet verified:** the user must pull the latest commit and run `gradle bootRun` locally to confirm the backend builds and starts successfully.
- No build/test execution has been performed by this assistant in a local project environment.

## Limitations
In-memory sessions; no persistence, multiplayer synchronization, authentication, token/steal actions, frontend integration, or real audio. Reveal endpoint currently exposes metadata on request without phase authorization and must be tightened before production.

## Frontend build fix
Fixed TypeScript strict optional-value errors in local round resolution by guarding the optional `outcome.timeline` and providing safe empty-timeline fallbacks when indexing saved timelines.

Commit: `09f68eff8a1f2b9649617c49940b515af021e3d8`

- **Not yet verified locally:** run `npm run build` from `frontend` after pulling this commit.

## Next step
Pull the latest `master`, rerun the frontend build from `frontend`, and then proceed to frontend-backend integration.

OOP remains central: domain encapsulates rules; services orchestrate; repository abstracts catalogue.
