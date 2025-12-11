package com.teamxp.service;

import com.teamxp.dto.ContactDTO;
import com.teamxp.dto.ContactRequestDTO;
import com.teamxp.entity.Contact;
import com.teamxp.repository.ContactRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactServiceImpl implements ContactService {

    @Autowired
    private ContactRepository contactRepository;

    @Override
    public List<ContactDTO> getAllContacts() {
        return contactRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ContactDTO getContactById(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found with id: " + id));
        return convertToDTO(contact);
    }

    @Override
    public ContactDTO createContact(ContactRequestDTO contactRequest) {
        // Validate request
        if (contactRequest.getPhones() == null || contactRequest.getPhones().isEmpty()) {
            throw new RuntimeException("At least one phone number is required");
        }

        Contact contact = new Contact();
        updateContactFromRequest(contact, contactRequest);

        Contact savedContact = contactRepository.save(contact);
        return convertToDTO(savedContact);
    }

    @Override
    public ContactDTO updateContact(Long id, ContactRequestDTO contactRequest) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found with id: " + id));

        // Validate request
        if (contactRequest.getPhones() == null || contactRequest.getPhones().isEmpty()) {
            throw new RuntimeException("At least one phone number is required");
        }

        updateContactFromRequest(contact, contactRequest);

        Contact updatedContact = contactRepository.save(contact);
        return convertToDTO(updatedContact);
    }

    @Override
    public void deleteContact(Long id) {
        if (!contactRepository.existsById(id)) {
            throw new RuntimeException("Contact not found with id: " + id);
        }
        contactRepository.deleteById(id);
    }

    @Override
    public List<ContactDTO> getFavoriteContacts() {
        return contactRepository.findByIsFavoriteTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ContactDTO toggleFavorite(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found with id: " + id));

        contact.toggleFavorite();
        Contact updatedContact = contactRepository.save(contact);

        return convertToDTO(updatedContact);
    }

    @Override
    public List<ContactDTO> searchContacts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllContacts();
        }

        String searchTerm = keyword.toLowerCase().trim();
        List<Contact> results = new ArrayList<>();

        // Search by name
        results.addAll(contactRepository.findByNameContainingIgnoreCase(searchTerm));

        // Search by phone
        results.addAll(contactRepository.findByPhoneNumberContaining(searchTerm));

        // Search by email
        results.addAll(contactRepository.findByEmailContaining(searchTerm));

        // Search by tag
        results.addAll(contactRepository.findByTagContaining(searchTerm));

        // Remove duplicates (by ID)
        return results.stream()
                .distinct()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public byte[] exportContactsToExcel() {
        List<Contact> contacts = contactRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Contacts");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "ID", "Name", "Favorite", "Primary Phone", "Additional Phones",
                    "Primary Email", "Additional Emails", "Address", "Tags", "Notes",
                    "Created Date", "Last Modified"
            };

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create data rows
            int rowNum = 1;
            for (Contact contact : contacts) {
                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(contact.getId());
                row.createCell(1).setCellValue(contact.getName());
                row.createCell(2).setCellValue(contact.getIsFavorite() ? "Yes" : "No");
                row.createCell(3).setCellValue(contact.getPrimaryPhone() != null ? contact.getPrimaryPhone() : "");

                // Additional phones
                String additionalPhones = contact.getPhones().stream()
                        .skip(1)
                        .collect(Collectors.joining("; "));
                row.createCell(4).setCellValue(additionalPhones);

                // Emails
                row.createCell(5).setCellValue(contact.getPrimaryEmail() != null ? contact.getPrimaryEmail() : "");

                String additionalEmails = contact.getEmails().stream()
                        .skip(1)
                        .collect(Collectors.joining("; "));
                row.createCell(6).setCellValue(additionalEmails);

                row.createCell(7).setCellValue(contact.getAddress() != null ? contact.getAddress() : "");
                row.createCell(8).setCellValue(String.join(", ", contact.getTags()));
                row.createCell(9).setCellValue(contact.getNotes() != null ? contact.getNotes() : "");
                row.createCell(10).setCellValue(contact.getCreatedAt().toString());
                row.createCell(11).setCellValue(contact.getLastModified().toString());
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Error exporting to Excel: " + e.getMessage(), e);
        }
    }

    @Override
    public List<ContactDTO> importContactsFromExcel(MultipartFile file) {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            List<ContactDTO> importedContacts = new ArrayList<>();

            // Skip header row
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();

                try {
                    String name = getCellValue(row.getCell(1));
                    String favoriteStr = getCellValue(row.getCell(2));
                    String primaryPhone = getCellValue(row.getCell(3));
                    String additionalPhones = getCellValue(row.getCell(4));
                    String primaryEmail = getCellValue(row.getCell(5));
                    String additionalEmails = getCellValue(row.getCell(6));
                    String address = getCellValue(row.getCell(7));
                    String tagsStr = getCellValue(row.getCell(8));
                    String notes = getCellValue(row.getCell(9));

                    // Validate required fields
                    if (name == null || name.trim().isEmpty() || primaryPhone == null || primaryPhone.trim().isEmpty()) {
                        continue; // Skip invalid rows
                    }

                    // Prepare phone list
                    List<String> phones = new ArrayList<>();
                    phones.add(primaryPhone.trim());
                    if (additionalPhones != null && !additionalPhones.trim().isEmpty()) {
                        String[] additionalPhonesArray = additionalPhones.split(";");
                        for (String phone : additionalPhonesArray) {
                            if (!phone.trim().isEmpty()) {
                                phones.add(phone.trim());
                            }
                        }
                    }

                    // Prepare email list
                    List<String> emails = new ArrayList<>();
                    if (primaryEmail != null && !primaryEmail.trim().isEmpty()) {
                        emails.add(primaryEmail.trim());
                    }
                    if (additionalEmails != null && !additionalEmails.trim().isEmpty()) {
                        String[] additionalEmailsArray = additionalEmails.split(";");
                        for (String email : additionalEmailsArray) {
                            if (!email.trim().isEmpty()) {
                                emails.add(email.trim());
                            }
                        }
                    }

                    // Prepare tags list
                    List<String> tags = new ArrayList<>();
                    if (tagsStr != null && !tagsStr.trim().isEmpty()) {
                        String[] tagsArray = tagsStr.split(",");
                        for (String tag : tagsArray) {
                            if (!tag.trim().isEmpty()) {
                                tags.add(tag.trim());
                            }
                        }
                    }

                    // Create contact
                    ContactRequestDTO contactRequest = new ContactRequestDTO();
                    contactRequest.setName(name.trim());
                    contactRequest.setPhones(phones);
                    contactRequest.setEmails(emails);
                    contactRequest.setAddress(address != null ? address.trim() : null);
                    contactRequest.setIsFavorite("Yes".equalsIgnoreCase(favoriteStr));
                    contactRequest.setTags(tags);
                    contactRequest.setNotes(notes != null ? notes.trim() : null);

                    ContactDTO contactDTO = createContact(contactRequest);
                    importedContacts.add(contactDTO);

                } catch (Exception e) {
                    // Skip rows with errors and continue
                    System.err.println("Error importing row: " + e.getMessage());
                }
            }

            return importedContacts;

        } catch (IOException e) {
            throw new RuntimeException("Error importing Excel file: " + e.getMessage(), e);
        }
    }

    @Override
    public String exportContactsToJson() {
        List<ContactDTO> contacts = getAllContacts();
        // Simple JSON serialization (in production, use Jackson directly)
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < contacts.size(); i++) {
            ContactDTO contact = contacts.get(i);
            json.append("{")
                    .append("\"id\":").append(contact.getId()).append(",")
                    .append("\"name\":\"").append(contact.getName()).append("\",")
                    .append("\"isFavorite\":").append(contact.getIsFavorite())
                    .append("}");
            if (i < contacts.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");
        return json.toString();
    }

    @Override
    public List<ContactDTO> importContactsFromJson(String jsonContent) {
        // Simplified implementation - in production, use Jackson ObjectMapper
        // For now, just return empty list
        return new ArrayList<>();
    }

    // Helper methods
    private ContactDTO convertToDTO(Contact contact) {
        ContactDTO dto = new ContactDTO();
        dto.setId(contact.getId());
        dto.setName(contact.getName());
        dto.setPhones(new ArrayList<>(contact.getPhones()));
        dto.setEmails(new ArrayList<>(contact.getEmails()));
        dto.setAddress(contact.getAddress());
        dto.setIsFavorite(contact.getIsFavorite());
        dto.setTags(new ArrayList<>(contact.getTags()));
        dto.setNotes(contact.getNotes());
        dto.setCreatedAt(contact.getCreatedAt());
        dto.setLastModified(contact.getLastModified());
        return dto;
    }

    private void updateContactFromRequest(Contact contact, ContactRequestDTO request) {
        contact.setName(request.getName());
        contact.setPhones(request.getPhones());
        contact.setEmails(request.getEmails());
        contact.setAddress(request.getAddress());
        contact.setIsFavorite(request.getIsFavorite());
        contact.setTags(request.getTags());
        contact.setNotes(request.getNotes());
    }

    private String getCellValue(Cell cell) {
        if (cell == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    // Remove trailing .0 if it's an integer
                    double num = cell.getNumericCellValue();
                    if (num == Math.floor(num)) {
                        return String.valueOf((int) num);
                    } else {
                        return String.valueOf(num);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
}
