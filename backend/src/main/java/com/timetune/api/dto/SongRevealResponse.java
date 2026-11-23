package com.timetune.api.dto;

import com.timetune.domain.Song;

public record SongRevealResponse(String songId, String title, String artist, int year, String genre) {
    public static SongRevealResponse from(Song song) {
        return new SongRevealResponse(song.id(), song.title(), song.artist(), song.year(), song.genre());
    }
}
