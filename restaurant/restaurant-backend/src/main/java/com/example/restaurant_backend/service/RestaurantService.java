package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Restaurant;
import com.example.restaurant_backend.entity.MenuItem;
import com.example.restaurant_backend.repository.RestaurantRepository;
import com.example.restaurant_backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<Restaurant> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findByDeletedFalse();
        
        // Debug output
        for (Restaurant restaurant : restaurants) {
            System.out.println("Restaurant: " + restaurant.getName() + " has " + restaurant.getMenu().size() + " menu items");
        }
        
        return restaurants;
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        System.out.println("Received restaurant: " + restaurant);
        return restaurantRepository.save(restaurant);
    }

    public Optional<Restaurant> updateRestaurant(String id, Restaurant updated) {
        return restaurantRepository.findById(id).map(existing -> {
            updated.setId(id);
            return restaurantRepository.save(updated);
        });
    }

    // Correction ici: le paramètre est 'id' et non 'description'
    public void deleteRestaurant(String id) {
        restaurantRepository.findById(id).ifPresent(r -> {
            r.setDeleted(true);
            restaurantRepository.save(r);
        });
    }

    public Optional<Restaurant> getRestaurantById(String id) {
        return restaurantRepository.findById(id);
    }

    // Debug method to test menu item loading
    public void debugMenuItemLoading(String restaurantId) {
        System.out.println("=== DEBUG: Testing menu item loading for restaurant ID: " + restaurantId + " ===");
        
        // Test direct query
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndDeletedFalse(restaurantId);
        System.out.println("Direct query result: " + menuItems.size() + " menu items found");
        
        // Test all menu items
        List<MenuItem> allMenuItems = menuItemRepository.findAll();
        System.out.println("Total menu items in database: " + allMenuItems.size());
        
        // Print details of each menu item
        for (MenuItem item : allMenuItems) {
            System.out.println("Menu item: " + item.getName() + 
                             ", restaurantId: " + item.getRestaurantId() + 
                             ", deleted: " + item.isDeleted());
        }
        
        System.out.println("=== END DEBUG ===");
    }
}
