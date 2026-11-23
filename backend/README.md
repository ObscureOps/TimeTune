# TimeTune Backend

Spring Boot + Java 21 backend foundation. Domain logic is intentionally modeled with encapsulated OOP classes rather than a monolithic manager.

## Run

Prerequisites: JDK 21 and Maven.

```fish
cd backend
mvn spring-boot:run
```

## Current endpoints
- `GET /api/health`
- `POST /api/games/local` — create a 2–8 player local session
- `GET /api/games/{gameId}/prompt` — returns only song ID and mock audio state
- `POST /api/games/{gameId}/reveal` — returns song metadata

See root `CONTRACT.md` for request/response contracts and limitations.

Audio is currently mocked. No streaming-provider SDK or account authorization is included.
