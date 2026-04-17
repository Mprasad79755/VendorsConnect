package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class DemoController {

    @GetMapping("/")
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", Instant.now().toString());
        response.put("status", 200);
        response.put("message", "Success");
        
        Map<String, String> data = new HashMap<>();
        data.put("info", "Dummy Spring Boot backend is actively running!");
        response.put("data", data);
        
        return response;
    }
}
