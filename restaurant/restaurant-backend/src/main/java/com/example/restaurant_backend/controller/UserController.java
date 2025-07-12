package com.example.restaurant_backend.controller;

import com.example.restaurant_backend.Exception.GlobalException;
import com.example.restaurant_backend.entity.User;
import com.example.restaurant_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Create
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            // Check if email already exists
            if (this.userService.existsByEmail(user.getEmail())) {
                throw new GlobalException("Email already exists");
            }
            
            // Check if phone number already exists (if provided)
            if (user.getPhone() != null && !user.getPhone().trim().isEmpty() 
                && this.userService.existsByPhone(user.getPhone())) {
                throw new GlobalException("Phone number already exists");
            }

            User savedUser = this.userService.saveUser(user);
            return ResponseEntity.status(201).body(savedUser);
        } catch (Exception e) {
            throw new GlobalException("Failed to create user: " + e.getMessage());
        }
    }

    // Read all
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = this.userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve users: " + e.getMessage());
        }
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        try {
            Optional<User> user = this.userService.getUserById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve user: " + e.getMessage());
        }
    }

    // Read by Email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        try {
            Optional<User> user = this.userService.getUserByEmail(email);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve user by email: " + e.getMessage());
        }
    }

    // Read by Phone Number
    @GetMapping("/number/{number}")
    public ResponseEntity<User> getUserByNumber(@PathVariable String number) {
        try {
            Optional<User> user = this.userService.getUserByPhone(number);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve user by phone number: " + e.getMessage());
        }
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        try {
            // Check if email is available for update
            if (!this.userService.isEmailAvailableForUpdate(user.getEmail(), id)) {
                throw new GlobalException("Email already exists");
            }
            
            // Check if phone number is available for update
            if (user.getPhone() != null && !this.userService.isPhoneAvailableForUpdate(user.getPhone(), id)) {
                throw new GlobalException("Phone number already exists");
            }

            User updatedUser = this.userService.updateUser(id, user);
            if (updatedUser != null) {
                return ResponseEntity.ok(updatedUser);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to update user: " + e.getMessage());
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        try {
            boolean deleted = this.userService.deleteUser(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to delete user: " + e.getMessage());
        }
    }

    // Check if exists
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> userExists(@PathVariable String id) {
        try {
            boolean exists = this.userService.existsById(id);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            throw new GlobalException("Failed to check user existence: " + e.getMessage());
        }
    }

    // Check if email exists
    @GetMapping("/email/{email}/exists")
    public ResponseEntity<Boolean> emailExists(@PathVariable String email) {
        try {
            boolean exists = this.userService.existsByEmail(email);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            throw new GlobalException("Failed to check email existence: " + e.getMessage());
        }
    }

    // Check if phone number exists
    @GetMapping("/number/{number}/exists")
    public ResponseEntity<Boolean> numberExists(@PathVariable String number) {
        try {
            boolean exists = this.userService.existsByPhone(number);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            throw new GlobalException("Failed to check phone number existence: " + e.getMessage());
        }
    }
}
