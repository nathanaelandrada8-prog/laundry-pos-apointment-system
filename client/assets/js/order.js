// Constants should be defined inside the script block
const PRICE_WASH_FOLD = 80; // per kg
const PRICE_DRY_CLEANING = 150; // per item
const DELIVERY_FEE = 50;

// --- DOM Elements (CORRECTED IDs) ---
const form = document.getElementById('scheduleForm');
const pickupSections = document.getElementById('pickupSections');
const methodRadios = document.querySelectorAll('input[name="fulfillmentMethod"]');
const serviceRadios = document.querySelectorAll('input[name="serviceType"]');
const estimatedWeightInput = document.getElementById('estimatedWeight'); 
const pickupDateInput = document.getElementById('pickupDate');
const pickupTimeSelect = document.getElementById('pickupTime'); 
const confirmButton = document.getElementById('confirmButton');
const formError = document.getElementById('formError'); 
const quantityHint = document.getElementById('quantityHint'); 

// Summary elements (CORRECTED IDs)
const summaryServiceType = document.getElementById('summaryServiceType');
const summaryPriceUnit = document.getElementById('summaryPriceUnit');
const summaryQuantity = document.getElementById('summaryQuantity');
const summaryUnit = document.getElementById('summaryUnit');
const summarySubtotal = document.getElementById('summarySubtotal');
const deliveryFeeSpan = document.getElementById('deliveryFee');
const summaryTotal = document.getElementById('summaryTotal');
const summaryNote = document.getElementById('summaryNote');


// --- Utility Functions ---

/**
 * Shows a custom modal (since alert() and confirm() are forbidden)
 * @param {string} message The message to display.
 * @param {string} type 'success' or 'error'.
 * @param {function} onClose Optional function to run when the modal is closed.
 */
function showModal(message, type, onClose = () => {}) {
    const modal = document.createElement('div');
    const isSuccess = type === 'success';
    const colorClass = isSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
    const textColorClass = isSuccess ? 'text-green-600' : 'text-red-600';

    modal.className = `custom-modal ${isSuccess ? 'modal-success' : 'modal-error'}`;
    
    modal.innerHTML = `
        <p class="text-xl ${textColorClass} font-bold mb-3">${isSuccess ? 'Success!' : 'Error'}</p>
        <p class="text-gray-700">${message}</p>
        <button class="mt-4 px-4 py-2 ${colorClass} text-white rounded-md transition duration-150 shadow-md">Close</button>
    `;
    
    modal.querySelector('button').onclick = () => {
        modal.remove();
        onClose();
    };
    
    document.body.appendChild(modal);
}

/**
 * Calculates and updates the order summary section.
 */
function updateSummary() {
    const fulfillmentMethod = document.querySelector('input[name="fulfillmentMethod"]:checked')?.value || 'pickup';
    const serviceType = document.querySelector('input[name="serviceType"]:checked')?.value || 'wash_fold';
    // FIX: Use estimatedWeightInput which is now correctly linked
    const quantity = Number(estimatedWeightInput.value) || 0; 

    let pricePerUnit = 0;
    let unit = '';
    let serviceName = '';

    if (serviceType === 'wash_fold') {
        pricePerUnit = PRICE_WASH_FOLD;
        unit = 'kg';
        serviceName = 'Wash & Fold';
        quantityHint.textContent = 'Enter estimated weight in kilograms (kg).';
    } else { // dry_cleaning
        pricePerUnit = PRICE_DRY_CLEANING;
        unit = 'item';
        serviceName = 'Dry Cleaning';
        quantityHint.textContent = 'Enter estimated number of items.';
    }

    const subtotal = quantity * pricePerUnit;
    const deliveryFee = fulfillmentMethod === 'pickup' ? DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;

    // Update DOM elements
    summaryServiceType.textContent = serviceName;
    summaryPriceUnit.textContent = `₱ ${pricePerUnit} / ${unit}`;
    summaryQuantity.textContent = quantity;
    summaryUnit.textContent = unit;
    // Use toFixed(2) to format currency
    summarySubtotal.textContent = subtotal.toFixed(2);
    deliveryFeeSpan.textContent = `₱ ${deliveryFee.toFixed(2)}`;
    summaryTotal.textContent = total.toFixed(2);

    if (fulfillmentMethod === 'pickup') {
        summaryNote.textContent = `*Includes ₱${DELIVERY_FEE.toFixed(2)} pickup/delivery fee.`;
        deliveryFeeSpan.classList.remove('text-green-600');
        deliveryFeeSpan.classList.add('text-red-600');
    } else {
        summaryNote.textContent = '*Price is estimated. No delivery fee applied.';
        deliveryFeeSpan.classList.remove('text-red-600');
        deliveryFeeSpan.classList.add('text-green-600');
    }
}

