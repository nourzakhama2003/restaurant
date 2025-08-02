package com.example.restaurant_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "categories")
public class Category {
    @Id
    private String id;
    private String name;
    private String description; 
    private String imageBase64; 
} 