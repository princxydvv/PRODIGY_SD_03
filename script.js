(() => {
    // DOM Elements
    const contactForm = document.getElementById("contact-form");
    const nameInput = document.getElementById("name-input");
    const phoneInput = document.getElementById("phone-input");
    const emailInput = document.getElementById("email-input");
    const contactsList = document.getElementById("contacts-list");
    const submitButton = document.getElementById("submit-button");

    // Error elements
    const nameError = document.getElementById("name-error");
    const phoneError = document.getElementById("phone-error");
    const emailError = document.getElementById("email-error");

    // State
    let contacts = [];
    let editIndex = null;

    // Helper function: validate form fields and show errors
    function validateForm() {
        let isValid = true;

        // Name validation: non-empty
        if (!nameInput.value.trim()) {
            nameError.textContent = "Name is required.";
            isValid = false;
        } else {
            nameError.textContent = "";
        }

        // Phone validation: matches pattern
        const phonePattern = /^\+?[0-9\s\-]{7,20}$/;
        if (!phoneInput.value.trim()) {
            phoneError.textContent = "Phone number is required.";
            isValid = false;
        } else if (!phonePattern.test(phoneInput.value.trim())) {
            phoneError.textContent = "Enter a valid phone number.";
            isValid = false;
        } else {
            phoneError.textContent = "";
        }

        // Email validation: valid email format
        if (!emailInput.value.trim()) {
            emailError.textContent = "Email address is required.";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            emailError.textContent = "Enter a valid email address.";
            isValid = false;
        } else {
            emailError.textContent = "";
        }

        return isValid;
    }

    // Render contacts to DOM
    function renderContacts() {
        contactsList.innerHTML = "";
        if (contacts.length === 0) {
            contactsList.innerHTML =
                '<p style="color: var(--color-text-secondary); font-style: italic;">No contacts added yet.</p>';
            return;
        }
        contacts.forEach((contact, index) => {
            const card = document.createElement("article");
            card.className = "contact-card";
            card.setAttribute("role", "listitem");
            card.setAttribute("tabindex", "0");
            card.innerHTML = `
 
    <h2 class="contact-name">${escapeHtml(contact.name)}</h2>
    <p class="contact-field" title="Phone Number">${escapeHtml(
                contact.phone
            )}</p>
    <p class="contact-field" title="Email Address">${escapeHtml(
                contact.email
            )}</p>
</div >
    <div class="contact-actions">
        <button class="btn btn-edit" type="button" aria-label="Edit contact ${escapeHtml(
                contact.name
            )}" data-index="${index}">Edit</button>
        <button class="btn btn-delete" type="button" aria-label="Delete contact ${escapeHtml(
                contact.name
            )}" data-index="${index}">Delete</button>
    </div>
`;
            contactsList.appendChild(card);
        });
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        return text.replace(/[&<>"']/g, function (m) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            }[m];
        });
    }

    // Load contacts from localStorage
    function loadContacts() {
        const saved = localStorage.getItem("contacts");
        if (saved) {
            try {
                contacts = JSON.parse(saved);
            } catch {
                contacts = [];
            }
        }
    }

    // Save contacts to localStorage
    function saveContacts() {
        localStorage.setItem("contacts", JSON.stringify(contacts));
    }

    // Reset form to default state
    function resetForm() {
        contactForm.reset();
        editIndex = null;
        submitButton.textContent = "Add Contact";
        clearErrors();
    }

    // Clear all validation errors
    function clearErrors() {
        nameError.textContent = "";
        phoneError.textContent = "";
        emailError.textContent = "";
    }

    // Fill form with contact data for editing
    function fillFormForEdit(index) {
        const contact = contacts[index];
        if (!contact) return;
        nameInput.value = contact.name;
        phoneInput.value = contact.phone;
        emailInput.value = contact.email;
        editIndex = index;
        submitButton.textContent = "Update Contact";
    }

    // Delete contact by index
    function deleteContact(index) {
        if (!contacts[index]) return;
        const confirmed = confirm(
            `Are you sure you want to delete contact "${contacts[index].name}" ?`
        );
        if (confirmed) {
            contacts.splice(index, 1);
            saveContacts();
            renderContacts();
            if (editIndex === index) {
                resetForm();
            } else if (editIndex !== null && editIndex > index) {
                editIndex--; // Adjust edit index after deletion
            }
        }
    }

    // Form submit handler
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const newContact = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
        };

        if (editIndex === null) {
            // Add new contact
            contacts.push(newContact);
        } else {
            // Update existing contact
            contacts[editIndex] = newContact;
        }
        saveContacts();
        renderContacts();
        resetForm();
        nameInput.focus();
    });

    // Delegate edit/delete buttons click
    contactsList.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-edit")) {
            const idx = parseInt(e.target.getAttribute("data-index"), 10);
            if (!isNaN(idx)) {
                fillFormForEdit(idx);
                nameInput.focus();
            }
        } else if (e.target.classList.contains("btn-delete")) {
            const idx = parseInt(e.target.getAttribute("data-index"), 10);
            if (!isNaN(idx)) {
                deleteContact(idx);
            }
        }
    });

    // Initialize app
    function init() {
        loadContacts();
        renderContacts();
    }

    init();
})();
