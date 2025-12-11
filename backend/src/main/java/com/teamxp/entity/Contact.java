package com.teamxp.entity;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is mandatory")
    @Column(nullable = false)
    private String name;

    // Multiple phone numbers
    @ElementCollection
    @CollectionTable(name = "contact_phones", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "phone_number")
    private List<String> phones = new ArrayList<>();

    // Multiple email addresses
    @ElementCollection
    @CollectionTable(name = "contact_emails", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "email_address")
    private List<String> emails = new ArrayList<>();

    // Address field
    @Column(length = 500)
    private String address;

    // Favorite status
    @Column(name = "is_favorite", nullable = false)
    private Boolean isFavorite = false;

    // Multiple tags
    @ElementCollection
    @CollectionTable(name = "contact_tags", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    // Notes field
    @Column(length = 1000)
    private String notes;

    // Social media accounts
    @ElementCollection
    @CollectionTable(name = "contact_social_media", joinColumns = @JoinColumn(name = "contact_id"))
    private List<SocialMediaAccount> socialMedia = new ArrayList<>();

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "last_modified", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastModified;

    // Constructors
    public Contact() {
        this.createdAt = new Date();
        this.lastModified = new Date();
    }

    public Contact(String name, List<String> phones, List<String> emails, String address) {
        this();
        this.name = name;
        this.phones = phones != null ? phones : new ArrayList<>();
        this.emails = emails != null ? emails : new ArrayList<>();
        this.address = address;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) {
        this.name = name;
        this.lastModified = new Date();
    }

    public List<String> getPhones() { return phones; }
    public void setPhones(List<String> phones) {
        this.phones = phones != null ? phones : new ArrayList<>();
        this.lastModified = new Date();
    }

    public List<String> getEmails() { return emails; }
    public void setEmails(List<String> emails) {
        this.emails = emails != null ? emails : new ArrayList<>();
        this.lastModified = new Date();
    }

    public String getAddress() { return address; }
    public void setAddress(String address) {
        this.address = address;
        this.lastModified = new Date();
    }

    public Boolean getIsFavorite() { return isFavorite; }
    public void setIsFavorite(Boolean favorite) {
        isFavorite = favorite;
        this.lastModified = new Date();
    }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) {
        this.tags = tags != null ? tags : new ArrayList<>();
        this.lastModified = new Date();
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) {
        this.notes = notes;
        this.lastModified = new Date();
    }

    public List<SocialMediaAccount> getSocialMedia() { return socialMedia; }
    public void setSocialMedia(List<SocialMediaAccount> socialMedia) {
        this.socialMedia = socialMedia != null ? socialMedia : new ArrayList<>();
        this.lastModified = new Date();
    }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getLastModified() { return lastModified; }
    public void setLastModified(Date lastModified) { this.lastModified = lastModified; }

    // Helper methods
    public void addPhone(String phone) {
        if (phone != null && !phone.trim().isEmpty() && !phones.contains(phone)) {
            phones.add(phone);
            this.lastModified = new Date();
        }
    }

    public void addEmail(String email) {
        if (email != null && !email.trim().isEmpty() && !emails.contains(email)) {
            emails.add(email);
            this.lastModified = new Date();
        }
    }

    public void addTag(String tag) {
        if (tag != null && !tag.trim().isEmpty() && !tags.contains(tag)) {
            tags.add(tag);
            this.lastModified = new Date();
        }
    }

    public void toggleFavorite() {
        this.isFavorite = !this.isFavorite;
        this.lastModified = new Date();
    }

    // Get primary phone (first phone)
    public String getPrimaryPhone() {
        return phones != null && !phones.isEmpty() ? phones.get(0) : null;
    }

    // Get primary email (first email)
    public String getPrimaryEmail() {
        return emails != null && !emails.isEmpty() ? emails.get(0) : null;
    }
}
