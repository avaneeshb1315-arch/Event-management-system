package com.eventbooking.booking_backend.service;

import com.eventbooking.booking_backend.dto.LockResponse;
import com.eventbooking.booking_backend.exception.ApiException;
import com.eventbooking.booking_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SeatLockService {

    private record Locked(UUID id, Instant until) {}

    private final NamedParameterJdbcTemplate jdbc;
    private final UserRepository users;

    @Value("${app.lock-seconds:600}")
    private int lockSeconds;

    @Value("${app.max-seats-per-booking:6}")
    private int maxSeats;

    public SeatLockService(NamedParameterJdbcTemplate jdbc, UserRepository users) {
        this.jdbc = jdbc;
        this.users = users;
    }

    @Transactional
    public LockResponse lock(UUID showId, List<UUID> seatIds, String email) {
        UUID userId = userIdOf(email);
        List<UUID> ids = seatIds.stream().distinct().toList();

        if (ids.size() > maxSeats) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MAX_SEATS_EXCEEDED",
                    "You can lock at most " + maxSeats + " seats");
        }

        Integer mine = jdbc.queryForObject(
                "SELECT COUNT(*) FROM show_seats WHERE show_id = :showId AND locked_by = :userId "
                        + "AND status = 'LOCKED' AND locked_until > NOW()",
                new MapSqlParameterSource().addValue("showId", showId).addValue("userId", userId),
                Integer.class);
        if (mine != null && mine + ids.size() > maxSeats) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MAX_SEATS_EXCEEDED",
                    "You can hold at most " + maxSeats + " seats for one show");
        }

        String sql = "UPDATE show_seats SET status = 'LOCKED', locked_by = :userId, "
                + "locked_until = NOW() + make_interval(secs => :secs) "
                + "WHERE show_id = :showId AND id IN (:ids) "
                + "AND (status = 'AVAILABLE' OR (status = 'LOCKED' AND locked_until < NOW())) "
                + "RETURNING id, locked_until";

        List<Locked> rows = jdbc.query(sql,
                new MapSqlParameterSource()
                        .addValue("userId", userId)
                        .addValue("secs", (double) lockSeconds)
                        .addValue("showId", showId)
                        .addValue("ids", ids),
                (rs, i) -> new Locked(rs.getObject("id", UUID.class),
                        rs.getTimestamp("locked_until").toInstant()));

        // All seats or none: any mismatch throws, and @Transactional rolls back.
        if (rows.size() != ids.size()) {
            throw new ApiException(HttpStatus.CONFLICT, "SEAT_TAKEN",
                    "Some seats were just taken. Please pick other seats.");
        }

        return new LockResponse(rows.stream().map(Locked::id).toList(), rows.get(0).until());
    }

    @Transactional
    public int release(UUID showId, List<UUID> seatIds, String email) {
        UUID userId = userIdOf(email);
        boolean hasIds = seatIds != null && !seatIds.isEmpty();

        String sql = "UPDATE show_seats SET status = 'AVAILABLE', locked_by = NULL, locked_until = NULL "
                + "WHERE show_id = :showId AND locked_by = :userId AND status = 'LOCKED'"
                + (hasIds ? " AND id IN (:ids)" : "");

        MapSqlParameterSource p = new MapSqlParameterSource()
                .addValue("showId", showId)
                .addValue("userId", userId);
        if (hasIds) p.addValue("ids", seatIds);

        return jdbc.update(sql, p);
    }

    private UUID userIdOf(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "User not found"))
                .getId();
    }
}