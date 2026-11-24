package com.eventbooking.booking_backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record LockResponse(List<UUID> locked, Instant expiresAt) {}