package com.teamxp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Basic Controller", description = "Basic API endpoints")
public class BasicController {

    @GetMapping("/test")
    @Operation(summary = "Test endpoint")
    public String test() {
        return "Team XP Contact Backend is running normally! Current time: " + new java.util.Date();
    }

    @GetMapping("/")
    @Operation(summary = "Home endpoint")
    public String home() {
        return "Welcome to Team XP Contact Management System Backend API!";
    }

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public String health() {
        return "Application status: normal operation";
    }

    @GetMapping("/info")
    @Operation(summary = "API information")
    public String info() {
        // Java 8兼容的多行字符串写法（不使用文本块）
        return "Team XP Contact Management System API\n" +
                "Version: 2.0.0\n" +
                "Features:\n" +
                "- Contact CRUD operations\n" +
                "- Multiple phone numbers and emails\n" +
                "- Favorite contacts\n" +
                "- Excel import/export\n" +
                "- JSON import/export\n" +
                "- Search functionality";
    }
}