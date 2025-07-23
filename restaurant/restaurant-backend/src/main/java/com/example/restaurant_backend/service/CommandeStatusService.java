package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Commande;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class CommandeStatusService {
    
    private static final List<String> VALID_STATUSES = Arrays.asList(
        Commande.STATUS_CREE,
        Commande.STATUS_ATTENTE,
        Commande.STATUS_CONFIRMEE,
        Commande.STATUS_ANNULEE
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
            case Commande.STATUS_CREE:
                // From CREE can go to ATTENTE, CONFIRMEE, or ANNULEE
                return Arrays.asList(
                    Commande.STATUS_ATTENTE,
                    Commande.STATUS_CONFIRMEE,
                    Commande.STATUS_ANNULEE
                ).contains(newStatus);
                
            case Commande.STATUS_ATTENTE:
                // From ATTENTE can go to CONFIRMEE or ANNULEE
                return Arrays.asList(
                    Commande.STATUS_CONFIRMEE,
                    Commande.STATUS_ANNULEE
                ).contains(newStatus);
                
            case Commande.STATUS_CONFIRMEE:
                // From CONFIRMEE can only go to ANNULEE
                return Commande.STATUS_ANNULEE.equals(newStatus);
                
            case Commande.STATUS_ANNULEE:
                // ANNULEE is final state
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
            commande.setStatus(Commande.STATUS_ATTENTE);
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
            case Commande.STATUS_CREE:
                return "Ouvert aux participations";
            case Commande.STATUS_ATTENTE:
                return "En attente de paiement/confirmation";
            case Commande.STATUS_CONFIRMEE:
                return "Commande confirmée";
            case Commande.STATUS_ANNULEE:
                return "Commande annulée";
            default:
                return "Statut inconnu";
        }
    }
}
