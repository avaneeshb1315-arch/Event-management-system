package com.eventbooking.booking_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "seat_blocks")
@Getter @Setter
public class SeatBlock {
    @Id
    private UUID id;

    @Column(name = "venue_id")
    private UUID venueId;

    private String name;

    @Column(name = "block_type")
    private String blockType;

    private Integer capacity;

    @Column(name = "sort_order")
    private Integer sortOrder;
}