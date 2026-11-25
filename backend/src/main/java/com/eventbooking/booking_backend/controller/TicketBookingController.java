package com.eventbooking.booking_backend.controller;

import com.eventbooking.booking_backend.service.TicketBookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class TicketBookingController {
    private final TicketBookingService service;
    public TicketBookingController(TicketBookingService service) { this.service = service; }
    public record CreateRequest(@NotNull UUID showId, @NotEmpty @Size(max=6) List<@NotNull UUID> seatIds) {}
    public record CheckInRequest(@NotBlank String qrToken) {}

    @GetMapping("/shows")
    public List<TicketBookingService.ShowView> shows() { return service.shows(); }
    @PostMapping("/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketBookingService.BookingView create(@Valid @RequestBody CreateRequest request, Authentication auth) {
        return service.create(request.showId(), request.seatIds(), auth);
    }
    @GetMapping("/bookings")
    public List<TicketBookingService.BookingView> history(Authentication auth) { return service.history(null, auth); }
    @GetMapping("/bookings/user/{userId}")
    public List<TicketBookingService.BookingView> historyByUser(@PathVariable UUID userId, Authentication auth) {
        return service.history(userId, auth);
    }
    @GetMapping("/bookings/{id}")
    public TicketBookingService.BookingView get(@PathVariable UUID id, Authentication auth) { return service.get(id, auth); }
    @RequestMapping(path="/bookings/{id}/cancel", method={RequestMethod.POST, RequestMethod.PATCH})
    public TicketBookingService.BookingView cancel(@PathVariable UUID id, Authentication auth) { return service.cancel(id, auth); }
    @GetMapping("/bookings/{id}/ticket")
    public TicketBookingService.TicketView ticket(@PathVariable UUID id, Authentication auth) { return service.ticket(id, auth); }
    @PostMapping("/checkin")
    public Map<String,Object> checkIn(@Valid @RequestBody CheckInRequest request, Authentication auth) {
        return service.checkIn(request.qrToken(), auth);
    }
}
