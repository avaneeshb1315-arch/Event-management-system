package com.eventbooking.booking_backend.repository;

import com.eventbooking.booking_backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
}