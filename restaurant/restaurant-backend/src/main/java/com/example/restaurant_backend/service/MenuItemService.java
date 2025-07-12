package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.MenuItem;
import com.example.restaurant_backend.entity.Restaurant;
import com.example.restaurant_backend.repository.MenuItemRepository;
import com.example.restaurant_backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;


    @Autowired
    RestaurantRepository restaurantRepository;

    public List<MenuItem> getByRestaurant(String restaurantId) {
        return menuItemRepository.findByRestaurantIdAndDeletedFalse(restaurantId);
    }

    public MenuItem create(MenuItem item) {
        item.setId(null);
        item.setDeleted(false);
        
        // Validate that the restaurant exists
        Restaurant restaurant = this.restaurantRepository.findById(item.getRestaurantId()).orElse(null);
        if(restaurant == null){
            throw new IllegalArgumentException("Restaurant with id " + item.getRestaurantId() + " does not exist");
        }
        
        // First save the menu item to get its ID
        MenuItem savedMenuItem = menuItemRepository.save(item);
        
        // Then add it to the restaurant's menu list and save the restaurant
        restaurant.getMenus().add(savedMenuItem);
        this.restaurantRepository.save(restaurant);
        
        return savedMenuItem;
    }

    public Optional<MenuItem> update(String id, MenuItem item) {
        return menuItemRepository.findById(id).map(existing -> {
            existing.setName(item.getName());
            existing.setDescription(item.getDescription());
            existing.setPrice(item.getPrice());
            existing.setRestaurantId(item.getRestaurantId());
            
            MenuItem savedMenuItem = menuItemRepository.save(existing);
            
            // Update the restaurant's menu list
            Restaurant restaurant = this.restaurantRepository.findById(item.getRestaurantId()).orElse(null);
            if(restaurant != null) {
                // Remove the old item and add the updated one
                restaurant.getMenus().removeIf(menuItem -> menuItem.getId().equals(id));
                restaurant.getMenus().add(savedMenuItem);
                this.restaurantRepository.save(restaurant);
            }
            
            return savedMenuItem;
        });
    }

    public void delete(String id) {
        menuItemRepository.findById(id).ifPresent(item -> {
            // Remove from restaurant's menu list
            Restaurant restaurant = this.restaurantRepository.findById(item.getRestaurantId()).orElse(null);
            if(restaurant != null) {
                restaurant.getMenus().removeIf(menuItem -> menuItem.getId().equals(id));
                this.restaurantRepository.save(restaurant);
            }
            
            // Delete from menu items collection
            menuItemRepository.deleteById(id);
        });
    }

}
