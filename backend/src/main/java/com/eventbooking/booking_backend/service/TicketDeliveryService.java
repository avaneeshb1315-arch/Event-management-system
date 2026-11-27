package com.eventbooking.booking_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TicketDeliveryService {

    private static final Logger log =
        LoggerFactory.getLogger(TicketDeliveryService.class);

    private final TicketPdfService pdfService;
    private final TicketEmailService emailService;

    public TicketDeliveryService(
            TicketPdfService pdfService,
            TicketEmailService emailService) {

        this.pdfService = pdfService;
        this.emailService = emailService;
    }

    public record BookingConfirmed(
        String bookingId,
        String name,
        String email,
        String event,
        String seats,
        String amount
    ) {}

    @TransactionalEventListener(
        phase = TransactionPhase.AFTER_COMMIT
    )
    public void deliver(BookingConfirmed booking) {

        try {
            byte[] pdf = pdfService.generateTicket(
                booking.bookingId(),
                booking.name(),
                booking.event(),
                booking.seats(),
                booking.amount()
            );

            emailService.sendTicket(
                booking.email(),
                booking.bookingId(),
                pdf
            );

            log.info("Ticket email sent for booking {}",
                booking.bookingId());

        } catch (Exception ex) {
            log.error("Ticket delivery failed for booking {}",
                booking.bookingId());
        }
    }
}
