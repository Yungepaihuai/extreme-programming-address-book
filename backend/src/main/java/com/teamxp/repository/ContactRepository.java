package com.teamxp.repository;

import com.teamxp.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    // Find all favorite contacts
    List<Contact> findByIsFavoriteTrue();

    // Search contacts by name (case-insensitive)
    List<Contact> findByNameContainingIgnoreCase(String name);

    // Search contacts by phone number
    @Query("SELECT c FROM Contact c JOIN c.phones p WHERE p LIKE %?1%")
    List<Contact> findByPhoneNumberContaining(String phone);

    // Search contacts by email
    @Query("SELECT c FROM Contact c JOIN c.emails e WHERE e LIKE %?1%")
    List<Contact> findByEmailContaining(String email);

    // Search contacts by tag
    @Query("SELECT c FROM Contact c JOIN c.tags t WHERE t LIKE %?1%")
    List<Contact> findByTagContaining(String tag);
}
