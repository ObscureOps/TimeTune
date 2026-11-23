package com.timetune.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Owns chronological official cards and the temporary first-placement reference. */
public final class Timeline {
    private final List<Song> officialCards = new ArrayList<>();
    private Song temporaryReference;
    public Timeline(Song temporaryReference) { this.temporaryReference = temporaryReference; }
    public List<Song> getOfficialCards() { return Collections.unmodifiableList(officialCards); }
    public Song getTemporaryReference() { return temporaryReference; }
    public int getOfficialCardCount() { return officialCards.size(); }
    public boolean hasWon() { return officialCards.size() >= 10; }

    /** Index is 0..official-card-count; when empty, 0 means before reference and 1 after it. */
    public boolean isPlacementCorrect(Song candidate, int insertionIndex) {
        if (officialCards.isEmpty() && temporaryReference != null) {
            if (insertionIndex < 0 || insertionIndex > 1) return false;
            return insertionIndex == 0
                ? candidate.getReleaseYear() <= temporaryReference.getReleaseYear()
                : candidate.getReleaseYear() >= temporaryReference.getReleaseYear();
        }
        if (insertionIndex < 0 || insertionIndex > officialCards.size()) return false;
        Song previous = insertionIndex > 0 ? officialCards.get(insertionIndex - 1) : null;
        Song next = insertionIndex < officialCards.size() ? officialCards.get(insertionIndex) : null;
        return (previous == null || previous.getReleaseYear() <= candidate.getReleaseYear())
            && (next == null || candidate.getReleaseYear() <= next.getReleaseYear());
    }
    public void addOfficialCard(Song song, int insertionIndex) {
        if (!isPlacementCorrect(song, insertionIndex)) throw new IllegalArgumentException("Invalid chronological placement");
        int safeIndex = Math.min(insertionIndex, officialCards.size());
        officialCards.add(safeIndex, song);
        temporaryReference = null;
    }
    public void transferCardIn(Song song) {
        int index = 0;
        while (index < officialCards.size() && officialCards.get(index).getReleaseYear() <= song.getReleaseYear()) index++;
        officialCards.add(index, song);
        temporaryReference = null;
    }
}
