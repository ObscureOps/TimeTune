package com.timetune.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record LocalGameRequest(
    @NotNull @Size(min = 2, max = 8) List<@NotBlank String> playerNames
) { }
