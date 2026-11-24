package com.eventbooking.booking_backend.repository;

import com.eventbooking.booking_backend.entity.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface ShowSeatRepository extends JpaRepository<ShowSeat, UUID> {

    @Query("""
        SELECT ss FROM ShowSeat ss
        JOIN FETCH ss.seat s
        JOIN FETCH s.block b
        WHERE ss.showId = :showId
        ORDER BY b.sortOrder, s.rowLabel, s.seatNumber
        """)
    List<ShowSeat> findByShowId(@Param("showId") UUID showId);
}