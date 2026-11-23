package com.timetune.service;

import com.timetune.audio.AudioProvider;
import com.timetune.domain.GameSession;
import com.timetune.domain.Player;
import com.timetune.domain.Song;
import com.timetune.repository.SongCatalog;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {
    private final SongCatalog catalog;
    private final AudioProvider audioProvider;
    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();

    public GameSessionService(SongCatalog catalog, AudioProvider audioProvider) {
        this.catalog = catalog;
        this.audioProvider = audioProvider;
    }
    public GameSession createLocalGame(List<String> playerNames) {
        List<Player> players = playerNames.stream().map(Player::new).toList();
        GameSession session = new GameSession(players);
        drawNextSong(session);
        sessions.put(session.id(), session);
        return session;
    }
    public GameSession get(String gameId) {
        GameSession session = sessions.get(gameId);
        if (session == null) throw new IllegalArgumentException("Game session not found: " + gameId);
        return session;
    }
    public Song drawNextSong(GameSession session) {
        List<Song> available = catalog.all().stream().filter(song -> !session.hasUsedSong(song.id())).toList();
        if (available.isEmpty()) throw new IllegalStateException("No unused songs remain in the catalogue");
        Song selected = available.get((int) (Math.random() * available.size()));
        session.drawSong(selected);
        audioProvider.prepare(selected);
        return selected;
    }
}
