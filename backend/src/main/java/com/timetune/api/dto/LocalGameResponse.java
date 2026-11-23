package com.timetune.api.dto;

import com.timetune.domain.GameSession;
import java.util.List;

public record LocalGameResponse(String gameId, List<PlayerSummary> players) {
    public static LocalGameResponse from(GameSession session) {
        return new LocalGameResponse(session.id(), session.players().stream().map(PlayerSummary::from).toList());
    }
}
