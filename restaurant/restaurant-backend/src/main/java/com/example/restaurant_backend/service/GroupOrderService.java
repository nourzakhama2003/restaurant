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

    // 1. Create a new group commande
    public Commande createGroupCommande(String restaurantId, String creatorId, String creatorName, 
                                       String deliveryAddress, String deliveryPhone, LocalDateTime orderDeadline) {
        
        // Validate restaurant exists
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        Commande commande = new Commande();
        commande.setRestaurantId(restaurantId);
        commande.setCreatorId(creatorId);
        commande.setCreatorName(creatorName);
        commande.setDeliveryAddress(deliveryAddress);
        commande.setDeliveryPhone(deliveryPhone);
        commande.setOrderDeadline(orderDeadline);
        commande.setStatus("OPEN_FOR_PARTICIPATION");
        commande.setAllowParticipation(true);
        commande.setTotalPrice(0.0);
        commande.setCreatedAt(LocalDateTime.now());
        commande.setUpdatedAt(LocalDateTime.now());

        return commandeRepository.save(commande);
    }

    // 2. Get available group commandes for participation
    public List<Commande> getAvailableGroupCommandes(String restaurantId) {
        return commandeRepository.findByRestaurantIdAndStatusAndAllowParticipationTrueAndDeletedFalse(
                restaurantId, "OPEN_FOR_PARTICIPATION");
    }

    // 3. Participate in a group commande
    public Order participateInGroupCommande(String commandeId, String participantId, String participantName, 
                                           String participantPhone, List<OrderItem> items, String notes) {
        
        // Validate commande exists and is open for participation
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        if (!commande.isAllowParticipation() || 
            !"OPEN_FOR_PARTICIPATION".equals(commande.getStatus())) {
            throw new IllegalArgumentException("This commande is no longer accepting participants");
        }

        if (commande.getOrderDeadline() != null && LocalDateTime.now().isAfter(commande.getOrderDeadline())) {
            throw new IllegalArgumentException("Order deadline has passed");
        }

        // Check if user already participated
        Optional<Order> existingOrder = orderRepository.findByCommandeIdAndParticipantIdAndDeletedFalse(
                commandeId, participantId);
        if (existingOrder.isPresent()) {
            throw new IllegalArgumentException("You have already participated in this commande");
        }

        // Validate and calculate menu items
        double totalAmount = 0;
        for (OrderItem item : items) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + item.getMenuItemId()));
            
            item.setMenuItemName(menuItem.getName());
            item.setUnitPrice(menuItem.getPrice());
            totalAmount += item.getSubtotal();
        }

        // Create individual order
        Order order = new Order();
        order.setCommandeId(commandeId);
        order.setParticipantId(participantId);
        order.setParticipantName(participantName);
        order.setParticipantPhone(participantPhone);
        order.setItems(items);
        order.setTotalAmount(totalAmount);
        order.setNotes(notes);
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Update commande total amount
        updateCommandeTotalAmount(commandeId);

        return savedOrder;
    }

    // 4. Update participant's order
    public Order updateParticipantOrder(String orderId, String participantId, List<OrderItem> items, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getParticipantId().equals(participantId)) {
            throw new IllegalArgumentException("You can only update your own order");
        }

        // Validate commande is still open
        Commande commande = commandeRepository.findById(order.getCommandeId())
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        if (!"OPEN_FOR_PARTICIPATION".equals(commande.getStatus())) {
            throw new IllegalArgumentException("Cannot update order - commande is no longer accepting changes");
        }

        // Validate and calculate menu items
        double totalAmount = 0;
        for (OrderItem item : items) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + item.getMenuItemId()));
            
            item.setMenuItemName(menuItem.getName());
            item.setUnitPrice(menuItem.getPrice());
            totalAmount += item.getSubtotal();
        }

        order.setItems(items);
        order.setTotalAmount(totalAmount);
        order.setNotes(notes);

        Order updatedOrder = orderRepository.save(order);

        // Update commande total amount
        updateCommandeTotalAmount(order.getCommandeId());

        return updatedOrder;
    }

    // 5. Remove participant from commande
    public void removeParticipantFromCommande(String orderId, String participantId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getParticipantId().equals(participantId)) {
            throw new IllegalArgumentException("You can only remove your own order");
        }

        order.setDeleted(true);
        orderRepository.save(order);

        // Update commande total amount
        updateCommandeTotalAmount(order.getCommandeId());
    }

    // 6. Close commande for participation
    public Commande closeCommandeForParticipation(String commandeId, String creatorId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        if (!commande.getCreatorId().equals(creatorId)) {
            throw new IllegalArgumentException("Only the creator can close the commande");
        }

        commande.setStatus("CLOSED_FOR_PARTICIPATION");
        commande.setAllowParticipation(false);
        commande.setUpdatedAt(LocalDateTime.now());

        return commandeRepository.save(commande);
    }

    // 7. Get commande with all participants
    public Commande getCommandeWithParticipants(String commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande not found"));

        List<Order> orders = orderRepository.findByCommandeIdAndDeletedFalse(commandeId);
        commande.setOrders(orders);

        return commande;
    }

    // Helper method to update commande total amount
    private void updateCommandeTotalAmount(String commandeId) {
        List<Order> orders = orderRepository.findByCommandeIdAndDeletedFalse(commandeId);
        double totalAmount = orders.stream().mapToDouble(Order::getTotalAmount).sum();

        Commande commande = commandeRepository.findById(commandeId).orElse(null);
        if (commande != null) {
            commande.setTotalPrice(totalAmount);
            commande.setUpdatedAt(LocalDateTime.now());
            commandeRepository.save(commande);
        }
    }
}
