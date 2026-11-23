package com.timetune.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class Timeline {
    private final List<Song> officialCards = new ArrayList<>();

    public List<Song> cards() { return Collections.unmodifiableList(officialCards); }
    public int size() { return officialCards.size(); }
    public boolean hasWon() { return size() >= 10; }
    public boolean canInsertAt(int index, Song song) {
        if (song == null || index < 0 || index > officialCards.size()) return false;
        boolean afterPrevious = index == 0 || officialCards.get(index - 1).year() <= song.year();
        boolean beforeNext = index == officialCards.size() || song.year() <= officialCards.get(index).year();
        return afterPrevious && beforeNext;
    }
    public boolean insert(int index, Song song) {
        if (!canInsertAt(index, song)) return false;
        officialCards.add(index, song);
        return true;
    }
    public boolean remove(Song song) { return officialCards.remove(song); }
}
