
package com.ticketbooking.booking_service.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


public class BookingRequest {
    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be positive")
    private Long userId;

    @NotNull(message = "Show ID is required")
    @Positive(message = "Show ID must be positive")
    private Long showId;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
