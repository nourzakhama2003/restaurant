package com.example.restaurant_backend.controller;

import com.example.restaurant_backend.entity.*;
import com.example.restaurant_backend.service.GroupOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/group-orders")
@CrossOrigin(origins = "http://localhost:4200")
public class GroupOrderController {

    @Autowired
    private GroupOrderService groupOrderService;

    // Create a new group commande
    @PostMapping("/create")
    public ResponseEntity<Commande> createGroupCommande(@RequestBody CreateGroupCommandeRequest request) {
        try {
            Commande commande = groupOrderService.createGroupCommande(
                    request.getRestaurantId(),
                    request.getCreatorId(),
                    request.getCreatorName(),
                    request.getOrderDeadline()
            );
            return ResponseEntity.ok(commande);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Get available group commandes for a restaurant
    @GetMapping("/available/{restaurantId}")
    public ResponseEntity<List<Commande>> getAvailableGroupCommandes(@PathVariable String restaurantId) {
        List<Commande> commandes = groupOrderService.getAvailableGroupCommandes(restaurantId);
        return ResponseEntity.ok(commandes);
    }

    // Participate in a group commande
    @PostMapping("/participate")
    public ResponseEntity<Order> participateInGroupCommande(@RequestBody ParticipateRequest request) {
        try {
            Order order = groupOrderService.participateInGroupCommande(
                    request.getCommandeId(),
                    request.getParticipantId(),
                    request.getParticipantName(),
                    request.getParticipantPhone(),
                    request.getItems(),
                    request.getNotes()
            );
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Update participant's order
    @PutMapping("/update-order/{orderId}")
    public ResponseEntity<Order> updateParticipantOrder(@PathVariable String orderId, 
                                                       @RequestBody UpdateOrderRequest request) {
        try {
            Order order = groupOrderService.updateParticipantOrder(
                    orderId,
                    request.getParticipantId(),
                    request.getItems(),
                    request.getNotes()
            );
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Remove participant from commande
    @DeleteMapping("/remove-participant/{orderId}")
    public ResponseEntity<Void> removeParticipantFromCommande(@PathVariable String orderId, 
                                                             @RequestParam String participantId) {
        try {
            groupOrderService.removeParticipantFromCommande(orderId, participantId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Close commande for participation
    @PutMapping("/close/{commandeId}")
    public ResponseEntity<Commande> closeCommandeForParticipation(@PathVariable String commandeId, 
                                                                 @RequestParam String creatorId) {
        try {
            Commande commande = groupOrderService.closeCommandeForParticipation(commandeId, creatorId);
            return ResponseEntity.ok(commande);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Get commande with all participants
    @GetMapping("/details/{commandeId}")
    public ResponseEntity<Commande> getCommandeWithParticipants(@PathVariable String commandeId) {
        try {
            Commande commande = groupOrderService.getCommandeWithParticipants(commandeId);
            return ResponseEntity.ok(commande);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Request DTOs
    public static class CreateGroupCommandeRequest {
        private String restaurantId;
        private String creatorId;
        private String creatorName;
        private String deliveryAddress;
        private String deliveryPhone;
        private LocalDateTime orderDeadline;

        // Getters and setters
        public String getRestaurantId() { return restaurantId; }
        public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }
        public String getCreatorId() { return creatorId; }
        public void setCreatorId(String creatorId) { this.creatorId = creatorId; }
        public String getCreatorName() { return creatorName; }
        public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
        public String getDeliveryAddress() { return deliveryAddress; }
        public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
        public String getDeliveryPhone() { return deliveryPhone; }
        public void setDeliveryPhone(String deliveryPhone) { this.deliveryPhone = deliveryPhone; }
        public LocalDateTime getOrderDeadline() { return orderDeadline; }
        public void setOrderDeadline(LocalDateTime orderDeadline) { this.orderDeadline = orderDeadline; }
    }

    public static class ParticipateRequest {
        private String commandeId;
        private String participantId;
        private String participantName;
        private String participantPhone;
        private List<OrderItem> items;
        private String notes;

        // Getters and setters
        public String getCommandeId() { return commandeId; }
        public void setCommandeId(String commandeId) { this.commandeId = commandeId; }
        public String getParticipantId() { return participantId; }
        public void setParticipantId(String participantId) { this.participantId = participantId; }
        public String getParticipantName() { return participantName; }
        public void setParticipantName(String participantName) { this.participantName = participantName; }
        public String getParticipantPhone() { return participantPhone; }
        public void setParticipantPhone(String participantPhone) { this.participantPhone = participantPhone; }
        public List<OrderItem> getItems() { return items; }
        public void setItems(List<OrderItem> items) { this.items = items; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class UpdateOrderRequest {
        private String participantId;
        private List<OrderItem> items;
        private String notes;

        // Getters and setters
        public String getParticipantId() { return participantId; }
        public void setParticipantId(String participantId) { this.participantId = participantId; }
        public List<OrderItem> getItems() { return items; }
        public void setItems(List<OrderItem> items) { this.items = items; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
