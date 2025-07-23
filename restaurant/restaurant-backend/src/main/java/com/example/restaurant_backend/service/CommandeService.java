package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Commande;
import com.example.restaurant_backend.entity.Order;
import com.example.restaurant_backend.entity.Restaurant;
import com.example.restaurant_backend.repository.CommandeRepository;
import com.example.restaurant_backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.example.restaurant_backend.dto.CommandeWithRestaurantDto;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.ZoneOffset;

@Service
public class CommandeService {
    private CommandeRepository commandeRepository;
    private OrderRepository orderRepository;
    private RestaurantService restaurantService;
    
    // Cache for expiration check to avoid too frequent database calls
    private LocalDateTime lastExpirationCheck = LocalDateTime.now().minusMinutes(5);
    private static final int EXPIRATION_CHECK_INTERVAL_MINUTES = 1; // Check every minute

    public CommandeService(CommandeRepository commandeRepository, OrderRepository orderRepository, RestaurantService restaurantService) {
        this.commandeRepository = commandeRepository;
        this.orderRepository = orderRepository;
        this.restaurantService = restaurantService;
    }
    
    /**
     * Smart expiration check with caching to prevent excessive database calls
     */
    private void smartExpirationCheck() {
        LocalDateTime now = LocalDateTime.now();
        
        // Only check if enough time has passed since last check
        if (now.isAfter(lastExpirationCheck.plusMinutes(EXPIRATION_CHECK_INTERVAL_MINUTES))) {
            checkAndAutoCloseExpiredCommandes();
            lastExpirationCheck = now;
        }
    }
    
    /**
     * Force expiration check (bypasses caching)
     */
    public void forceExpirationCheck() {
        checkAndAutoCloseExpiredCommandes();
        lastExpirationCheck = LocalDateTime.now();
    }

    // Create
    public Commande saveCommande(Commande commande) {
        // First save the commande to get an ID
        Commande savedCommande = this.commandeRepository.save(commande);
        
        // If there are orders, save them with the commande ID
        if (savedCommande.getOrders() != null && !savedCommande.getOrders().isEmpty()) {
            List<Order> savedOrders = new ArrayList<>();
            
            for (Order order : savedCommande.getOrders()) {
                // Set the commande ID for the order
                order.setCommandeId(savedCommande.getId());
                
                // Save the order
                Order savedOrder = this.orderRepository.save(order);
                savedOrders.add(savedOrder);
            }
            
            // Update the commande with the saved orders
            savedCommande.setOrders(savedOrders);
            return this.commandeRepository.save(savedCommande);
        }
        
        return savedCommande;
    }

    // Read all
    public List<Commande> getAllCommandes() {
        // Smart auto-check for expired commandes before returning
        smartExpirationCheck();
        List<Commande> commandes = this.commandeRepository.findAll();
        // Attach orders to each commande
        for (Commande commande : commandes) {
            List<Order> orders = this.orderRepository.findByCommandeIdAndDeletedFalse(commande.getId());
            commande.setOrders(orders);
        }
        return commandes;
    }

    // Read by ID
    public Optional<Commande> getCommandeById(String id) {
        Optional<Commande> commande = this.commandeRepository.findById(id);
        
        // Auto-check this specific commande for expiration
        if (commande.isPresent()) {
            Commande cmd = commande.get();
            if (cmd.shouldAutoClose()) {
                // cmd.autoCloseIfExpired(); // Method is now commented out
                // If you want to handle expiration, add custom logic here
                System.out.println("[INFO] Expired commande detected: " + cmd.getId());
            }
            // Force expiration check for this commande
            cmd = forceExpirationCheckForCommande(cmd.getId());
            return Optional.of(cmd);
        }
        
        return commande;
    }

