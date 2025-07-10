package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Restaurant;
import com.example.restaurant_backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findByDeletedFalse();
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
}
