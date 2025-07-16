package com.example.restaurant_backend.controller;

import com.example.restaurant_backend.Exception.GlobalException;
import com.example.restaurant_backend.entity.Commande;
import com.example.restaurant_backend.service.CommandeService;
import jakarta.websocket.MessageHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = "http://localhost:4200")
public class

CommandeController {
    private CommandeService commandeService;

    public CommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    // Create
    @PostMapping
    public ResponseEntity<Commande> createCommande(@RequestBody Commande commande) {
        try {
            System.out.println("🔄 Creating commande with deadline: " + commande.getOrderDeadline());
            
            // Use enhanced validation method
            Commande savedCommande = this.commandeService.saveCommandeWithValidation(commande);
            
            System.out.println("✅ Successfully created commande: " + savedCommande.getId() + 
                             " with status: " + savedCommande.getStatus() + 
                             " and deadline: " + savedCommande.getOrderDeadline());
            
            return ResponseEntity.status(201).body(savedCommande);
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Validation error creating commande: " + e.getMessage());
            throw new GlobalException("Invalid commande data: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Error creating commande: " + e.getMessage());
            throw new GlobalException("Failed to create commande: " + e.getMessage());
        }
    }

    // Read all
    @GetMapping
    public ResponseEntity<List<Commande>> getAllCommandes() {
        try {
            List<Commande> commandes = this.commandeService.getAllCommandes();
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commandes: " + e.getMessage());
        }
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<Commande> getCommandeById(@PathVariable String id) {
        try {
            Optional<Commande> commande = this.commandeService.getCommandeById(id);
            if (commande.isPresent()) {
                return ResponseEntity.ok(commande.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commande: " + e.getMessage());
        }
    }

    // Read by Restaurant ID
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Commande>> getCommandesByRestaurantId(@PathVariable String restaurantId) {
        try {
            List<Commande> commandes = this.commandeService.getCommandesByRestaurantId(restaurantId);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commandes by restaurant: " + e.getMessage());
        }
    }

    // Read by Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Commande>> getCommandesByStatus(@PathVariable String status) {
        try {
            List<Commande> commandes = this.commandeService.getCommandesByStatus(status);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commandes by status: " + e.getMessage());
        }
    }

    // Read by Creator ID
    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<Commande>> getCommandesByCreatorId(@PathVariable String creatorId) {
        try {
            List<Commande> commandes = this.commandeService.getCommandesByCreatorId(creatorId);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commandes by creator: " + e.getMessage());
        }
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Commande> updateCommande(@PathVariable String id, @RequestBody Commande commande) {
        try {
            Commande updatedCommande = this.commandeService.updateCommande(id, commande);
            if (updatedCommande != null) {
                return ResponseEntity.ok(updatedCommande);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to update commande: " + e.getMessage());
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommande(@PathVariable String id) {
        try {
            boolean deleted = this.commandeService.deleteCommande(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to delete commande: " + e.getMessage());
        }
    }

    // Check if exists
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> commandeExists(@PathVariable String id) {
        try {
            boolean exists = this.commandeService.existsById(id);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            throw new GlobalException("Failed to check commande existence: " + e.getMessage());
        }
    }
    @PatchMapping("/{commandeId}/total")
    public ResponseEntity<Commande> updateCommandTotal(@PathVariable String commandeId, @RequestBody java.util.Map<String, Object> updates) {
        try {
            System.out.println("ðŸ”„ Received request to update commande total:");
            System.out.println("   Commande ID: " + commandeId);
            System.out.println("   Updates: " + updates);
            
            if (!updates.containsKey("totalPrice")) {
                System.err.println("âŒ Missing totalPrice in request body");
                return ResponseEntity.badRequest().build();
            }
            
            // Extract totalPrice from the request body
            Double totalPrice = ((Number) updates.get("totalPrice")).doubleValue();
            System.out.println("   Total Price: " + totalPrice);
            
            Commande updatedCommande = this.commandeService.updateCommandeTotal(commandeId, totalPrice);
            
            if (updatedCommande != null) {
                System.out.println("âœ… Successfully updated commande " + commandeId + " total to: " + totalPrice);
                return ResponseEntity.ok(updatedCommande);
            }
            
            System.err.println("âŒ Commande not found: " + commandeId);
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            System.err.println("âŒ Error updating commande total: " + e.getMessage());
            e.printStackTrace();
            throw new GlobalException("Failed to update commande total: " + e.getMessage());
        }
    }

    // Manual trigger to recalculate commande total from orders
    @PostMapping("/{commandeId}/recalculate-total")
    public ResponseEntity<Commande> recalculateCommandeTotal(@PathVariable String commandeId) {
        try {
            System.out.println("ðŸ”„ Manual recalculation triggered for commande: " + commandeId);
            
            Commande updatedCommande = this.commandeService.recalculateAndUpdateTotal(commandeId);
            
            if (updatedCommande != null) {
                System.out.println("âœ… Successfully recalculated commande " + commandeId + " total to: " + updatedCommande.getTotalPrice());
                return ResponseEntity.ok(updatedCommande);
            }
            
            System.err.println("âŒ Commande not found: " + commandeId);
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            System.err.println("âŒ Error recalculating commande total: " + e.getMessage());
            e.printStackTrace();
            throw new GlobalException("Failed to recalculate commande total: " + e.getMessage());
        }
    }
    
    // Update commande status
    @PatchMapping("/{commandeId}/status")
    public ResponseEntity<Commande> updateCommandeStatus(
            @PathVariable String commandeId,
            @RequestBody Map<String, Object> updates) {
        try {
            if (!updates.containsKey("status")) {
                return ResponseEntity.badRequest().build();
            }

            String newStatus = updates.get("status").toString();
            Commande updatedCommande = this.commandeService.updateCommandeStatus(commandeId, newStatus);

            if (updatedCommande != null) {
                System.out.println("✅ Successfully updated commande " + commandeId + " status to: " + newStatus);
                return ResponseEntity.ok(updatedCommande);
            }

            return ResponseEntity.notFound().build();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update commande status: " + e.getMessage());
        }
    }

    // Auto-close expired commandes
    @PostMapping("/auto-close-expired")
    public ResponseEntity<Void> autoCloseExpiredCommandes() {
        try {
            System.out.println("🔄 Auto-close expired commandes triggered");
            
            this.commandeService.checkAndAutoCloseExpiredCommandes();
            
            System.out.println("✅ Auto-close expired commandes completed");
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            System.err.println("❌ Error auto-closing expired commandes: " + e.getMessage());
            e.printStackTrace();
            throw new GlobalException("Failed to auto-close expired commandes: " + e.getMessage());
        }
    }
    
    // Force expiration check (bypasses caching)
    @PostMapping("/force-expiration-check")
    public ResponseEntity<String> forceExpirationCheck() {
        try {
            System.out.println("🔄 Force expiration check triggered");
            
            this.commandeService.forceExpirationCheck();
            
            System.out.println("✅ Force expiration check completed");
            return ResponseEntity.ok("Force expiration check completed successfully");
            
        } catch (Exception e) {
            System.err.println("❌ Error during force expiration check: " + e.getMessage());
            e.printStackTrace();
            throw new GlobalException("Failed to perform force expiration check: " + e.getMessage());
        }
    }
    
    // Check expiration for specific commande
    @PostMapping("/{commandeId}/check-expiration")
    public ResponseEntity<Commande> checkCommandeExpiration(@PathVariable String commandeId) {
        try {
            System.out.println("🔄 Checking expiration for commande: " + commandeId);
            
            Commande updatedCommande = this.commandeService.checkAndUpdateSingleCommande(commandeId);
            
            if (updatedCommande != null) {
                System.out.println("✅ Expiration check completed for commande: " + commandeId);
                return ResponseEntity.ok(updatedCommande);
            }
            
            System.err.println("❌ Commande not found: " + commandeId);
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            System.err.println("❌ Error checking expiration for commande " + commandeId + ": " + e.getMessage());
            e.printStackTrace();
            throw new GlobalException("Failed to check expiration for commande: " + e.getMessage());
        }
    }
    
    // Debug time info
    @GetMapping("/debug/time-info")
    public ResponseEntity<java.util.Map<String, Object>> getTimeInfo() {
        java.util.Map<String, Object> timeInfo = new java.util.HashMap<>();
        
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime nowPlusBuffer = now.plusMinutes(2);
        
        timeInfo.put("server_time", now.toString());
        timeInfo.put("server_time_plus_buffer", nowPlusBuffer.toString());
        timeInfo.put("server_timezone", java.time.ZoneId.systemDefault().toString());
        timeInfo.put("server_timestamp", System.currentTimeMillis());
        
        System.out.println("Debug time info requested: " + timeInfo);
        
        return ResponseEntity.ok(timeInfo);
    }
    
    @GetMapping("/validate-deadline")
    public ResponseEntity<java.util.Map<String, Object>> validateDeadline(@RequestParam String deadline) {
        System.out.println("Validating deadline: " + deadline);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        
        try {
            java.time.LocalDateTime deadlineDateTime = java.time.LocalDateTime.parse(deadline);
            boolean isValid = commandeService.validateDeadline(deadlineDateTime);
            
            response.put("success", true);
            response.put("isValid", isValid);
            response.put("deadline", deadline);
            
            if (!isValid) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                long minutesDiff = java.time.Duration.between(now, deadlineDateTime).toMinutes();
                response.put("minutesDifference", minutesDiff);
                response.put("message", minutesDiff < 0 ? "Deadline is in the past" : "Deadline is too close (need at least 2 minutes buffer)");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error validating deadline: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Invalid deadline format");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
