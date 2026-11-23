package com.timetune.audio;

import com.timetune.domain.Song;

public interface AudioProvider {
    PlaybackStatus prepare(Song song);
    PlaybackStatus status();
    void stop();
}
