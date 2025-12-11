# Team XP Contact Management System - Backend
TeamXP_contacts_backend

## Project Introduction
Enhanced Spring Boot backend for the contact management system with full RESTful API support.

## Technology Stack
Java 8
Spring Boot 2.6.13
Spring Data JPA
H2 Database (In-memory)
Apache POI (Excel processing)
Swagger/OpenAPI 3.0
Maven

## Features
- Add contacts with multiple phone numbers and emails
- Edit contact information
- Delete contacts
- View contact list with pagination
- Mark contacts as favorites
- Filter and search contacts
- Import/Export to Excel format
- Import/Export to JSON format
- H2 database console
- Swagger API documentation

## Project Structure
TeamXP_contacts_backend/
├── .idea/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── teamxp/
│   │   │           ├── Application.java
│   │   │           ├── DataInitializer.java
│   │   │           ├── config/
│   │   │           │   └── CorsConfig.java
│   │   │           ├── controller/
│   │   │           │   ├── ContactController.java
│   │   │           │   └── BasicController.java
│   │   │           ├── dto/
│   │   │           │   ├── ContactDTO.java
│   │   │           │   └── ContactRequestDTO.java
│   │   │           ├── entity/
│   │   │           │   ├── Contact.java
│   │   │           │   ├── SocialMediaAccount.java
│   │   │           │   └── User.java
│   │   │           ├── repository/
│   │   │           │   └── ContactRepository.java
│   │   │           └── service/
│   │   │               ├── ContactService.java
│   │   │               └── ContactServiceImpl.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── data.sql
│   └── test/
│       └── java/
│           └── com/
│               └── teamxp/
├── HELP.md
├── .gitignore
├── README.md
├── codestyle.md
└── pom.xml

## Running Instructions

### Requirements
JDK 8+
Maven 3.6+

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/TeamXP/contacts_backend.git