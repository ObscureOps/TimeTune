package com.timetune.api.dto;

import com.timetune.domain.Player;

public record PlayerSummary(String id, String name, int tokens, int officialCards) {
    public static PlayerSummary from(Player player) {
        return new PlayerSummary(player.getId().toString(), player.getDisplayName(), player.getTokenBank().getBalance(), player.getTimeline().getOfficialCards().size());
    }
}
