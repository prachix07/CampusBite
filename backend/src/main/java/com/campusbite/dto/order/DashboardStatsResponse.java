package com.campusbite.dto.order;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DashboardStatsResponse
 * 
 * Aggregated statistics for the Canteen Admin Dashboard.
 * All figures computed from real MySQL database records.
 */
public class DashboardStatsResponse {

    private long todayOrders;
    private long pendingOrders;
    private long preparingOrders;
    private long readyOrders;
    private BigDecimal todayRevenue;
    private long totalOrders;
    private long collectedOrders;
    private long cancelledOrders;
    private long rejectedOrders;
    private LocalDate reportDate;
    private List<OrderResponse> recentOrders;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long todayOrders, long pendingOrders, long preparingOrders, 
                                  long readyOrders, BigDecimal todayRevenue, long totalOrders, 
                                  long collectedOrders, long cancelledOrders, long rejectedOrders,
                                  LocalDate reportDate, List<OrderResponse> recentOrders) {
        this.todayOrders = todayOrders;
        this.pendingOrders = pendingOrders;
        this.preparingOrders = preparingOrders;
        this.readyOrders = readyOrders;
        this.todayRevenue = todayRevenue;
        this.totalOrders = totalOrders;
        this.collectedOrders = collectedOrders;
        this.cancelledOrders = cancelledOrders;
        this.rejectedOrders = rejectedOrders;
        this.reportDate = reportDate;
        this.recentOrders = recentOrders;
    }

    public long getTodayOrders() { return todayOrders; }
    public void setTodayOrders(long todayOrders) { this.todayOrders = todayOrders; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getPreparingOrders() { return preparingOrders; }
    public void setPreparingOrders(long preparingOrders) { this.preparingOrders = preparingOrders; }

    public long getReadyOrders() { return readyOrders; }
    public void setReadyOrders(long readyOrders) { this.readyOrders = readyOrders; }

    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getCollectedOrders() { return collectedOrders; }
    public void setCollectedOrders(long collectedOrders) { this.collectedOrders = collectedOrders; }

    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public long getRejectedOrders() { return rejectedOrders; }
    public void setRejectedOrders(long rejectedOrders) { this.rejectedOrders = rejectedOrders; }

    public LocalDate getReportDate() { return reportDate; }
    public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }

    public List<OrderResponse> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<OrderResponse> recentOrders) { this.recentOrders = recentOrders; }
}
