package com.timetune.api.dto;

import jakarta.validation.constraints.Size;
import java.util.List;

public record LocalGameRequest(@Size(min = 2, max = 8) List<String> playerNames) { }
