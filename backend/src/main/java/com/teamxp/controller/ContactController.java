package com.teamxp.controller;

import com.teamxp.dto.ContactDTO;
import com.teamxp.dto.ContactRequestDTO;
import com.teamxp.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/contacts")
@Tag(name = "Contact Management", description = "APIs for managing contacts")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class ContactController {

    @Autowired
    private ContactService contactService;

    @GetMapping
    @Operation(summary = "Get all contacts")
    public ResponseEntity<List<ContactDTO>> getAllContacts() {
        List<ContactDTO> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get contact by ID")
    public ResponseEntity<ContactDTO> getContactById(@PathVariable Long id) {
        ContactDTO contact = contactService.getContactById(id);
        return ResponseEntity.ok(contact);
    }

    @PostMapping
    @Operation(summary = "Create a new contact")
    public ResponseEntity<ContactDTO> createContact(@Valid @RequestBody ContactRequestDTO contactRequest) {
        ContactDTO createdContact = contactService.createContact(contactRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdContact);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing contact")
    public ResponseEntity<ContactDTO> updateContact(
            @PathVariable Long id,
            @Valid @RequestBody ContactRequestDTO contactRequest) {
        ContactDTO updatedContact = contactService.updateContact(id, contactRequest);
        return ResponseEntity.ok(updatedContact);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a contact")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/favorites")
    @Operation(summary = "Get all favorite contacts")
    public ResponseEntity<List<ContactDTO>> getFavoriteContacts() {
        List<ContactDTO> favorites = contactService.getFavoriteContacts();
        return ResponseEntity.ok(favorites);
    }

    @PatchMapping("/{id}/favorite")
    @Operation(summary = "Toggle favorite status")
    public ResponseEntity<ContactDTO> toggleFavorite(@PathVariable Long id) {
        ContactDTO updatedContact = contactService.toggleFavorite(id);
        return ResponseEntity.ok(updatedContact);
    }

    @GetMapping("/search")
    @Operation(summary = "Search contacts")
    public ResponseEntity<List<ContactDTO>> searchContacts(@RequestParam String keyword) {
        List<ContactDTO> results = contactService.searchContacts(keyword);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/export/excel")
    @Operation(summary = "Export contacts to Excel")
    public ResponseEntity<byte[]> exportToExcel() {
        try {
            System.out.println("开始导出Excel...");
            byte[] excelData = contactService.exportContactsToExcel();
            System.out.println("Excel数据生成完成，大小: " + excelData.length + " bytes");

            HttpHeaders headers = new HttpHeaders();
            // 设置正确的Content-Type
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "contacts_export.xlsx");
            headers.setContentLength(excelData.length);

            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("导出Excel时出错: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("导出失败: " + e.getMessage()).getBytes());
        }
    }

    @PostMapping("/import/excel")
    @Operation(summary = "Import contacts from Excel file")
    public ResponseEntity<List<ContactDTO>> importFromExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (!file.getOriginalFilename().endsWith(".xlsx") &&
                !file.getOriginalFilename().endsWith(".xls")) {
            return ResponseEntity.badRequest().build();
        }

        try {
            List<ContactDTO> importedContacts = contactService.importContactsFromExcel(file);
            return ResponseEntity.ok(importedContacts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/json")
    @Operation(summary = "Export contacts to JSON")
    public ResponseEntity<String> exportToJson() {
        String json = contactService.exportContactsToJson();
        return ResponseEntity.ok(json);
    }

    @PostMapping("/import/json")
    @Operation(summary = "Import contacts from JSON")
    public ResponseEntity<List<ContactDTO>> importFromJson(@RequestBody String jsonContent) {
        try {
            List<ContactDTO> importedContacts = contactService.importContactsFromJson(jsonContent);
            return ResponseEntity.ok(importedContacts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Contact API is running");
    }
}