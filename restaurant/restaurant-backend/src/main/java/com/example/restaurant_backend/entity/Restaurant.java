package com.example.restaurant_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;




@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "restaurants")
public class Restaurant {
    @Id
    private String id;
    private String name;
    private String description;
    private String address;
    private String phone;
    private String cuisineType;

    private List<Commande> commandes = new ArrayList<>();
    private List<MenuItem> menus = new ArrayList<>();
    private boolean deleted = false;

    // Minimal constructor for creation
    public Restaurant(String name, String description, String address,
                      String phone, String cuisineType) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.cuisineType = cuisineType;
    }

    // Full constructor for updates



    // Getters and Setters


}