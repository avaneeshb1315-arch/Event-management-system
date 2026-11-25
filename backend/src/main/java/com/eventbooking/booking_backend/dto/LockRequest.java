package com.eventbooking.booking_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record LockRequest(@NotEmpty @Size(max = 6) List<UUID> seatIds) {}