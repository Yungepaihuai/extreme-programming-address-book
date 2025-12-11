package com.teamxp;

import com.teamxp.entity.Contact;
import com.teamxp.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ContactRepository contactRepository;

    @Override
    public void run(String... args) throws Exception {
        // Clear existing data
        contactRepository.deleteAll();

        // Create sample contact 1
        Contact contact1 = new Contact();
        contact1.setName("John Smith");
        contact1.setPhones(Arrays.asList("(123) 456-7890", "098-765-4321"));
        contact1.setEmails(Arrays.asList("john.smith@example.com", "john@work.com"));
        contact1.setAddress("123 Main Street, New York, NY 10001");
        contact1.setIsFavorite(true);
        contact1.setTags(Arrays.asList("Family", "Work", "VIP"));
        contact1.setNotes("Important client. Meeting scheduled for next week.");

        // Create sample contact 2
        Contact contact2 = new Contact();
        contact2.setName("Emily Johnson");
        contact2.setPhones(Arrays.asList("555-123-4567"));
        contact2.setEmails(Arrays.asList("emily.johnson@example.com"));
        contact2.setAddress("456 Oak Avenue, Los Angeles, CA 90001");
        contact2.setIsFavorite(false);
        contact2.setTags(Arrays.asList("Friend", "College"));
        contact2.setNotes("College friend. Birthday in March.");

        // Create sample contact 3
        Contact contact3 = new Contact();
        contact3.setName("Michael Brown");
        contact3.setPhones(Arrays.asList("+1-202-555-0178", "202-555-0199"));
        contact3.setEmails(Arrays.asList("michael.brown@company.com", "mbrown@personal.com"));
        contact3.setAddress("789 Pine Road, Chicago, IL 60601");
        contact3.setIsFavorite(true);
        contact3.setTags(Arrays.asList("Work", "Manager"));
        contact3.setNotes("Project manager. Prefers email communication.");

        // Save sample contacts
        contactRepository.save(contact1);
        contactRepository.save(contact2);
        contactRepository.save(contact3);

        System.out.println("Sample contacts initialized successfully!");
    }
}