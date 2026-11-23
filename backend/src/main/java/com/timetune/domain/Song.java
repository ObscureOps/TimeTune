package com.timetune.domain;

import java.util.Objects;

public record Song(String id, String title, String artist, int year, String genre) {
    public Song {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(artist, "artist must not be null");
        Objects.requireNonNull(genre, "genre must not be null");
        if (year < 1800 || year > 2100) throw new IllegalArgumentException("Invalid release year");
    }
}
