package com.eventbooking.booking_backend;

import com.eventbooking.booking_backend.service.TicketPdfService;
import com.eventbooking.booking_backend.service.TicketEmailService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assumptions;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.util.ReflectionTestUtils;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class TicketDeliveryLocalTest {

    @Test
    void generateAndSendTicket() throws Exception {

        Assumptions.assumeTrue(
            Boolean.getBoolean("ticket.local.test"));

        TicketPdfService pdfService = new TicketPdfService();

        byte[] pdf = pdfService.generateTicket(
            "DEMO-NOT-VALID",
            "Test User",
            "Community 360 Test Event",
            "A1, A2",
            "1000"
        );

        try (var document = Loader.loadPDF(pdf)) {
            assertTrue(new PDFTextStripper()
                .getText(document)
                .contains("DEMO-NOT-VALID"));
        }

        Files.write(Path.of("target/SampleTicket.pdf"), pdf);

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("127.0.0.1");
        sender.setPort(1025);

        TicketEmailService emailService =
            new TicketEmailService(sender);

        ReflectionTestUtils.setField(
            emailService,
            "senderEmail",
            "community360@example.test"
        );

        emailService.sendTicket(
            "test@example.test",
            "DEMO-NOT-VALID",
            pdf
        );

        System.out.println("PDF GENERATED AND EMAIL SENT");
    }
}
