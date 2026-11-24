package com.eventbooking.booking_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "show_seats")
@Getter @Setter
public class ShowSeat {
    @Id
    private UUID id;

    @Column(name = "show_id")
    private UUID showId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id")
    private Seat seat;

    private String status;

    @Column(name = "price_tier")
    private String priceTier;

    private BigDecimal price;

    @Column(name = "locked_by")
    private UUID lockedBy;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;
}