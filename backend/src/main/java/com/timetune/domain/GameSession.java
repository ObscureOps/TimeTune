package com.timetune.domain;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public final class GameSession {
    private final String id = UUID.randomUUID().toString();
    private final List<Player> players;
    private final Set<String> usedSongIds = new HashSet<>();
    private Song currentSong;
    private int activePlayerIndex;

    public GameSession(List<Player> players) {
        if (players == null || players.size() < 2 || players.size() > 8) throw new IllegalArgumentException("A local game requires 2 to 8 players");
        this.players = new ArrayList<>(players);
    }
    public String id() { return id; }
    public List<Player> players() { return List.copyOf(players); }
    public Player activePlayer() { return players.get(activePlayerIndex); }
    public int activePlayerIndex() { return activePlayerIndex; }
    public Song currentSong() { return currentSong; }
    public boolean hasUsedSong(String songId) { return usedSongIds.contains(songId); }
    public void drawSong(Song song) {
        if (song == null) throw new IllegalArgumentException("Song is required");
        if (usedSongIds.contains(song.id())) throw new IllegalStateException("Song has already been used in this session");
        currentSong = song;
        usedSongIds.add(song.id());
    }
    public void advancePlayer() { activePlayerIndex = (activePlayerIndex + 1) % players.size(); }
}
