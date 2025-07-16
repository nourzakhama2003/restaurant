package com.example.restaurant_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.example.restaurant_backend.entity.Order;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "commandes")
public class Commande {
    // Status constants for validation and consistency
    public static final String STATUS_CREATED = "created";
    public static final String STATUS_Validated = "validated";
    public static final String STATUS_CONFIRMED = "confirmed";
    public static final String STATUS_CANCELLED = "cancelled";
    
    @Id
    private String id;
    private String restaurantId;
    private String creatorId;
    private String creatorName;
    private String status=STATUS_CREATED; // 'created', 'closed', 'confirmed', 'cancelled'
    private double totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime orderDeadline; // Full date and time when order participation closes
    private List<Order> orders = new ArrayList<>();
    private boolean deleted = false;
    
    // Utility methods for status management
    public boolean isCreated() {
        return STATUS_CREATED.equals(this.status);
    }
    
    public boolean isClosed() {
        return STATUS_Validated.equals(this.status);
    }
    
    public boolean isConfirmed() {
        return STATUS_CONFIRMED.equals(this.status);
    }
    
    public boolean isCancelled() {
        return STATUS_CANCELLED.equals(this.status);
    }
    
    public boolean canAcceptParticipants() {
        return isCreated() && !isExpired() && !deleted;
    }
    
    public boolean isExpired() {
        return orderDeadline != null && LocalDateTime.now().isAfter(orderDeadline);
    }
    
    public boolean shouldAutoClose() {
        return isCreated() && isExpired();
    }
    
    public void autoCloseIfExpired() {
        if (shouldAutoClose()) {
            this.status = STATUS_Validated;
            this.updatedAt = LocalDateTime.now();
        }
    }
}