package com.timetune.domain;

import java.util.Objects;
import java.util.UUID;

public final class Player {
    private final UUID id;
    private final String displayName;
    private final Timeline timeline;
    private final TokenBank tokenBank;
    public Player(UUID id, String displayName, Song temporaryReference) {
        this.id = Objects.requireNonNull(id, "id");
        if (displayName == null || displayName.isBlank()) throw new IllegalArgumentException("displayName cannot be blank");
        this.displayName = displayName.trim();
        timeline = new Timeline(temporaryReference);
        tokenBank = new TokenBank();
    }
    public static Player create(String displayName, Song temporaryReference) {
        return new Player(UUID.randomUUID(), displayName, temporaryReference);
    }
    public UUID getId() { return id; }
    public String getDisplayName() { return displayName; }
    public Timeline getTimeline() { return timeline; }
    public TokenBank getTokenBank() { return tokenBank; }
}
