# TimeTune Backend

Initial backend foundation: Java 21 + Spring Boot. The domain layer is provider-neutral and encapsulates game invariants.

## Run

Requires Java 21 and Gradle 8+ installed:

```fish
cd backend
gradle bootRun
```

The Gradle wrapper is not included yet.

## Architecture

- `domain/`: OOP models and game invariants.
- `service/`: application/game orchestration (next milestone).
- `controller/`: REST transport (next milestone).
- Audio remains provider-neutral; use mock playback states during development.
