package com.timetune.repository;
import com.timetune.domain.Song;
import java.util.List;
import java.util.Optional;
public interface SongRepository { List<Song> findAll(); Optional<Song> findByCatalogueId(String id); }