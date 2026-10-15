package com.campusbite.repository;

import com.campusbite.entity.PickupSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PickupSlotRepository
 * 
 * Spring Data JPA repository for PickupSlot entity.
 * Includes concurrency-safe pessimistic write lock for slot reservation verification.
 */
@Repository
public interface PickupSlotRepository extends JpaRepository<PickupSlot, Long> {

    List<PickupSlot> findByActiveTrueOrderByStartTimeAsc();

    Optional<PickupSlot> findByDisplayLabelIgnoreCase(String displayLabel);

    /**
     * Pessimistic write lock query to prevent race conditions during concurrent bookings.
     * When two students simultaneously attempt to book the last remaining slot,
     * this locks the slot row until the transaction commits, ensuring sequential capacity evaluation.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM PickupSlot s WHERE LOWER(s.displayLabel) = LOWER(:displayLabel)")
    Optional<PickupSlot> findByDisplayLabelWithLock(@Param("displayLabel") String displayLabel);

    boolean existsByDisplayLabelIgnoreCase(String displayLabel);
}
