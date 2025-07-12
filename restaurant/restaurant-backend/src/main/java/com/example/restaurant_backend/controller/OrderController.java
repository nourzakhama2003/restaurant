package com.example.restaurant_backend.controller;

import com.example.restaurant_backend.Exception.GlobalException;
import com.example.restaurant_backend.entity.Order;
import com.example.restaurant_backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {
    private OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Create
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        try {
            Order savedOrder = this.orderService.saveOrder(order);
            return ResponseEntity.status(201).body(savedOrder);
        } catch (Exception e) {
            throw new GlobalException("Failed to create order: " + e.getMessage());
        }
    }

    // Read all
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = this.orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve orders: " + e.getMessage());
        }
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        try {
            Optional<Order> order = this.orderService.getOrderById(id);
            if (order.isPresent()) {
                return ResponseEntity.ok(order.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve order: " + e.getMessage());
        }
    }

    // Read by Commande ID
    @GetMapping("/commande/{commandeId}")
    public ResponseEntity<List<Order>> getOrdersByCommandeId(@PathVariable String commandeId) {
        try {
            List<Order> orders = this.orderService.getOrdersByCommandeId(commandeId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve orders by commande: " + e.getMessage());
        }
    }

    // Read by Participant ID
    @GetMapping("/participant/{participantId}")
    public ResponseEntity<List<Order>> getOrdersByParticipantId(@PathVariable String participantId) {
        try {
            List<Order> orders = this.orderService.getOrdersByParticipantId(participantId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve orders by participant: " + e.getMessage());
        }
    }

    // Read by Commande and Participant
    @GetMapping("/commande/{commandeId}/participant/{participantId}")
    public ResponseEntity<List<Order>> getOrdersByCommandeAndParticipant(
            @PathVariable String commandeId, 
            @PathVariable String participantId) {
        try {
            List<Order> orders = this.orderService.getOrdersByCommandeAndParticipant(commandeId, participantId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve orders by commande and participant: " + e.getMessage());
        }
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody Order order) {
        try {
            Order updatedOrder = this.orderService.updateOrder(id, order);
            if (updatedOrder != null) {
                return ResponseEntity.ok(updatedOrder);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to update order: " + e.getMessage());
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        try {
            boolean deleted = this.orderService.deleteOrder(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to delete order: " + e.getMessage());
        }
    }

    // Delete by Commande ID
    @DeleteMapping("/commande/{commandeId}")
    public ResponseEntity<Void> deleteOrdersByCommandeId(@PathVariable String commandeId) {
        try {
            this.orderService.deleteOrdersByCommandeId(commandeId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to delete orders by commande: " + e.getMessage());
        }
    }

    // Delete by Participant ID
    @DeleteMapping("/participant/{participantId}")
    public ResponseEntity<Void> deleteOrdersByParticipantId(@PathVariable String participantId) {
        try {
            this.orderService.deleteOrdersByParticipantId(participantId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to delete orders by participant: " + e.getMessage());
        }
    }

    // Check if exists
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> orderExists(@PathVariable String id) {
        try {
            boolean exists = this.orderService.existsById(id);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            throw new GlobalException("Failed to check order existence: " + e.getMessage());
        }
    }

    // Calculate total price for a commande
    @GetMapping("/commande/{commandeId}/total")
    public ResponseEntity<Double> getTotalPriceForCommande(@PathVariable String commandeId) {
        try {
            double total = this.orderService.calculateTotalPriceForCommande(commandeId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            throw new GlobalException("Failed to calculate total price for commande: " + e.getMessage());
        }
    }

    // Calculate total price for a participant
    @GetMapping("/participant/{participantId}/total")
    public ResponseEntity<Double> getTotalPriceForParticipant(@PathVariable String participantId) {
        try {
            double total = this.orderService.calculateTotalPriceForParticipant(participantId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            throw new GlobalException("Failed to calculate total price for participant: " + e.getMessage());
        }
    }
}
