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
    private String profileImageBase64;

    private List<Commande> commandes = new ArrayList<>();
    private List<MenuItem> menus = new ArrayList<>();
    private boolean deleted = false;


    public Restaurant(String name, String description, String address,
                      String phone, String cuisineType) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.cuisineType = cuisineType;
    }

 
    public Restaurant(final String id, final String name, final String description, final String address, final String phone, final String cuisineType, final List<Commande> commandes, final List<MenuItem> menus, final boolean deleted) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.cuisineType = cuisineType;
        this.commandes = commandes;
        this.menus = menus;
        this.deleted = deleted;
    }


   


}