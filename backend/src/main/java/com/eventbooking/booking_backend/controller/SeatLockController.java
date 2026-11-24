package com.eventbooking.booking_backend.controller;

import com.eventbooking.booking_backend.dto.LockRequest;
import com.eventbooking.booking_backend.dto.LockResponse;
import com.eventbooking.booking_backend.service.SeatLockService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/shows/{showId}/lock")
public class SeatLockController {

    private final SeatLockService service;

    public SeatLockController(SeatLockService service) {
        this.service = service;
    }

    @PostMapping
    public LockResponse lock(@PathVariable UUID showId,
                             @Valid @RequestBody LockRequest req,
                             Authentication authentication) {
        return service.lock(showId, req.seatIds(), authentication.getName());
    }

    @DeleteMapping
    public Map<String, Object> release(@PathVariable UUID showId,
                                       @RequestBody(required = false) LockRequest req,
                                       Authentication authentication) {
        int released = service.release(showId, req == null ? null : req.seatIds(), authentication.getName());
        return Map.of("released", released);
    }
}