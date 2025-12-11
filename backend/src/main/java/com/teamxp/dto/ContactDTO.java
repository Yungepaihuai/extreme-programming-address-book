package com.teamxp.dto;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ContactDTO {
    private Long id;
    private String name;
    private List<String> phones = new ArrayList<>();
    private List<String> emails = new ArrayList<>();
    private String address;
    private Boolean isFavorite = false;
    private List<String> tags = new ArrayList<>();
    private String notes;
    private Date createdAt;
    private Date lastModified;

    // Constructors
    public ContactDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getPhones() { return phones; }
    public void setPhones(List<String> phones) {
        this.phones = phones != null ? phones : new ArrayList<>();
    }

    public List<String> getEmails() { return emails; }
    public void setEmails(List<String> emails) {
        this.emails = emails != null ? emails : new ArrayList<>();
    }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getIsFavorite() { return isFavorite; }
    public void setIsFavorite(Boolean favorite) { isFavorite = favorite; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) {
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getLastModified() { return lastModified; }
    public void setLastModified(Date lastModified) { this.lastModified = lastModified; }
}
