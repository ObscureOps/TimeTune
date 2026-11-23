package com.timetune.repository;

import com.timetune.domain.Song;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class SongCatalog {
    private final List<Song> songs = List.of(
        new Song("seed-001", "Bohemian Rhapsody", "Queen", 1975, "Rock"),
        new Song("seed-002", "Billie Jean", "Michael Jackson", 1982, "Pop"),
        new Song("seed-003", "Like a Prayer", "Madonna", 1989, "Pop"),
        new Song("seed-004", "Smells Like Teen Spirit", "Nirvana", 1991, "Rock"),
        new Song("seed-005", "Wonderwall", "Oasis", 1995, "Britpop")
    );
    public List<Song> all() { return songs; }
    public Optional<Song> findById(String id) { return songs.stream().filter(song -> song.id().equals(id)).findFirst(); }
}