    // Read by ID with restaurant information
    public Optional<CommandeWithRestaurantDto> getCommandeWithRestaurantById(String id) {
        Optional<Commande> commande = this.commandeRepository.findById(id);
        
        if (commande.isPresent()) {
            Commande cmd = commande.get();
            
            // Auto-check this specific commande for expiration
            if (cmd.shouldAutoClose()) {
                // cmd.autoCloseIfExpired(); // Method is now commented out
                // If you want to handle expiration, add custom logic here
                System.out.println("[INFO] Expired commande detected: " + cmd.getId());
            }
            
            // Get restaurant information
            String restaurantName = "Unknown Restaurant";
            if (cmd.getRestaurantId() != null) {
                Optional<Restaurant> restaurant = this.restaurantService.getRestaurantById(cmd.getRestaurantId());
                if (restaurant.isPresent()) {
                    restaurantName = restaurant.get().getName();
                }
            }
            
            return Optional.of(CommandeWithRestaurantDto.fromCommande(cmd, restaurantName));
        }
        
        return Optional.empty();
    }

    // Read by Restaurant ID
    public List<Commande> getCommandesByRestaurantId(String restaurantId) {
        // Smart auto-check for expired commandes before returning
        smartExpirationCheck();
        return this.commandeRepository.findByRestaurantId(restaurantId);
    }

    // Read by Status
    public List<Commande> getCommandesByStatus(String status) {
        smartExpirationCheck();
        List<Commande> commandes = this.commandeRepository.findByStatusIgnoreCase(status);
        for (Commande commande : commandes) {
            List<Order> orders = this.orderRepository.findByCommandeIdAndDeletedFalse(commande.getId());
            commande.setOrders(orders);
        }
        return commandes;
    }

    // Read by Creator ID
    public List<Commande> getCommandesByCreatorId(String creatorId) {
        // Smart auto-check for expired commandes before returning
        smartExpirationCheck();
        return this.commandeRepository.findByCreatorId(creatorId);
    }

    // Update
    public Commande updateCommande(String id, Commande commande) {
        if (this.commandeRepository.existsById(id)) {
            commande.setId(id);
            return this.commandeRepository.save(commande);
        }
        return null;
    }

