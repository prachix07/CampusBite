package com.campusbite.repository;

import com.campusbite.entity.Order;
import com.campusbite.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * OrderRepository
 * 
 * Spring Data JPA repository for Order entity.
 * Provides capacity counting, slot tracking, and student order history queries.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    /**
     * Counts active orders booked for a specific date and pickup slot.
     * Excludes CANCELLED and REJECTED orders so that cancelled slots are freed up!
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.pickupDate = :date AND o.pickupSlot = :slot AND o.status NOT IN :excludedStatuses")
    long countBookedOrdersForSlot(
            @Param("date") LocalDate date, 
            @Param("slot") String slot, 
            @Param("excludedStatuses") Collection<OrderStatus> excludedStatuses
    );

    boolean existsByOrderNumber(String orderNumber);
}
