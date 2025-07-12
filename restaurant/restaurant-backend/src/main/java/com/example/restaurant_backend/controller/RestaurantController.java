package com.example.restaurant_backend.controller;

import com.example.restaurant_backend.entity.Restaurant;
import com.example.restaurant_backend.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        try {
            System.out.println("Getting all restaurants...");
            List<Restaurant> restaurants = restaurantService.getAllRestaurants();
            System.out.println("Found " + restaurants.size() + " restaurants");
            return restaurants;
        } catch (Exception e) {
            System.err.println("Error in getAllRestaurants: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping
    public Restaurant createRestaurant(@RequestBody Restaurant restaurant) {
        return restaurantService.createRestaurant(restaurant);
    }

    @PutMapping("/{id}")
    public Restaurant updateRestaurant(@PathVariable String id, @RequestBody Restaurant updated) {
        return restaurantService.updateRestaurant(id, updated).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteRestaurant(@PathVariable String id) {
        restaurantService.deleteRestaurant(id);
    }

    @GetMapping("/{id}")
    public Restaurant getRestaurantById(@PathVariable String id) {
        return restaurantService.getRestaurantById(id).orElse(null);
    }

    // Debug endpoint to test menu item loading
    @GetMapping("/debug/menu/{restaurantId}")
    public String debugMenuItems(@PathVariable String restaurantId) {
        restaurantService.debugMenuItemLoading(restaurantId);
        return "Debug output written to console. Check server logs.";
    }
}
