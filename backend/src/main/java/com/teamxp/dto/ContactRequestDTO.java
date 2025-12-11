package com.teamxp.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class ContactRequestDTO {

    @NotBlank(message = "Name is mandatory")
    private String name;

    @NotNull(message = "Phones list cannot be null")
    private List<String> phones = new ArrayList<>();

    private List<String> emails = new ArrayList<>();
    private String address;
    private Boolean isFavorite = false;
    private List<String> tags = new ArrayList<>();
    private String notes;

    // Getters and Setters
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
}