package com.eventbooking.booking_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ByteArrayResource;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.InternetAddress;

@Service
public class TicketEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String senderEmail;

    public TicketEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTicket(
            String recipientEmail,
            String bookingId,
            byte[] pdf
    ) throws MessagingException {

        InternetAddress recipient =
            new InternetAddress(recipientEmail, true);

        recipient.validate();

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
            new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(senderEmail);
        helper.setTo(recipient);
        helper.setSubject("Community 360 - Booking Confirmed");

        helper.setText(
            "Dear Attendee,\n\n" +
            "Your event booking is confirmed.\n" +
            "Booking ID: " + bookingId + "\n\n" +
            "Please find your event ticket attached.\n\n" +
            "Thank you for booking with Community 360."
        );

        helper.addAttachment(
            "Community360_Ticket.pdf",
            new ByteArrayResource(pdf),
            "application/pdf"
        );

        mailSender.send(message);
    }
}
