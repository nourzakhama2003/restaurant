package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.MenuItem;
import com.example.restaurant_backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<MenuItem> getByRestaurant(String restaurantId) {
        return menuItemRepository.findByRestaurantIdAndDeletedFalse(restaurantId);
    }

    public MenuItem create(MenuItem item) {
        item.setId(null);
        item.setDeleted(false);
        return menuItemRepository.save(item);
    }

    public Optional<MenuItem> update(String id, MenuItem item) {
        return menuItemRepository.findById(id).map(existing -> {
            existing.setName(item.getName());
            existing.setDescription(item.getDescription());
            existing.setPrice(item.getPrice());
            existing.setRestaurantId(item.getRestaurantId());
            return menuItemRepository.save(existing);
        });
    }

    public void delete(String id) {
        menuItemRepository.findById(id).ifPresent(item -> {
            menuItemRepository.deleteById(id);
        });
    }

}
