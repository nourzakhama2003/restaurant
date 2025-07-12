package com.example.restaurant_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "commandes")
public class Commande {
    @Id
    private String id;
    private String restaurantId;
    private String creatorId;
    private String creatorName;
    private String deliveryAddress;
    private String deliveryPhone;
    private String status;
    private double totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime orderDeadline;
    private boolean allowParticipation = true;
    private List<Order> orders = new ArrayList<>();
    private boolean deleted = false;
}
