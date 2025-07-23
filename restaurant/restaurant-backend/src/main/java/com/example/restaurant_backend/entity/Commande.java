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
import java.time.ZoneOffset;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "commandes")
public class Commande {
    // Status constants for validation and consistency
    public static final String STATUS_CREE = "cree";
    public static final String STATUS_ATTENTE = "attente";
    public static final String STATUS_CONFIRMEE = "confirmee";
    public static final String STATUS_ANNULEE = "annulee";
    
    @Id
    private String id;
    private String restaurantId;
    private String creatorId;
    private String creatorName;
    private String status=STATUS_CREE; // 'cree', 'attente', 'confirmee', 'annulee'
    private double totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime orderDeadline; // Full date and time when order participation closes
    private List<Order> orders = new ArrayList<>();
    private boolean deleted = false;
    // Add manual override for auto-close
    private boolean manualOverride = false;
    
    // Utility methods for status management
    public boolean isCree() {
        return STATUS_CREE.equals(this.status);
    }
    
    public boolean isAttente() {
        return STATUS_ATTENTE.equals(this.status);
    }
    
    public boolean isConfirmee() {
        return STATUS_CONFIRMEE.equals(this.status);
    }
    
    public boolean isAnnulee() {
        return STATUS_ANNULEE.equals(this.status);
    }
    
    public boolean canAcceptParticipants() {
        return isCree() && !isExpired() && !deleted;
    }
    
    public boolean isExpired() {
        // Compare deadline-1h to now+1h for local time adjustment
        return orderDeadline != null && LocalDateTime.now(ZoneOffset.UTC).plusHours(1).isAfter(orderDeadline.minusHours(1));
    }
    
    public boolean shouldAutoClose() {
        // If manualOverride is true, do not auto-close
        return isCree() && isExpired() && !manualOverride;
    }
    
    // public void autoCloseIfExpired() {
    //     if (shouldAutoClose()) {
    //         this.status = STATUS_ATTENTE;
    //         this.updatedAt = LocalDateTime.now();
    //         this.manualOverride = false; // Reset override if auto-closed
    //     }
    // }
}