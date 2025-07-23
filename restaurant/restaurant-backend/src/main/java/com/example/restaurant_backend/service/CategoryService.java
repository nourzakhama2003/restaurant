package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.Category;
import com.example.restaurant_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(String id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(Category category) {
        if (category.getImageBase64() == null || category.getImageBase64().isEmpty()) {
            // Store the default image path (frontend should use this path)
            category.setImageBase64("/assets/images/fastfood.jpeg");
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(String id, Category category) {
        if (category.getImageBase64() == null || category.getImageBase64().isEmpty()) {
            category.setImageBase64("/assets/images/fastfood.jpeg");
        }
        category.setId(id);
        return categoryRepository.save(category);
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }
} 