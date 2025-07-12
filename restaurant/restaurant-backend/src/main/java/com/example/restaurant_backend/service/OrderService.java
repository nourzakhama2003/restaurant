package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Order;
import com.example.restaurant_backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Create
    public Order saveOrder(Order order) {
        return this.orderRepository.save(order);
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
            return this.orderRepository.save(order);
        }
        return null;
    }

    // Delete
    public boolean deleteOrder(String id) {
        if (this.orderRepository.existsById(id)) {
            this.orderRepository.deleteById(id);
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
