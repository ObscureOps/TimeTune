package com.timetune.audio;

import com.timetune.domain.Song;
import org.springframework.stereotype.Component;

@Component
public final class MockAudioProvider implements AudioProvider {
    private PlaybackStatus status = PlaybackStatus.STOPPED;
    private String preparedSongId;

    @Override
    public PlaybackStatus prepare(Song song) {
        preparedSongId = song.id();
        status = PlaybackStatus.MOCK_READY;
        return status;
    }
    @Override
    public PlaybackStatus status() { return status; }
    @Override
    public void stop() {
        preparedSongId = null;
        status = PlaybackStatus.STOPPED;
    }
    public String preparedSongId() { return preparedSongId; }
}
