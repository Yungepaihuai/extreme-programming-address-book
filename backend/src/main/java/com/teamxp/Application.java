package com.teamxp;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
        info = @Info(
                title = "Team XP Contact Management System API",
                version = "2.0.0",
                description = "Backend API for Team XP Contact Management System with Excel import/export and favorites"
        )
)
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}