    // Delete
    public boolean deleteCommande(String id) {
        if (this.commandeRepository.existsById(id)) {
            this.commandeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Check if exists
    public boolean existsById(String id) {
        return this.commandeRepository.existsById(id);
    }

    public Commande updateCommandeTotal(String commandeId, double totalPrice) {
        try {
            System.out.println("ðŸ”„ Service: Updating commande total for ID: " + commandeId);
            
            Optional<Commande> optionalCommande = this.commandeRepository.findById(commandeId);
            
            if (optionalCommande.isEmpty()) {
                System.err.println("âŒ Service: Commande not found with ID: " + commandeId);
                return null;
            }
            
            Commande commande = optionalCommande.get();
            double oldTotal = commande.getTotalPrice();
            
            commande.setTotalPrice(totalPrice);
            Commande savedCommande = this.commandeRepository.save(commande);
            
            System.out.println("âœ… Service: Successfully updated commande total from " + oldTotal + " to " + totalPrice);
            
            return savedCommande;
            
        } catch (Exception e) {
            System.err.println("âŒ Service: Error updating commande total: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update commande total", e);
        }
    }

    public Commande recalculateAndUpdateTotal(String commandeId) {
        try {
            System.out.println("ðŸ”„ Service: Recalculating total for commande: " + commandeId);
            
            Optional<Commande> optionalCommande = this.commandeRepository.findById(commandeId);
            
            if (optionalCommande.isEmpty()) {
                System.err.println("âŒ Service: Commande not found with ID: " + commandeId);
                return null;
            }
            
            Commande commande = optionalCommande.get();
            
            // Get all orders for this commande
            List<Order> allOrders = this.orderRepository.findByCommandeId(commandeId);
            List<Order> activeOrders = allOrders.stream()
                .filter(order -> !order.isDeleted())
                .toList();
                
            System.out.println("ðŸ“‹ Found " + activeOrders.size() + " active orders for commande: " + commandeId);
            
            // Update the commande's orders list
            commande.setOrders(activeOrders);
            
            // Calculate total from orders (excluding deleted ones)
            double newTotal = activeOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
            
            double oldTotal = commande.getTotalPrice();
            System.out.println("ðŸ’° Calculated total: " + newTotal + " (was: " + oldTotal + ")");
            
            // Update commande total
            commande.setTotalPrice(newTotal);
            Commande savedCommande = this.commandeRepository.save(commande);
            
            System.out.println("âœ… Service: Successfully updated commande orders list and total from " + oldTotal + " to " + newTotal);
            
            return savedCommande;
            
        } catch (Exception e) {
            System.err.println("âŒ Service: Error recalculating commande total: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to recalculate commande total", e);
        }
    }
    
    // Centralized method to update status and manualOverride, and save
    private Commande setStatusAndOverride(Commande commande, String newStatus, Boolean manualOverride) {
        commande.setStatus(newStatus);
        commande.setUpdatedAt(java.time.LocalDateTime.now());
        if (manualOverride != null) {
            commande.setManualOverride(manualOverride);
        }
        return this.commandeRepository.save(commande);
    }

    // Update commande status
    public Commande updateCommandeStatus(String commandeId, String newStatus) {
        try {
            Optional<Commande> optionalCommande = this.commandeRepository.findById(commandeId);
            if (optionalCommande.isPresent()) {
                Commande commande = optionalCommande.get();
                if (!isValidStatus(newStatus)) {
                    throw new IllegalArgumentException("Invalid status: " + newStatus);
                }
                if (Commande.STATUS_CREE.equals(newStatus)) {
                    commande.setStatus(newStatus);
                    commande.setUpdatedAt(java.time.LocalDateTime.now());
                    commande.setManualOverride(true);
                    Commande savedCommande = this.commandeRepository.save(commande);
                    System.out.println("✅ Service: Successfully updated commande " + commandeId + " status to: " + newStatus + ", manualOverride=" + savedCommande.isManualOverride());
                    // Print stack trace for debugging
                    new Exception("[DEBUG] Status changed to '" + newStatus + "' for commande " + commandeId).printStackTrace();
                    return savedCommande;
                } else {
                    commande.setStatus(newStatus);
                    commande.setUpdatedAt(java.time.LocalDateTime.now());
                    commande.setManualOverride(false);
                    Commande savedCommande = this.commandeRepository.save(commande);
                    System.out.println("✅ Service: Successfully updated commande " + commandeId + " status to: " + newStatus + ", manualOverride=" + savedCommande.isManualOverride());
                    // Print stack trace for debugging
                    new Exception("[DEBUG] Status changed to '" + newStatus + "' for commande " + commandeId).printStackTrace();
                    return savedCommande;
                }
            }
            System.err.println("❌ Service: Commande not found: " + commandeId);
            return null;
        } catch (Exception e) {
            System.err.println("❌ Service: Error updating commande status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update commande status", e);
        }
    }
    
    // Check and auto-close expired commandes
    public void checkAndAutoCloseExpiredCommandes() {
        try {
            long startTime = System.currentTimeMillis();
            List<Commande> createdCommandes = this.commandeRepository.findByStatusAndDeletedFalse(Commande.STATUS_CREE);
            int closedCount = 0;
            int checkedCount = 0;
            System.out.println("[AUTO-CLOSE] Checking " + createdCommandes.size() + " commandes with status 'cree'");
            for (Commande commande : createdCommandes) {
                // Reload the latest version from the database
                Optional<Commande> latestOpt = this.commandeRepository.findById(commande.getId());
                if (latestOpt.isEmpty()) continue;
                Commande latestCommande = latestOpt.get();
                checkedCount++;
                System.out.println("[AUTO-CLOSE] Checking commande " + latestCommande.getId() + ": status=" + latestCommande.getStatus() + ", deadline=" + latestCommande.getOrderDeadline() + ", deadline-1h=" + (latestCommande.getOrderDeadline() != null ? latestCommande.getOrderDeadline().minusHours(1) : null) + ", now=" + java.time.LocalDateTime.now(ZoneOffset.UTC) + ", manualOverride=" + latestCommande.isManualOverride());
                // Only auto-close if manualOverride is false
                if (!latestCommande.isManualOverride() && latestCommande.shouldAutoClose()) {
                    latestCommande.setStatus(Commande.STATUS_ATTENTE);
                    latestCommande.setUpdatedAt(java.time.LocalDateTime.now());
                    latestCommande.setManualOverride(false);
                    this.commandeRepository.save(latestCommande);
                    closedCount++;
                    System.out.println("✅ Auto-closed expired commande: " + latestCommande.getId() + 
                                     " (deadline was: " + latestCommande.getOrderDeadline() + ")");
                }
            }
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("✅ Service: Auto-close check completed in " + duration + "ms. " +
                             "Checked " + checkedCount + " commandes, closed " + closedCount + " expired ones");
        } catch (Exception e) {
            System.err.println("❌ Service: Error checking expired commandes: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to check expired commandes", e);
        }
    }
    
    /**
     * Enhanced expiration check for specific commande with detailed logging
     */
    public Commande checkAndUpdateSingleCommande(String commandeId) {
        try {
            Optional<Commande> optionalCommande = this.commandeRepository.findById(commandeId);
            
            if (optionalCommande.isPresent()) {
                Commande commande = optionalCommande.get();
                
                if (commande.shouldAutoClose()) {
                    String oldStatus = commande.getStatus();
                    // commande.autoCloseIfExpired(); // Method is now commented out
                    commande = this.commandeRepository.save(commande);
                    
                    System.out.println("✅ Single commande auto-closed: " + commandeId + 
                                     " (status: " + oldStatus + " → " + commande.getStatus() + 
                                     ", deadline was: " + commande.getOrderDeadline() + ")");
                }
                
                return commande;
            }
            
            System.err.println("❌ Service: Commande not found for expiration check: " + commandeId);
            return null;
            
        } catch (Exception e) {
            System.err.println("❌ Service: Error checking single commande expiration: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to check single commande expiration", e);
        }
    }
    
    // Force expiration check for a specific commande by ID
    public Commande forceExpirationCheckForCommande(String commandeId) {
        Optional<Commande> optionalCommande = this.commandeRepository.findById(commandeId);
        if (optionalCommande.isPresent()) {
            Commande commande = optionalCommande.get();
            if (commande.shouldAutoClose()) {
                commande = updateCommandeStatus(commandeId, Commande.STATUS_ATTENTE);
                System.out.println("✅ Forced auto-close for commande (via updateCommandeStatus): " + commandeId);
            }
            return commande;
        }
        return null;
    }
    
    // Validate status
    private boolean isValidStatus(String status) {
        return status != null && (
            status.equals(Commande.STATUS_CREE) ||
            status.equals(Commande.STATUS_ATTENTE) ||
            status.equals(Commande.STATUS_CONFIRMEE) ||
            status.equals(Commande.STATUS_ANNULEE)
        );
    }
    
    /**
     * Professional deadline validation with timezone and precision handling
     */
    public boolean validateDeadline(LocalDateTime orderDeadline) {
        if (orderDeadline == null) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // Add buffer for client-server time differences and processing delays
        LocalDateTime bufferTime = now.minusMinutes(2);
        
        // Check if deadline is significantly in the past (more than 2 minutes buffer)
        if (orderDeadline.isBefore(bufferTime)) {
            System.out.println("❌ Deadline validation failed: Deadline is in the past (buffer: 2 minutes)");
            return false;
        }
        
        // Check if deadline is too far in the future (more than 7 days)
        LocalDateTime maxDeadline = now.plusDays(7);
        if (orderDeadline.isAfter(maxDeadline)) {
            System.out.println("❌ Deadline validation failed: Deadline is too far in the future (max: 7 days)");
            return false;
        }
        
        System.out.println("✅ Deadline validation passed: " + orderDeadline + " (now: " + now + ")");
        return true;
    }
    
    /**
     * Enhanced save method with professional deadline validation
     */
    public Commande saveCommandeWithValidation(Commande commande) {
        // Validate deadline before saving
        if (!validateDeadline(commande.getOrderDeadline())) {
            throw new IllegalArgumentException("Invalid deadline: " + commande.getOrderDeadline());
        }
        
        // Set default status if not provided
        if (commande.getStatus() == null || commande.getStatus().trim().isEmpty()) {
            commande.setStatus(Commande.STATUS_CREE);
        }
        
        // Set timestamps
        LocalDateTime now = LocalDateTime.now();
        if (commande.getCreatedAt() == null) {
            commande.setCreatedAt(now);
        }
        commande.setUpdatedAt(now);
        
        // Save with validation
        return saveCommande(commande);
    }

    @Scheduled(fixedRate = 60000) // every 60 seconds
    public void scheduledAutoClose() {
        System.out.println("[SCHEDULED] Running auto-close job at " + java.time.LocalDateTime.now());
        checkAndAutoCloseExpiredCommandes();
    }
}
