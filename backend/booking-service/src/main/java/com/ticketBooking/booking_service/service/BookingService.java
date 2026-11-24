
package com.ticketbooking.booking_service.service;

import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Booking createBooking(Long userId, Long showId,
                                 BigDecimal totalAmount) {

        Booking booking = new Booking();

        booking.setUserId(userId);
        booking.setShowId(showId);
        booking.setTotalAmount(totalAmount);
        booking.setBookingRef("TKT-" + UUID.randomUUID());
        booking.setStatus("PENDING");

        return bookingRepository.save(booking);
    }

    public Booking getBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));
    }

public Booking cancelBooking(Long id) {

    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Booking not found"));

    if (!"PENDING".equals(booking.getStatus())) {
        throw new RuntimeException("Only pending bookings can be cancelled");
    }

    booking.setStatus("CANCELLED");

    return bookingRepository.save(booking);
}

public List<Booking> getBookingHistory(Long userId) {
    return bookingRepository.findByUserId(userId);
}

}
