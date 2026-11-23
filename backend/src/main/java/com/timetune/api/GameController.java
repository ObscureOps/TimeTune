package com.timetune.api;

import com.timetune.audio.AudioProvider;
import com.timetune.api.dto.LocalGameRequest;
import com.timetune.api.dto.LocalGameResponse;
import com.timetune.api.dto.SongPromptResponse;
import com.timetune.api.dto.SongRevealResponse;
import com.timetune.domain.GameSession;
import com.timetune.service.GameSessionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
public class GameController {
    private final GameSessionService sessions;
    private final AudioProvider audioProvider;
    public GameController(GameSessionService sessions, AudioProvider audioProvider) {
        this.sessions = sessions;
        this.audioProvider = audioProvider;
    }
    @PostMapping("/local")
    public LocalGameResponse createLocal(@Valid @RequestBody LocalGameRequest request) {
        return LocalGameResponse.from(sessions.createLocalGame(request.playerNames()));
    }
    @GetMapping("/{gameId}/prompt")
    public SongPromptResponse prompt(@PathVariable String gameId) {
        GameSession session = sessions.get(gameId);
        return new SongPromptResponse(session.currentSong().id(), audioProvider.status().name());
    }
    @PostMapping("/{gameId}/reveal")
    public SongRevealResponse reveal(@PathVariable String gameId) {
        return SongRevealResponse.from(sessions.get(gameId).currentSong());
    }
}
