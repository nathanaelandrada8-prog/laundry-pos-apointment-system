document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const messageBox = document.getElementById('messageBox');
    const saveButton = document.getElementById('saveButton');
    const profilePhotoInput = document.getElementById('profilePhoto');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    const profilePictureBase64Input = document.getElementById('profilePictureBase64');
    
    // Function to show feedback messages
    const showMessage = (message, type = 'success') => {
        messageBox.textContent = message;
        messageBox.className = 'message-box visible';
        
        messageBox.classList.remove('success', 'error'); 
        messageBox.classList.add(type);

        setTimeout(() => {
            messageBox.classList.remove('visible');
        }, 5000); 
    };

    // Function to update form fields on success (Client-Side Persistence)
    const updateFormFields = (data) => {
        document.getElementById('firstName').value = data.firstName || '';
        document.getElementById('lastName').value = data.lastName || '';
        document.getElementById('phone').value = data.phone || '';

        // Update nested address fields
        document.getElementById('streetAddress').value = data.address?.streetAddress || '';
        document.getElementById('city').value = data.address?.city || '';
        document.getElementById('postalCode').value = data.address?.postalCode || '';
        document.getElementById('addressNotes').value = data.address?.addressNotes || '';
        
        // Update photo data
        if (data.profilePictureBase64) {
            profilePictureBase64Input.value = data.profilePictureBase64;
            profilePhotoPreview.src = data.profilePictureBase64;
        }
    };

    // --- Image Upload Handling (Reads file into Base64) ---
    profilePhotoInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const base64Data = e.target.result;
                // 1. Update the visual preview
                profilePhotoPreview.src = base64Data;
                // 2. Store the Base64 string in the hidden input for submission
                profilePictureBase64Input.value = base64Data;
            };
            
            reader.readAsDataURL(file);
        }
    });

    // --- Form Submission via AJAX PUT request ---
    profileForm.addEventListener('submit', async (e) => {
        // CRITICAL: PREVENT DEFAULT FORM SUBMISSION
        e.preventDefault(); 
        
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        messageBox.classList.remove('visible');

        // Collect form data and create the payload object
        const data = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            streetAddress: document.getElementById('streetAddress').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            addressNotes: document.getElementById('addressNotes').value,
            profilePictureBase64: profilePictureBase64Input.value
        };
        
        try {
            // Use PUT for updating existing resources
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message || 'Profile updated successfully!', 'success');
                
                // INSTANTLY UPDATE THE FIELDS ON THE CLIENT SIDE
                updateFormFields(result); 

                // Update the header/sidebar username (if it exists in the layout)
                const userNameElements = document.querySelectorAll('.userName'); 
                userNameElements.forEach(el => {
                    el.textContent = `${result.firstName} ${result.lastName}`;
                });
            } else {
                // Handle API errors 
                showMessage(result.message || 'Failed to update profile. Please check your inputs.', 'error');
            }
        } catch (error) {
            console.error('Error during profile update:', error);
            showMessage('An unexpected error occurred during the update.', 'error');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    });
});