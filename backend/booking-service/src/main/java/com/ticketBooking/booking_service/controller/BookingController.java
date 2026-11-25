
package com.ticketbooking.booking_service.controller;

import com.ticketbooking.booking_service.dto.BookingRequest;
import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.service.BookingService;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking createBooking(@Valid @RequestBody BookingRequest request) {

        return bookingService.createBooking(
                request.getUserId(),
                request.getShowId(),
                request.getTotalAmount()
        );
    }

    @GetMapping("/{id}")
    public Booking getBooking(@PathVariable Long id) {
        return bookingService.getBooking(id);
    }

@PatchMapping("/{id}/cancel")
public Booking cancelBooking(@PathVariable Long id) {
    return bookingService.cancelBooking(id);
}

@GetMapping("/user/{userId}")
public List<Booking> getBookingHistory(@PathVariable Long userId) {
    return bookingService.getBookingHistory(userId);
}

}
