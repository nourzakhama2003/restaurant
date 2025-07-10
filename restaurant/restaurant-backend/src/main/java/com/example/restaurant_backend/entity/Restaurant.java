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
@Document(collection = "restaurants")
public class Restaurant {
    @Id
    private String id;
    private String name;
    private String description;
    private String address;
    private String phone;
    private String cuisineType;
    private boolean deleted = false;
    private List<MenuItem> menu = new ArrayList<>();

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
    public Restaurant(String name){
        this.name = name;
    }
    public Restaurant(String id, String name, String description, String address,
                      String phone, String cuisineType, boolean deleted, List<MenuItem> menu) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.cuisineType = cuisineType;
        this.deleted = deleted;
        this.menu = menu != null ? menu : new ArrayList<>();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCuisineType() { return cuisineType; }
    public void setCuisineType(String cuisineType) { this.cuisineType = cuisineType; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public List<MenuItem> getMenu() { return menu; }
    public void setMenu(List<MenuItem> menu) { this.menu = menu; }
}