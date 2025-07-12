package com.example.restaurant_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItem {
    private String menuItemId;
    private String menuItemName;
    private double unitPrice;
    private int quantity;
    private String notes;
    
    public double getSubtotal() {
        return unitPrice * quantity;
    }
}
