package com.timetune.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/** Aggregate root for a session; game rules remain independent of HTTP and audio. */
public final class GameSession {
    public enum Mode { LOCAL, MULTIPLAYER }
    public enum Status { WAITING, ACTIVE, FINISHED }
    private final UUID id;
    private final Mode mode;
    private final List<Player> players = new ArrayList<>();
    private final List<UUID> usedSongIds = new ArrayList<>();
    private Status status = Status.WAITING;
    private int activePlayerIndex;
    public GameSession(UUID id, Mode mode) { this.id = Objects.requireNonNull(id); this.mode = Objects.requireNonNull(mode); }
    public static GameSession create(Mode mode) { return new GameSession(UUID.randomUUID(), mode); }
    public UUID getId() { return id; }
    public Mode getMode() { return mode; }
    public Status getStatus() { return status; }
    public List<Player> getPlayers() { return Collections.unmodifiableList(players); }
    public List<UUID> getUsedSongIds() { return Collections.unmodifiableList(usedSongIds); }
    public int getActivePlayerIndex() { return activePlayerIndex; }
    public Player getActivePlayer() { if (players.isEmpty()) throw new IllegalStateException("No players in session"); return players.get(activePlayerIndex); }
    public void addPlayer(Player player) {
        if (status != Status.WAITING) throw new IllegalStateException("Players can only join while waiting");
        if (players.size() >= 8) throw new IllegalStateException("Room is full");
        players.add(Objects.requireNonNull(player));
    }
    public void start() {
        if (players.size() < 2) throw new IllegalStateException("At least two players are required");
        if (status != Status.WAITING) throw new IllegalStateException("Session cannot be started");
        status = Status.ACTIVE;
    }
    public void markSongUsed(Song song) {
        if (status != Status.ACTIVE) throw new IllegalStateException("Session is not active");
        if (usedSongIds.contains(song.getId())) throw new IllegalStateException("Song already used in this session");
        usedSongIds.add(song.getId());
    }
    public void advanceTurn() { if (status == Status.ACTIVE) activePlayerIndex = (activePlayerIndex + 1) % players.size(); }
    public void checkWinner() { if (players.stream().anyMatch(p -> p.getTimeline().hasWon())) status = Status.FINISHED; }
}
