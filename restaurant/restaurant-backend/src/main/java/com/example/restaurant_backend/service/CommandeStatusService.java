package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Commande;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class CommandeStatusService {
    
    private static final List<String> VALID_STATUSES = Arrays.asList(
        Commande.STATUS_CREATED,
        Commande.STATUS_Validated,
        Commande.STATUS_CONFIRMED,
        Commande.STATUS_CANCELLED
    );
    
    /**
     * Validate if a status is valid
     */
    public boolean isValidStatus(String status) {
        return VALID_STATUSES.contains(status);
    }
    
    /**
     * Check if status transition is allowed
     */
    public boolean isValidStatusTransition(String currentStatus, String newStatus) {
        if (!isValidStatus(newStatus)) {
            return false;
        }
        
        switch (currentStatus) {
            case Commande.STATUS_CREATED:
                // From CREATED can go to CLOSED, CONFIRMED, or CANCELLED
                return Arrays.asList(
                    Commande.STATUS_Validated,
                    Commande.STATUS_CONFIRMED,
                    Commande.STATUS_CANCELLED
                ).contains(newStatus);
                
            case Commande.STATUS_Validated:
                // From CLOSED can go to CONFIRMED or CANCELLED
                return Arrays.asList(
                    Commande.STATUS_CONFIRMED,
                    Commande.STATUS_CANCELLED
                ).contains(newStatus);
                
            case Commande.STATUS_CONFIRMED:
                // From CONFIRMED can only go to CANCELLED
                return Commande.STATUS_CANCELLED.equals(newStatus);
                
            case Commande.STATUS_CANCELLED:
                // CANCELLED is final state
                return false;
                
            default:
                return false;
        }
    }
    
    /**
     * Auto-close expired commands
     */
    public Commande autoCloseIfExpired(Commande commande) {
        if (commande.shouldAutoClose()) {
            commande.setStatus(Commande.STATUS_Validated);
            commande.setUpdatedAt(LocalDateTime.now());
        }
        return commande;
    }
    
    /**
     * Update command status with validation
     */
    public boolean updateStatus(Commande commande, String newStatus) {
        if (!isValidStatusTransition(commande.getStatus(), newStatus)) {
            return false;
        }
        
        commande.setStatus(newStatus);
        commande.setUpdatedAt(LocalDateTime.now());
        return true;
    }
    
    /**
     * Get user-friendly status message
     */
    public String getStatusMessage(String status) {
        switch (status) {
            case Commande.STATUS_CREATED:
                return "Ouvert aux participations";
            case Commande.STATUS_Validated:
                return "FermÃ© aux participations";
            case Commande.STATUS_CONFIRMED:
                return "Commande confirmÃ©e";
            case Commande.STATUS_CANCELLED:
                return "Commande annulÃ©e";
            default:
                return "Statut inconnu";
        }
    }
}
