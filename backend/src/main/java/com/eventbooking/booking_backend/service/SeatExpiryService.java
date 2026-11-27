package com.eventbooking.booking_backend.service;

import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SeatExpiryService {

    private final JdbcTemplate jdbc;

    public SeatExpiryService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Scheduled(fixedDelay = 5000)
    public void releaseExpiredSeats() {
        jdbc.update("""
            UPDATE show_seats
            SET status = 'AVAILABLE',
                locked_by = NULL,
                locked_until = NULL
            WHERE status = 'LOCKED'
              AND locked_until <= NOW()
            """);
    }
}
