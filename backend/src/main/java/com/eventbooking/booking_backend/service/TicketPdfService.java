package com.eventbooking.booking_backend.service;

import org.springframework.stereotype.Service;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class TicketPdfService {

    public byte[] generateTicket(
            String bookingId,
            String name,
            String event,
            String seats,
            String amount
    ) throws IOException {

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A5);
            document.addPage(page);

            PDType1Font bold = new PDType1Font(
                Standard14Fonts.FontName.HELVETICA_BOLD);

            PDType1Font normal = new PDType1Font(
                Standard14Fonts.FontName.HELVETICA);

            try (PDPageContentStream content =
                     new PDPageContentStream(document, page)) {

                content.beginText();
                content.setFont(bold, 24);
                content.newLineAtOffset(35, 540);
                content.showText("COMMUNITY 360");

                content.setFont(bold, 15);
                content.newLineAtOffset(0, -35);
                content.showText("EVENT BOOKING TICKET");

                content.setFont(normal, 11);

                String[] details = {
                    "Booking ID: " + bookingId,
                    "Attendee: " + name,
                    "Event: " + event,
                    "Seats: " + seats,
                    "Amount Paid: INR " + amount,
                    "Status: CONFIRMED",
                    "Thank you for booking with Community 360."
                };

                for (String line : details) {
                    content.newLineAtOffset(0, -32);
                    content.showText(
                        line.replaceAll("[^\\x20-\\x7E]", "?")
                    );
                }

                content.endText();
            }

            document.save(output);
            return output.toByteArray();
        }
    }
}
