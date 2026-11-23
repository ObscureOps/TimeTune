package com.timetune.api.dto;

import com.timetune.domain.Player;

public record PlayerSummary(String id, String name, int tokens, int officialCards) {
    public static PlayerSummary from(Player player) {
        return new PlayerSummary(player.id(), player.name(), player.tokenBank().balance(), player.timeline().size());
    }
}
