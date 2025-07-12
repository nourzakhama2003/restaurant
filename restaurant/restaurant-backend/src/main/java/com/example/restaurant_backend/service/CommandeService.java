package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Commande;
import com.example.restaurant_backend.entity.Order;
import com.example.restaurant_backend.repository.CommandeRepository;
import com.example.restaurant_backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CommandeService {
    private CommandeRepository commandeRepository;
   private OrderRepository orderRepository;

    public CommandeService(CommandeRepository commandeRepository, OrderRepository orderRepository) {
        this.commandeRepository = commandeRepository;
        this.orderRepository = orderRepository;
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
        return this.commandeRepository.findAll();
    }

    // Read by ID
    public Optional<Commande> getCommandeById(String id) {
        return this.commandeRepository.findById(id);
    }

    // Read by Restaurant ID
    public List<Commande> getCommandesByRestaurantId(String restaurantId) {
        return this.commandeRepository.findByRestaurantId(restaurantId);
    }

    // Read by Status
    public List<Commande> getCommandesByStatus(String status) {
        return this.commandeRepository.findByStatus(status);
    }

    // Read by Creator ID
    public List<Commande> getCommandesByCreatorId(String creatorId) {
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
}
