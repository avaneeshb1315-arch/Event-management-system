package com.eventbooking.booking_backend.controller;

import com.eventbooking.booking_backend.dto.SeatResponse;
import com.eventbooking.booking_backend.service.ShowSeatService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shows")
public class ShowSeatController {

    private final ShowSeatService service;
    public ShowSeatController(ShowSeatService service) {
        this.service = service;
    }
    @GetMapping("/{showId}/seats")
    public List<SeatResponse> getSeats(
            @PathVariable UUID showId,
            @RequestParam(required = false) String block,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priceTier) {
        return service.getSeats(showId, block, status, priceTier);
    }
}