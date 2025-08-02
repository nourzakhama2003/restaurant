package com.example.restaurant_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "menu_items")
public class MenuItem {

    @Id
    private String id;

    private String name;
    private String description;
    private double price;
    private String restaurantId;
    private String categoryId; 
    private String categoryName; 
    private boolean deleted = false;
    private String imageBase64; 


}
