package com.timetune.domain;

import java.util.Objects;
import java.util.UUID;

public final class Player {
    private final String id;
    private final String name;
    private final TokenBank tokenBank;
    private final Timeline timeline;

    public Player(String name) {
        this(UUID.randomUUID().toString(), name, new TokenBank(1), new Timeline());
    }
    public Player(String id, String name, TokenBank tokenBank, Timeline timeline) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name).trim();
        if (this.name.isBlank()) throw new IllegalArgumentException("Player name must not be blank");
        this.tokenBank = Objects.requireNonNull(tokenBank);
        this.timeline = Objects.requireNonNull(timeline);
    }
    public String id() { return id; }
    public String name() { return name; }
    public TokenBank tokenBank() { return tokenBank; }
    public Timeline timeline() { return timeline; }
}
