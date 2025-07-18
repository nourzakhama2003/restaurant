package com.example.restaurant_backend.controller;

import com.example.restaurant_backend.entity.MenuItem;
import com.example.restaurant_backend.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = "*")

public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @GetMapping("/restaurant/{restaurantId}")
    public List<MenuItem> getMenuByRestaurant(@PathVariable String restaurantId) {
        return menuItemService.getByRestaurant(restaurantId);
    }

    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuItemService.getAll();
    }

    @PostMapping
    public MenuItem createMenuItem(@RequestBody MenuItem menuItem) {

        return menuItemService.create(menuItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable String id, @RequestBody MenuItem menuItem) {
        return menuItemService.update(id, menuItem)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public void deleteMenuItem(@PathVariable String id) {
        menuItemService.delete(id);
    }
}
