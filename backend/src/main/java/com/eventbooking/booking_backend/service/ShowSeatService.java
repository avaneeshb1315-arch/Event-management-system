package com.eventbooking.booking_backend.service;

import com.eventbooking.booking_backend.dto.SeatResponse;
import com.eventbooking.booking_backend.repository.ShowSeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class ShowSeatService {

    private final ShowSeatRepository repository;

    public ShowSeatService(ShowSeatRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeats(UUID showId, String block, String status, String priceTier) {
        return repository.findByShowId(showId).stream()
                .filter(ss -> block == null || ss.getSeat().getBlock().getName().equalsIgnoreCase(block))
                .filter(ss -> status == null || ss.getStatus().equalsIgnoreCase(status))
                .filter(ss -> priceTier == null || ss.getPriceTier().equalsIgnoreCase(priceTier))
                .map(ss -> new SeatResponse(
                        ss.getId(),
                        ss.getSeat().getBlock().getName(),
                        ss.getSeat().getRowLabel(),
                        ss.getSeat().getSeatNumber(),
                        ss.getStatus(),
                        ss.getPriceTier(),
                        ss.getPrice()))
                .toList();
    }
}