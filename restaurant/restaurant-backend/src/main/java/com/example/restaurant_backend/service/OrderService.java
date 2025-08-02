package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Order;
import com.example.restaurant_backend.entity.Commande;
import com.example.restaurant_backend.repository.OrderRepository;
import com.example.restaurant_backend.repository.CommandeRepository;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class OrderService {
    private OrderRepository orderRepository;
    private CommandeRepository commandeRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderService(OrderRepository orderRepository, CommandeRepository commandeRepository, SimpMessagingTemplate messagingTemplate) {
        this.orderRepository = orderRepository;
        this.commandeRepository = commandeRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Order saveOrder(Order order) {
        try {
            System.out.println("ðŸ”„ OrderService: Saving order for commande: " + order.getCommandeId());
            
           
            Order savedOrder = this.orderRepository.save(order);
            System.out.println("âœ… OrderService: Order saved with ID: " + savedOrder.getId());
            
       
            if (order.getCommandeId() != null) {
                updateCommandeOrdersList(order.getCommandeId());
            }
            
           
            if (order.getCommandeId() != null) {
                updateLivraisonFeePerParticipantForCommande(order.getCommandeId());
            }
            
            return savedOrder;
            
        } catch (Exception e) {
            System.err.println("âŒ OrderService: Error saving order: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save order", e);
        }
    }
    

    private void updateCommandeOrdersList(String commandeId) {
        try {
            System.out.println("ðŸ”„ OrderService: Updating orders list for commande: " + commandeId);
            
            Optional<Commande> optionalCommande = this.commandeRepository.findById(commandeId);
            if (optionalCommande.isPresent()) {
                Commande commande = optionalCommande.get();
                
           
                List<Order> allOrders = this.orderRepository.findByCommandeId(commandeId);
                List<Order> activeOrders = allOrders.stream()
                    .filter(order -> !order.isDeleted())
                    .toList();
                
                System.out.println("ðŸ“‹ Found " + activeOrders.size() + " active orders for commande: " + commandeId);
                
          
                commande.setOrders(activeOrders);
                
           
                double newTotal = activeOrders.stream()
                    .mapToDouble(Order::getTotalAmount)
                    .sum();
                    
                double oldTotal = commande.getTotalPrice();
                commande.setTotalPrice(newTotal);
                
               
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


    public List<Order> getAllOrders() {
        return this.orderRepository.findAll();
    }

 
    public Optional<Order> getOrderById(String id) {
        return this.orderRepository.findById(id);
    }


    public List<Order> getOrdersByCommandeId(String commandeId) {
        return this.orderRepository.findByCommandeId(commandeId);
    }


    public List<Order> getOrdersByParticipantId(String participantId) {
        return this.orderRepository.findByParticipantId(participantId);
    }

  
    public List<Order> getOrdersByCommandeAndParticipant(String commandeId, String participantId) {
        return this.orderRepository.findByCommandeIdAndParticipantId(commandeId, participantId);
    }

  
    public Order updateOrder(String id, Order order) {
        if (this.orderRepository.existsById(id)) {
            order.setId(id);
            Order updatedOrder = this.orderRepository.save(order);
            
            System.out.println("🔄 OrderService: Updated order with ID: " + updatedOrder.getId());
            
          
            if (order.getCommandeId() != null) {
                updateCommandeOrdersList(order.getCommandeId());
                
      List<Order> orders = this.orderRepository.findByCommandeId(order.getCommandeId());
                boolean allPaid = orders.stream().allMatch(o -> o.isPaye());
                Optional<Commande> commandeOpt = this.commandeRepository.findById(order.getCommandeId());
                if (commandeOpt.isPresent()) {
                    Commande commande = commandeOpt.get();
                    if (allPaid && Commande.STATUS_ATTENTE.equals(commande.getStatus())) {
                        commande.setStatus(Commande.STATUS_CONFIRMEE);
                        commande.setUpdatedAt(java.time.LocalDateTime.now());
                        this.commandeRepository.save(commande);
                        System.out.println("✅ OrderService: Auto-updated commande status to CONFIRMEE");
                    }
                
                    System.out.println("[WEBSOCKET BROADCAST] Sending update to /topic/group-orders/" + commande.getId() + ": " + commande);
                    messagingTemplate.convertAndSend("/topic/group-orders/" + commande.getId(), commande);
                }
            }
            
          
            if (order.getCommandeId() != null) {
                updateLivraisonFeePerParticipantForCommande(order.getCommandeId());
            }
            
            return updatedOrder;
        }
        return null;
    }


    public boolean deleteOrder(String id) {
        if (this.orderRepository.existsById(id)) {

            Optional<Order> orderOpt = this.orderRepository.findById(id);
            String commandeId = null;
            if (orderOpt.isPresent()) {
                commandeId = orderOpt.get().getCommandeId();
            }
            
            this.orderRepository.deleteById(id);
            
          
            if (commandeId != null) {
                updateCommandeOrdersList(commandeId);
            }
            
           
            if (commandeId != null) {
                updateLivraisonFeePerParticipantForCommande(commandeId);
            }
            
            return true;
        }
        return false;
    }


    public void deleteOrdersByCommandeId(String commandeId) {
        this.orderRepository.deleteByCommandeId(commandeId);
    }

  
    public void deleteOrdersByParticipantId(String participantId) {
        this.orderRepository.deleteByParticipantId(participantId);
    }

 
    public boolean existsById(String id) {
        return this.orderRepository.existsById(id);
    }


    public double calculateTotalPriceForCommande(String commandeId) {
        List<Order> orders = this.orderRepository.findByCommandeId(commandeId);
        return orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }

   
    public double calculateTotalPriceForParticipant(String participantId) {
        List<Order> orders = this.orderRepository.findByParticipantId(participantId);
        return orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }

 
    public void updateLivraisonFeePerParticipantForCommande(String commandeId) {
        Optional<Commande> commandeOpt = this.commandeRepository.findById(commandeId);
        if (commandeOpt.isPresent()) {
            Commande commande = commandeOpt.get();
            double deliveryFee = commande.getDeliveryFee();
            List<Order> orders = this.orderRepository.findByCommandeId(commandeId);
            int participants = (int) orders.stream().filter(o -> !o.isDeleted()).count();
            double feePerParticipant = (participants > 0) ? (deliveryFee / participants) : 0.0;
            for (Order order : orders) {
                order.setLivraisonFeePerParticipant(feePerParticipant);
                this.orderRepository.save(order);
            }
        }
    }
}
