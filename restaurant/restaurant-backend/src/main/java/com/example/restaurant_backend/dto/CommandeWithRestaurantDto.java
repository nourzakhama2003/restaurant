package com.example.restaurant_backend.dto;

import com.example.restaurant_backend.entity.Commande;
import com.example.restaurant_backend.entity.Order;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommandeWithRestaurantDto {
    private String id;
    private String restaurantId;
    private String restaurantName;
    private String creatorId;
    private String creatorName;
    private String status;
    private double totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime orderDeadline;
    private List<Order> orders;
    private boolean deleted;

    public static CommandeWithRestaurantDto fromCommande(Commande commande, String restaurantName) {
        CommandeWithRestaurantDto dto = new CommandeWithRestaurantDto();
        dto.setId(commande.getId());
        dto.setRestaurantId(commande.getRestaurantId());
        dto.setRestaurantName(restaurantName);
        dto.setCreatorId(commande.getCreatorId());
        dto.setCreatorName(commande.getCreatorName());
        dto.setStatus(commande.getStatus());
        dto.setTotalPrice(commande.getTotalPrice());
        dto.setCreatedAt(commande.getCreatedAt());
        dto.setUpdatedAt(commande.getUpdatedAt());
        dto.setOrderDeadline(commande.getOrderDeadline());
        dto.setOrders(commande.getOrders());
        dto.setDeleted(commande.isDeleted());
        return dto;
    }
} 