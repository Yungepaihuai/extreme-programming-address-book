package com.teamxp.service;

import com.teamxp.dto.ContactDTO;
import com.teamxp.dto.ContactRequestDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ContactService {

    // Get all contacts
    List<ContactDTO> getAllContacts();

    // Get contact by ID
    ContactDTO getContactById(Long id);

    // Create new contact
    ContactDTO createContact(ContactRequestDTO contactRequest);

    // Update contact
    ContactDTO updateContact(Long id, ContactRequestDTO contactRequest);

    // Delete contact
    void deleteContact(Long id);

    // Get favorite contacts
    List<ContactDTO> getFavoriteContacts();

    // Toggle favorite status
    ContactDTO toggleFavorite(Long id);

    // Search contacts
    List<ContactDTO> searchContacts(String keyword);

    // Export contacts to Excel
    byte[] exportContactsToExcel();

    // Import contacts from Excel
    List<ContactDTO> importContactsFromExcel(MultipartFile file);

    // Export contacts to JSON
    String exportContactsToJson();

    // Import contacts from JSON
    List<ContactDTO> importContactsFromJson(String jsonContent);
}
