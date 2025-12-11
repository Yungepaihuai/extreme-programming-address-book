// models.js - Enhanced Contact Management System Data Models
// Team XP Project

class Contact {
    constructor(name = '', phones = [], emails = [], address = '') {
        this.id = Date.now() + Math.floor(Math.random() * 1000);
        this.name = name;
        this.phones = phones;  // Array of phone numbers
        this.emails = emails;  // Array of email addresses
        this.address = address;
        this.isFavorite = false;
        this.socialMedia = [];  // Array of {platform: string, account: string}
        this.tags = [];         // Array of tag strings
        this.notes = '';        // Additional notes
        this.createdAt = new Date().toISOString();
        this.lastModified = new Date().toISOString();
    }
    
    // Add a phone number
    addPhone(phone) {
        if (phone && !this.phones.includes(phone)) {
            this.phones.push(phone);
            this.lastModified = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    // Remove a phone number
    removePhone(phone) {
        const index = this.phones.indexOf(phone);
        if (index > -1) {
            this.phones.splice(index, 1);
            this.lastModified = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    // Add an email address
    addEmail(email) {
        if (email && !this.emails.includes(email)) {
            this.emails.push(email);
            this.lastModified = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    // Remove an email address
    removeEmail(email) {
        const index = this.emails.indexOf(email);
        if (index > -1) {
            this.emails.splice(index, 1);
            this.lastModified = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    // Toggle favorite status
    toggleFavorite() {
        this.isFavorite = !this.isFavorite;
        this.lastModified = new Date().toISOString();
        return this.isFavorite;
    }
    
    // Add a tag
    addTag(tag) {
        if (tag && !this.tags.includes(tag)) {
            this.tags.push(tag);
            this.lastModified = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    // Remove a tag
    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            this.lastModified = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    // Add social media account
    addSocialMedia(platform, account) {
        this.socialMedia.push({ platform, account });
        this.lastModified = new Date().toISOString();
    }
    
    // Convert to simple object for storage
    toSimpleObject() {
        return {
            id: this.id,
            name: this.name,
            phones: this.phones,
            emails: this.emails,
            address: this.address,
            isFavorite: this.isFavorite,
            socialMedia: this.socialMedia,
            tags: this.tags,
            notes: this.notes,
            createdAt: this.createdAt,
            lastModified: this.lastModified
        };
    }
    
    // Create Contact instance from simple object
    static fromSimpleObject(data) {
        const contact = new Contact(
            data.name || '',
            data.phones || [],
            data.emails || [],
            data.address || ''
        );
        contact.id = data.id || contact.id;
        contact.isFavorite = data.isFavorite || false;
        contact.socialMedia = data.socialMedia || [];
        contact.tags = data.tags || [];
        contact.notes = data.notes || '';
        contact.createdAt = data.createdAt || contact.createdAt;
        contact.lastModified = data.lastModified || contact.lastModified;
        return contact;
    }
    
    // Get primary phone (first phone)
    getPrimaryPhone() {
        return this.phones.length > 0 ? this.phones[0] : '';
    }
    
    // Get primary email (first email)
    getPrimaryEmail() {
        return this.emails.length > 0 ? this.emails[0] : '';
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Contact };
}