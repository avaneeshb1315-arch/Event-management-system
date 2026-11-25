package com.eventbooking.booking_backend.service;

import com.eventbooking.booking_backend.exception.ApiException;
import com.eventbooking.booking_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TicketBookingService {
    private final NamedParameterJdbcTemplate jdbc;
    private final UserRepository users;

    public TicketBookingService(NamedParameterJdbcTemplate jdbc, UserRepository users) {
        this.jdbc = jdbc;
        this.users = users;
    }

    public record BookingView(UUID id, String bookingRef, UUID showId, UUID userId,
                              String status, BigDecimal totalAmount, LocalDateTime createdAt,
                              LocalDateTime expiresAt) {}
    public record ShowView(UUID id, String title, LocalDateTime showTime, String status) {}
    public record TicketView(UUID bookingId, String bookingRef, String status, String qrToken) {}
    private record SeatPrice(UUID id, BigDecimal price, LocalDateTime until) {}
    private static final RowMapper<BookingView> BOOKING = (rs, n) -> new BookingView(
            rs.getObject("id", UUID.class), rs.getString("booking_ref"),
            rs.getObject("show_id", UUID.class), rs.getObject("user_id", UUID.class),
            rs.getString("status"), rs.getBigDecimal("total_amount"),
            rs.getObject("created_at", LocalDateTime.class), rs.getObject("expires_at", LocalDateTime.class));

    private ApiException error(HttpStatus status, String code, String message) {
        return new ApiException(status, code, message);
    }

    private UUID userId(Authentication auth) {
        if (auth == null) throw error(HttpStatus.UNAUTHORIZED, "LOGIN_REQUIRED", "Please sign in");
        return users.findByEmail(auth.getName()).orElseThrow(() ->
                error(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "User not found")).getId();
    }

    public List<ShowView> shows() {
        return jdbc.query("SELECT id, title, show_time, status FROM shows WHERE status = 'ACTIVE' ORDER BY show_time",
                Map.of(), (rs, n) -> new ShowView(rs.getObject("id", UUID.class), rs.getString("title"),
                        rs.getObject("show_time", LocalDateTime.class), rs.getString("status")));
    }

    @Transactional
    public BookingView create(UUID showId, List<UUID> seatIds, Authentication auth) {
        UUID user = userId(auth);
        if (showId == null || seatIds == null || seatIds.isEmpty() || seatIds.size() > 6 || seatIds.contains(null)
                || new HashSet<>(seatIds).size() != seatIds.size()) {
            throw error(HttpStatus.BAD_REQUEST, "INVALID_SEATS", "Choose 1 to 6 different seats");
        }
        var params = Map.of("show", showId, "user", user, "ids", seatIds);
        if (!Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM shows WHERE id=:show AND status='ACTIVE')", params, Boolean.class))) {
            throw error(HttpStatus.NOT_FOUND, "SHOW_NOT_FOUND", "Active show not found");
        }
        // Row locks serialize competing booking attempts for the same seats.
        var seats = jdbc.query("""
                SELECT id, price, locked_until FROM show_seats
                WHERE show_id=:show AND id IN (:ids) AND status='LOCKED'
                  AND locked_by=:user AND locked_until > CURRENT_TIMESTAMP
                ORDER BY id FOR UPDATE
                """, params, (rs, n) -> new SeatPrice(rs.getObject("id", UUID.class), rs.getBigDecimal("price"),
                rs.getObject("locked_until", LocalDateTime.class)));
        if (seats.size() != seatIds.size()) {
            throw error(HttpStatus.CONFLICT, "LOCK_REQUIRED", "Some selected seats are not held by you or the hold expired");
        }
        if (Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM booking_seats bs JOIN bookings b ON b.id=bs.booking_id
                WHERE bs.show_seat_id IN (:ids) AND
                ((b.status='PENDING' AND b.expires_at > CURRENT_TIMESTAMP) OR b.status IN ('CONFIRMED','CHECKED_IN')))
                """, params, Boolean.class))) {
            throw error(HttpStatus.CONFLICT, "ALREADY_ASSIGNED", "A selected seat already belongs to an active booking");
        }
        UUID id = UUID.randomUUID();
        String ref = "TKT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 26);
        BigDecimal total = seats.stream().map(SeatPrice::price).reduce(BigDecimal.ZERO, BigDecimal::add);
        LocalDateTime expires = seats.stream().map(SeatPrice::until).min(Comparator.naturalOrder()).orElseThrow();
        jdbc.update("""
                INSERT INTO bookings(id,booking_ref,show_id,user_id,status,total_amount,expires_at)
                VALUES(:id,:ref,:show,:user,'PENDING',:total,:expiry)
                """, Map.of("id",id,"ref",ref,"show",showId,"user",user,"total",total,"expiry",expires));
        for (SeatPrice seat : seats) {
            jdbc.update("INSERT INTO booking_seats(booking_id,show_seat_id,price_at_booking) VALUES(:id,:seat,:price)",
                    Map.of("id", id, "seat", seat.id(), "price", seat.price()));
        }
        return getOwned(id, user, false);
    }

    private BookingView getOwned(UUID id, UUID user, boolean lock) {
        var results = jdbc.query("SELECT * FROM bookings WHERE id=:id AND user_id=:user" + (lock ? " FOR UPDATE" : ""),
                Map.of("id", id, "user", user), BOOKING);
        if (results.isEmpty()) throw error(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Booking not found");
        return results.get(0);
    }

    public BookingView get(UUID id, Authentication auth) { return getOwned(id, userId(auth), false); }

    public List<BookingView> history(UUID requestedUser, Authentication auth) {
        UUID user = userId(auth);
        if (requestedUser != null && !requestedUser.equals(user))
            throw error(HttpStatus.FORBIDDEN, "FORBIDDEN", "You can only view your own bookings");
        return jdbc.query("SELECT * FROM bookings WHERE user_id=:user ORDER BY created_at DESC",
                Map.of("user", user), BOOKING);
    }

    @Transactional
    public BookingView cancel(UUID id, Authentication auth) {
        UUID user = userId(auth);
        BookingView booking = getOwned(id, user, true);
        if (!"PENDING".equals(booking.status()))
            throw error(HttpStatus.CONFLICT, "INVALID_TRANSITION", "Only unpaid pending bookings can be cancelled here");
        // Never release a newer hold after the booking's deadline. Paid cancellations belong to the payment/refund flow.
        jdbc.update("""
                UPDATE show_seats ss SET status='AVAILABLE', locked_by=NULL, locked_until=NULL
                WHERE ss.id IN (SELECT show_seat_id FROM booking_seats WHERE booking_id=:id)
                  AND ss.status='LOCKED' AND ss.locked_by=:user
                  AND :expiry > CURRENT_TIMESTAMP AND ss.locked_until >= :expiry
                  AND NOT EXISTS (SELECT 1 FROM booking_seats bs JOIN bookings b ON b.id=bs.booking_id
                       WHERE bs.show_seat_id=ss.id AND b.id<>:id AND b.status='PENDING' AND b.expires_at>CURRENT_TIMESTAMP)
                """, Map.of("id", id, "user", user, "expiry", booking.expiresAt()));
        jdbc.update("UPDATE bookings SET status='CANCELLED',cancelled_at=CURRENT_TIMESTAMP WHERE id=:id", Map.of("id",id));
        return getOwned(id, user, false);
    }

    public TicketView ticket(UUID id, Authentication auth) {
        UUID user = userId(auth);
        BookingView booking = getOwned(id, user, false);
        if (!Set.of("CONFIRMED", "CHECKED_IN").contains(booking.status()))
            throw error(HttpStatus.CONFLICT, "PAYMENT_REQUIRED", "Ticket is issued only after payment confirmation");
        String token = jdbc.queryForObject("SELECT qr_token FROM bookings WHERE id=:id", Map.of("id",id), String.class);
        if (token == null || token.isBlank()) throw error(HttpStatus.CONFLICT, "TICKET_NOT_READY", "Payment service has not issued a ticket token");
        return new TicketView(id, booking.bookingRef(), booking.status(), token);
    }

    @Transactional
    public Map<String,Object> checkIn(String token, Authentication auth) {
        userId(auth);
        if (auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            throw error(HttpStatus.FORBIDDEN, "ADMIN_REQUIRED", "Only staff administrators can check in tickets");
        if (token == null || token.isBlank()) throw error(HttpStatus.BAD_REQUEST, "INVALID_TICKET", "Ticket token required");
        var rows = jdbc.query("SELECT * FROM bookings WHERE qr_token=:token FOR UPDATE", Map.of("token",token), BOOKING);
        if (rows.size() != 1) throw error(HttpStatus.NOT_FOUND, "INVALID_TICKET", "Ticket not found or not unique");
        var booking = rows.get(0);
        if (!"CONFIRMED".equals(booking.status()))
            throw error(HttpStatus.CONFLICT, "INVALID_TRANSITION", "Ticket is not confirmed or has already been checked in");
        jdbc.update("UPDATE bookings SET status='CHECKED_IN',checked_in_at=CURRENT_TIMESTAMP WHERE id=:id", Map.of("id",booking.id()));
        return Map.of("bookingId",booking.id(),"status","CHECKED_IN");
    }
}
