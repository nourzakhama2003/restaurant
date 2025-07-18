package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Order;
import com.example.restaurant_backend.entity.Commande;
import com.example.restaurant_backend.repository.OrderRepository;
import com.example.restaurant_backend.repository.CommandeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class OrderService {
    private OrderRepository orderRepository;
    private CommandeRepository commandeRepository;

    public OrderService(OrderRepository orderRepository, CommandeRepository commandeRepository) {
        this.orderRepository = orderRepository;
        this.commandeRepository = commandeRepository;
    }

    // Create
    public Order saveOrder(Order order) {
        try {
            System.out.println("ðŸ”„ OrderService: Saving order for commande: " + order.getCommandeId());
            
            // Save the order first
            Order savedOrder = this.orderRepository.save(order);
            System.out.println("âœ… OrderService: Order saved with ID: " + savedOrder.getId());
            
            // Update the commande's orders list
            if (order.getCommandeId() != null) {
                updateCommandeOrdersList(order.getCommandeId());
            }
            
            return savedOrder;
            
        } catch (Exception e) {
            System.err.println("âŒ OrderService: Error saving order: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save order", e);
        }
    }
    
    // Helper method to update commande's orders list
    private void updateCommandeOrdersList(String commandeId) {
        try {
            System.out.println("ðŸ”„ OrderService: Updating orders list for commande: " + commandeId);
            
            Optional<Commande> optionalCommande = this.commandeRepository.findById(commandeId);
            if (optionalCommande.isPresent()) {
                Commande commande = optionalCommande.get();
                
                // Get all orders for this commande
                List<Order> allOrders = this.orderRepository.findByCommandeId(commandeId);
                List<Order> activeOrders = allOrders.stream()
                    .filter(order -> !order.isDeleted())
                    .toList();
                
                System.out.println("ðŸ“‹ Found " + activeOrders.size() + " active orders for commande: " + commandeId);
                
                // Update the commande's orders list
                commande.setOrders(activeOrders);
                
                // Calculate and update total price
                double newTotal = activeOrders.stream()
                    .mapToDouble(Order::getTotalAmount)
                    .sum();
                    
                double oldTotal = commande.getTotalPrice();
                commande.setTotalPrice(newTotal);
                
                // Save the updated commande
                this.commandeRepository.save(commande);
                
                System.out.println("âœ… OrderService: Updated commande orders list and total from " + oldTotal + " to " + newTotal);
                
            } else {
                System.err.println("âŒ OrderService: Commande not found: " + commandeId);
            }
            
        } catch (Exception e) {
            System.err.println("âŒ OrderService: Error updating commande orders list: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Read all
    public List<Order> getAllOrders() {
        return this.orderRepository.findAll();
    }

    // Read by ID
    public Optional<Order> getOrderById(String id) {
        return this.orderRepository.findById(id);
    }

    // Read by Commande ID
    public List<Order> getOrdersByCommandeId(String commandeId) {
        return this.orderRepository.findByCommandeId(commandeId);
    }

    // Read by Participant ID
    public List<Order> getOrdersByParticipantId(String participantId) {
        return this.orderRepository.findByParticipantId(participantId);
    }

    // Read by Commande and Participant
    public List<Order> getOrdersByCommandeAndParticipant(String commandeId, String participantId) {
        return this.orderRepository.findByCommandeIdAndParticipantId(commandeId, participantId);
    }

    // Update
    public Order updateOrder(String id, Order order) {
        if (this.orderRepository.existsById(id)) {
            order.setId(id);
            Order updatedOrder = this.orderRepository.save(order);
            
            // Update commande's orders list after order update
            if (order.getCommandeId() != null) {
                updateCommandeOrdersList(order.getCommandeId());
            }
            
            return updatedOrder;
        }
        return null;
    }

    // Delete
    public boolean deleteOrder(String id) {
        if (this.orderRepository.existsById(id)) {
            // Get the order first to get the commandeId
            Optional<Order> orderOpt = this.orderRepository.findById(id);
            String commandeId = null;
            if (orderOpt.isPresent()) {
                commandeId = orderOpt.get().getCommandeId();
            }
            
            this.orderRepository.deleteById(id);
            
            // Update commande's orders list after deletion
            if (commandeId != null) {
                updateCommandeOrdersList(commandeId);
            }
            
            return true;
        }
        return false;
    }

    // Delete by Commande ID
    public void deleteOrdersByCommandeId(String commandeId) {
        this.orderRepository.deleteByCommandeId(commandeId);
    }

    // Delete by Participant ID
    public void deleteOrdersByParticipantId(String participantId) {
        this.orderRepository.deleteByParticipantId(participantId);
    }

    // Check if exists
    public boolean existsById(String id) {
        return this.orderRepository.existsById(id);
    }

    // Calculate total price for a commande
    public double calculateTotalPriceForCommande(String commandeId) {
        List<Order> orders = this.orderRepository.findByCommandeId(commandeId);
        return orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }

    // Calculate total price for a participant
    public double calculateTotalPriceForParticipant(String participantId) {
        List<Order> orders = this.orderRepository.findByParticipantId(participantId);
        return orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }


}
