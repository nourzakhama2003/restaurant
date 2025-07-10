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
    private boolean deleted = false;

    public void setId(String id) {
        this.id = id;
    }
    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }
    public void setPrice(double price) {
        this.price = price;
    }
    public String getName() {
        return name;
    }
    public String getDescription() {
        return description;
    }
    public double getPrice() {
        return price;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public String getId() {
        return id;
    }

    public boolean isDeleted() {
        return deleted;
    }

}
