package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.*;
import com.example.restaurant_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GroupOrderService {

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CommandeService commandeService;

    // 1. Create a new group commande
    public Commande createGroupCommande(String restaurantId, String creatorId, String creatorName, 
                                        LocalDateTime orderDeadline) {
        
        // Validate restaurant exists
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        Commande commande = new Commande();
        commande.setRestaurantId(restaurantId);
        commande.setCreatorId(creatorId);
        commande.setCreatorName(creatorName);
        commande.setOrderDeadline(orderDeadline);
        commande.setStatus(Commande.STATUS_CREE); 
        commande.setTotalPrice(0.0);
        commande.setCreatedAt(LocalDateTime.now());
        commande.setUpdatedAt(LocalDateTime.now());
        commande.setManualOverride(true); 
        return commandeRepository.save(commande);
    }

    
    public List<Commande> getAvailableGroupCommandes(String restaurantId) {
        return commandeRepository.findByRestaurantIdAndStatusAndDeletedFalse(
                restaurantId, Commande.STATUS_CREE);
    }

 
    public Order participateInGroupCommande(String commandeId, String participantId, String participantName, 
                                           List<OrderItem> items, String notes) {
        
      
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        if (!commande.canAcceptParticipants()) {
            throw new IllegalArgumentException("This commande is no longer accepting participants");
        }


        Optional<Order> existingOrder = orderRepository.findByCommandeIdAndParticipantIdAndDeletedFalse(
                commandeId, participantId);
        if (existingOrder.isPresent()) {
            throw new IllegalArgumentException("You have already participated in this commande");
        }

     
        double totalAmount = 0;
        for (OrderItem item : items) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + item.getMenuItemId()));
            
            item.setMenuItemName(menuItem.getName());
            item.setUnitPrice(menuItem.getPrice());
            totalAmount += item.getSubtotal();
        }

       
        Order order = new Order();
        order.setCommandeId(commandeId);
        order.setParticipantId(participantId);
        order.setParticipantName(participantName);
        order.setItems(items);
        order.setTotalAmount(totalAmount);
        order.setNotes(notes);
        order.setCreatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

  
    public Commande closeCommandeForParticipation(String commandeId, String creatorId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        if (!commande.getCreatorId().equals(creatorId)) {
            throw new IllegalArgumentException("Only the creator can close the commande");
        }

   
        return commandeService.updateCommandeStatus(commandeId, Commande.STATUS_ATTENTE);
    }

 
    public Commande getCommandeWithParticipants(String commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        List<Order> orders = orderRepository.findByCommandeIdAndDeletedFalse(commandeId);
        commande.setOrders(orders);

        return commande;
    }

 
    public void checkAndAutoCloseExpiredCommandes() {
        List<Commande> createdCommandes = commandeRepository.findByStatusAndDeletedFalse(Commande.STATUS_CREE);
        
        for (Commande commande : createdCommandes) {
            if (commande.shouldAutoClose()) {
              
                System.out.println("[INFO] Expired commande detected: " + commande.getId());
            }
        }
    }


    public Commande updateCommandeStatus(String commandeId, String newStatus, String userId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

      
        if (!commande.getCreatorId().equals(userId)) {
            throw new IllegalArgumentException("Only the creator can update commande status");
        }

    
        if (!isValidStatusTransition(commande.getStatus(), newStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + commande.getStatus() + " to " + newStatus);
        }

        return commandeService.updateCommandeStatus(commandeId, newStatus);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        switch (currentStatus) {
            case Commande.STATUS_CREE:
                return Commande.STATUS_ATTENTE.equals(newStatus) ||
                       Commande.STATUS_CONFIRMEE.equals(newStatus) || 
                       Commande.STATUS_ANNULEE.equals(newStatus);
            case Commande.STATUS_ATTENTE:
           
                return Commande.STATUS_CREE.equals(newStatus) ||
                       Commande.STATUS_CONFIRMEE.equals(newStatus) || 
                       Commande.STATUS_ANNULEE.equals(newStatus);
            case Commande.STATUS_CONFIRMEE:
                return Commande.STATUS_ANNULEE.equals(newStatus);
            case Commande.STATUS_ANNULEE:
                return false; 
            default:
                return false;
        }
    }

  
    public Order updateParticipantOrder(String commandeId, String participantId, 
                                       List<OrderItem> items, String notes) {
        
    
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        if (!commande.canAcceptParticipants()) {
            throw new IllegalArgumentException("This commande is no longer accepting participants");
        }

     
        Order existingOrder = orderRepository.findByCommandeIdAndParticipantIdAndDeletedFalse(
                commandeId, participantId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found for this participant"));

        double totalAmount = 0;
        for (OrderItem item : items) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + item.getMenuItemId()));
            
            item.setMenuItemName(menuItem.getName());
            item.setUnitPrice(menuItem.getPrice());
            totalAmount += item.getSubtotal();
        }

    
        existingOrder.setItems(items);
        existingOrder.setTotalAmount(totalAmount);
        existingOrder.setNotes(notes);

        return orderRepository.save(existingOrder);
    }


    public void removeParticipantFromCommande(String commandeId, String participantId) {
        
    
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        if (!commande.canAcceptParticipants()) {
            throw new IllegalArgumentException("Cannot remove participant - commande is no longer accepting changes");
        }


        Order existingOrder = orderRepository.findByCommandeIdAndParticipantIdAndDeletedFalse(
                commandeId, participantId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found for this participant"));

        existingOrder.setDeleted(true);
        orderRepository.save(existingOrder);
    }
}
