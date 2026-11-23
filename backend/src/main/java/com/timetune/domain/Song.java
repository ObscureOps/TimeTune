package com.timetune.domain;

import java.util.Objects;
import java.util.UUID;

/** Domain entity for catalogue metadata. Audio delivery is intentionally provider-neutral. */
public final class Song {
    private final UUID id;
    private final String title;
    private final String artist;
    private final int releaseYear;
    private final String genre;

    public Song(UUID id, String title, String artist, int releaseYear, String genre) {
        this.id = Objects.requireNonNull(id, "id");
        this.title = requireText(title, "title");
        this.artist = requireText(artist, "artist");
        if (releaseYear < 1 || releaseYear > 9999) throw new IllegalArgumentException("releaseYear must be valid");
        this.releaseYear = releaseYear;
        this.genre = genre == null || genre.isBlank() ? "Unknown" : genre.trim();
    }
    public static Song create(String title, String artist, int releaseYear, String genre) {
        return new Song(UUID.randomUUID(), title, artist, releaseYear, genre);
    }
    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(field + " cannot be blank");
        return value.trim();
    }
    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public int getReleaseYear() { return releaseYear; }
    public String getGenre() { return genre; }
}
