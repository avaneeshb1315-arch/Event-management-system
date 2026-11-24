package com.eventbooking.booking_backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SeatResponse(
        UUID id,
        String block,
        String row,
        Integer number,
        String status,
        String priceTier,
        BigDecimal price) {
}