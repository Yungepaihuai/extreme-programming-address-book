package com.teamxp.entity;

import javax.persistence.Embeddable;

@Embeddable
public class SocialMediaAccount {

    private String platform;
    private String account;

    // Constructors
    public SocialMediaAccount() {}

    public SocialMediaAccount(String platform, String account) {
        this.platform = platform;
        this.account = account;
    }

    // Getters and Setters
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getAccount() { return account; }
    public void setAccount(String account) { this.account = account; }
}