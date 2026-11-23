package com.timetune.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TimelineTest {
    @Test void permitsChronologicalAndSameYearInsertion() {
        Timeline timeline = new Timeline();
        Song first = new Song("a", "A", "Artist A", 1980, "Pop");
        Song sameYear = new Song("b", "B", "Artist B", 1980, "Rock");
        Song later = new Song("c", "C", "Artist C", 1990, "Pop");
        assertTrue(timeline.insert(0, first));
        assertTrue(timeline.insert(1, sameYear));
        assertTrue(timeline.insert(2, later));
        assertFalse(timeline.insert(1, new Song("d", "D", "Artist D", 2000, "Pop")));
    }
    @Test void tokenBankCapsAtFiveAndDoesNotOverspend() {
        TokenBank bank = new TokenBank(1);
        assertFalse(bank.spend(2));
        assertTrue(bank.spend(1));
        bank.earn(10);
        assertEquals(5, bank.balance());
    }
}