/**
 * Toggles the visibility and required attributes for pickup-related fields.
 */
const togglePickupSections = (method) => {
    const isPickup = method === 'pickup';
    
    // Toggle visibility of steps 3 & 4
    pickupSections.classList.toggle('hidden', !isPickup);
    
    // Find all input fields within the pickup sections
    const pickupFields = pickupSections.querySelectorAll('input, select, textarea');

    pickupFields.forEach(field => {
        // These specific fields are required ONLY for pickup
        if (field.id === 'pickupDate' || field.id === 'pickupTime' || field.id === 'streetAddress' || field.id === 'city' || field.id === 'postalCode') {
            field.required = isPickup;
        }
    });
    
    // Update button text
    confirmButton.textContent = isPickup ? 'Confirm & Schedule Pickup' : 'Confirm & Drop-Off';
    
    updateSummary();
};

/**
 * Handles the asynchronous submission of the form data to the API.
 */
async function handleFormSubmission(e) {
    e.preventDefault();
    formError.classList.add('hidden');
    confirmButton.disabled = true;
    
    const fulfillmentMethod = document.querySelector('input[name="fulfillmentMethod"]:checked')?.value;
    const serviceType = document.querySelector('input[name="serviceType"]:checked')?.value;
    // FIX: Use the correct input element variable
    const estimatedQuantityString = estimatedWeightInput.value.trim(); 
    const estimatedQuantityNum = Number(estimatedQuantityString);

    // --- Core Frontend Validation ---
    if (!fulfillmentMethod || !serviceType) {
        showModal('Internal error: Fulfillment method or service type is missing. Please refresh the page.', 'error');
        confirmButton.disabled = false;
        confirmButton.textContent = fulfillmentMethod === 'pickup' ? 'Confirm & Schedule Pickup' : 'Confirm & Drop-Off';
        return;
    }
    
    if (estimatedQuantityString === '' || isNaN(estimatedQuantityNum) || estimatedQuantityNum <= 0) {
        showModal('Please enter a valid estimated quantity greater than zero in Step 2.', 'error');
        confirmButton.disabled = false;
        confirmButton.textContent = fulfillmentMethod === 'pickup' ? 'Confirm & Schedule Pickup' : 'Confirm & Drop-Off';
        return;
    }

    confirmButton.textContent = 'Scheduling...';

    // Collect all form data
    const formData = {
        fulfillmentMethod,
        serviceType,
        // The key the server expects is 'estimatedQuantity', so we map the value from the 'estimatedWeight' input here.
        estimatedQuantity: estimatedQuantityNum, 
        specialInstructions: document.getElementById('specialInstructions').value,
    };

    if (fulfillmentMethod === 'pickup') {
        formData.pickupDate = pickupDateInput.value;
        formData.pickupTimeSlot = pickupTimeSelect.value; 
        formData.streetAddress = document.getElementById('streetAddress').value;
        formData.city = document.getElementById('city').value;
        formData.postalCode = document.getElementById('postalCode').value;
        
        const requiredFields = ['pickupDate', 'pickupTimeSlot', 'streetAddress', 'city', 'postalCode'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                showModal('Please fill in all required scheduling and address details in Steps 3 and 4.', 'error');
                confirmButton.disabled = false;
                confirmButton.textContent = 'Confirm & Schedule Pickup';
                return;
            }
        }
    }
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.status && response.status >= 400) {
            const errorMessage = data.message || 'An unexpected error occurred.';
            throw new Error(errorMessage);
        }
        // Success
        showModal(
            `Order ${data._id.substring(18).toUpperCase()} placed successfully! You can track it now.`,
            'success',
            () => { window.location.href = '/user/dashboard';} 
        );
        
    } catch (error) {
        console.error('Submission failed:', error.message);
        formError.textContent = `Error: ${error.message}`;
        formError.classList.remove('hidden');
        showModal(`Failed to place order. ${error.message}`, 'error');
    } finally {
        confirmButton.disabled = false;
        // Restore button text based on current method
        confirmButton.textContent = fulfillmentMethod === 'pickup' ? 'Confirm & Schedule Pickup' : 'Confirm & Drop-Off';
    }
}

// --- Initialization and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Setup Minimum Date (tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    pickupDateInput.min = minDate;
    
    // Set initial required state
    const initialMethod = document.querySelector('input[name="fulfillmentMethod"]:checked')?.value || 'pickup';
    togglePickupSections(initialMethod);
    
    // Event listeners for changes
    methodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => togglePickupSections(e.target.value));
    });
    
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', updateSummary);
    });
    
    estimatedWeightInput.addEventListener('input', updateSummary);

    // Final form submission listener
    form.addEventListener('submit', handleFormSubmission);
    
    // Initial summary update
    updateSummary();
});