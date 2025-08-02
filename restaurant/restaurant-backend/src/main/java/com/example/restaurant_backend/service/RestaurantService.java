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
        try {
            List<Restaurant> restaurants = restaurantRepository.findByDeletedFalse();
            
            // Debug output with null checks
            for (Restaurant restaurant : restaurants) {
                int menuCount = (restaurant.getMenus() != null) ? restaurant.getMenus().size() : 0;

            }
            
            return restaurants;
        } catch (Exception e) {
            System.err.println("Error getting all restaurants: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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


    public void deleteRestaurant(String id) {
        restaurantRepository.findById(id).ifPresent(r -> {
            r.setDeleted(true);
            restaurantRepository.save(r);
        });
    }

    public Optional<Restaurant> getRestaurantById(String id) {
        return restaurantRepository.findById(id);
    }

    public void debugMenuItemLoading(String restaurantId) {
     
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndDeletedFalse(restaurantId);
   
  
        List<MenuItem> allMenuItems = menuItemRepository.findAll();
       
        for (MenuItem item : allMenuItems) {
            System.out.println("Menu item: " + item.getName() + 
                             ", restaurantId: " + item.getRestaurantId() + 
                             ", deleted: " + item.isDeleted());
        }
        
       
    }
}
