document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editOrderBtn');
    const modal = document.getElementById('editOrderModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const currentStatusText = document.getElementById('currentStatusText');
    const pickupContainer = document.getElementById('pickupDetailsContainer');
    const fulfillmentRadios = document.querySelectorAll('.fulfillment-radio');

    let currentOrder = null; // Store fetched order data globally in the script scope

    // --- Helper Functions for Data Robustness ---

    // Helper to extract ID string, robust to BSON serialization format
    const getOrderIdString = (id) => {
        if (typeof id === 'object' && id.$oid) return id.$oid;
        return id; // Assume it's a string
    };

    // Helper to extract Date string, robust to BSON serialization format
    const getDateString = (dateObj) => {
        if (typeof dateObj === 'object' && dateObj.$date) return dateObj.$date;
        return dateObj; // Assume it's an ISO string
    };

    // Helper function to convert DB keys to display text
    const getServiceDisplayName = (key) => {
        switch (key) {
            case 'wash_fold': return 'Wash & Fold (By Weight)';
            case 'dry_cleaning': return 'Dry Cleaning (By Item)';
            default: return 'Unknown Service';
        }
    };

    // Helper function for date formatting
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Helper to format date for input[type=date] (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Get month and day with leading zeros
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
    }


    // --- Fetching and Rendering ---

    const fetchUserOrder = async () => {
        try {
            const response = await fetch('/api/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // Read error message from server if available
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                showMessageBox("Fetch Error", `Could not retrieve orders: ${errorData.message || 'Server error'}`, 'error');
                return;
            }

            const orders = await response.json();

            if (orders && orders.length > 0) {
                // Get the most recent order (first element due to server sorting)
                currentOrder = orders[0];
                renderOrderDetails(currentOrder);
            } else {
                // Handle case where user has no orders
                showMessageBox("No Orders Found", "You currently have no orders to track.", 'info');
                // Clear loading indicators/show empty state
                document.getElementById('orderIdValue').textContent = 'N/A';
                currentStatusText.textContent = 'N/A';
            }
        } catch (error) {
            console.error('Error fetching user orders:', error);
            showMessageBox("Connection Error", "Failed to connect to the server to fetch orders.", 'error');
        }
    };

    const renderOrderDetails = (order) => {
        
        // Determine if this is a pickup order
        const isPickup = order.fulfillmentMethod === 'pickup';
        
        // Safely access pickupDetails, which might be null/undefined for walk-in orders
        const pickupDetails = order.pickupDetails || {};

        // 1. Order ID and General Info
        const rawOrderId = getOrderIdString(order._id);
        const orderIdDisplay = rawOrderId ? `LS-${rawOrderId.slice(-5).toUpperCase()}` : 'N/A';
        document.getElementById('orderIdValue').textContent = orderIdDisplay;
        document.getElementById('modalOrderId').textContent = orderIdDisplay;

        // 2. Pickup Date & Time Slot
        let pickupDateDisplay, deliveryEstimateDisplay, pickupAddressDisplay;

        if (isPickup && pickupDetails.pickupDate) {
            const pickupDateString = getDateString(pickupDetails.pickupDate);
            const pickupDate = new Date(pickupDateString);
            
            // Display Pickup Date and Time Slot
            pickupDateDisplay = `${formatDate(pickupDate)} (${pickupDetails.pickupTimeSlot || 'N/A'})`;
            
            // Calculate Mock Delivery Estimate (2 days after pickup)
            const deliveryDate = new Date(pickupDate);
            deliveryDate.setDate(deliveryDate.getDate() + 2);
            deliveryEstimateDisplay = formatDate(deliveryDate);
            
            // Pickup Address
            pickupAddressDisplay = 
                `${pickupDetails.streetAddress || 'N/A'}, ${pickupDetails.city || 'N/A'}, ${pickupDetails.postalCode || 'N/A'}`;

        } else if (isPickup && !pickupDetails.pickupDate) {
            // This state suggests a missing date field for a pickup order (a validation issue)
            pickupDateDisplay = 'Missing Date';
            deliveryEstimateDisplay = 'TBD';
            pickupAddressDisplay = 'Missing Pickup Details';

        } else {
            // Walk-in/Other Fulfillment Method
            pickupDateDisplay = 'N/A (Walk-in)';
            deliveryEstimateDisplay = 'Upon Dropoff/Completion';
            pickupAddressDisplay = 'Order is for Walk-in Dropoff/Pickup.';
        }

        // 3. Populate all fields
        document.getElementById('serviceTypeValue').textContent = getServiceDisplayName(order.serviceType);
        document.getElementById('pickupDateValue').textContent = pickupDateDisplay;
        document.getElementById('deliveryEstimateValue').textContent = deliveryEstimateDisplay;
        
        let quantityText = `${order.estimatedQuantity} ${order.serviceType === 'wash_fold' ? 'kg' : 'items'}`;
        document.getElementById('quantityValue').textContent = quantityText;

        document.getElementById('totalCostValue').textContent = `₱ ${order.estimatedCost.total.toFixed(2)}`;
        
        // Payment Status
        const paymentStatus = order.status === 'Delivered' ? 'Paid' : 'Unpaid (COD)';
        const paymentElement = document.getElementById('paymentStatusValue');
        paymentElement.textContent = paymentStatus;
        
        paymentElement.classList.remove('text-green-600', 'text-red-600');
        paymentElement.classList.add(paymentStatus.includes('Paid') ? 'text-green-600' : 'text-red-600');


        document.getElementById('pickupAddressValue').textContent = pickupAddressDisplay;
        
        // Special Instructions
        const instructionsEl = document.getElementById('instructionsValue');
        instructionsEl.textContent = order.specialInstructions || 'N/A';
        if (order.specialInstructions) {
            instructionsEl.classList.remove('italic', 'text-gray-600');
        } else {
            instructionsEl.classList.add('italic', 'text-gray-600');
        }


        // Update Status Timeline
        updateTimeline(order);
        
        // Update Edit Button state
        editBtn.disabled = order.status !== "Pending";
    };

    const updateTimeline = (order) => {
        const timelineContainer = document.getElementById('trackingTimeline');
        const currentStatus = order.status;
        const method = order.fulfillmentMethod; // 'pickup' or 'walkin'

        // Define the steps for each method
        const timelineConfigs = {
            pickup: [
                { key: 'Pending', label: 'Scheduled' },
                { key: 'Approved', label: 'For Pickup' },
                { key: 'Picked Up', label: 'Picked Up' },
                { key: 'In Progress', label: 'Cleaning' },
                { key: 'Ready', label: 'Ready for Delivery' },
                { key: 'Delivered', label: 'Completed' }
            ],
            walkin: [
                { key: 'Pending', label: 'Waiting for Drop Off' },
                { key: 'In Progress', label: 'Cleaning' },
                { key: 'Ready', label: 'Ready for Pickup' },
                { key: 'Delivered', label: 'Completed/Picked Up' }
            ]
        };

        const steps = timelineConfigs[method] || timelineConfigs.pickup;
        
        // Clear existing timeline
        timelineContainer.innerHTML = '';

        // Calculate width percentage for desktop lines
        const stepWidth = 100 / steps.length;

        let isPastCurrent = false;

        steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'timeline-step';
            stepDiv.style.width = window.innerWidth > 768 ? `${stepWidth}%` : '100%';

            const isMatch = step.key === currentStatus;
            
            // Determine icons state
            let statusClass = '';
            if (isMatch) {
                statusClass = 'active';
                isPastCurrent = true;
                document.getElementById('currentStatusText').textContent = step.label;
            } else if (!isPastCurrent) {
                statusClass = 'complete';
            }

            stepDiv.innerHTML = `
                <div class="step-icon ${statusClass}" data-status-key="${step.key}">${index + 1}</div>
                <span class="step-label">${step.label}</span>
            `;

            timelineContainer.appendChild(stepDiv);
        });
    };

    // --- Modal and Edit Logic ---

    const togglePickupDetails = (method) => {
        if (method === 'pickup') {
            pickupContainer.style.display = 'block';
            pickupContainer.style.opacity = '1';
        } else {
            pickupContainer.style.display = 'none';
            pickupContainer.style.opacity = '0';
        }
    };

    // Function to open modal
    const openModal = () => {
        // Ensure order data is loaded and status allows editing
        if (!currentOrder) {
            showMessageBox("Error", "Order data is still loading or unavailable.", 'error');
            return;
        }

        if (currentOrder.status === "Pending") {
            
            const isPickup = currentOrder.fulfillmentMethod === 'pickup';
            const details = currentOrder.pickupDetails || {};

            // 1. Pre-populate modal fields with current order data
            document.getElementById('instructions').value = currentOrder.specialInstructions || '';
            document.getElementById('radioPickup').checked = isPickup;
            document.getElementById('radioWalkin').checked = !isPickup;

            // 2. Pre-populate pickup details (if available)
            document.getElementById('pickupDate').value = formatDateForInput(getDateString(details.pickupDate)) || '';
            document.getElementById('pickupTimeSlot').value = details.pickupTimeSlot || '';
            document.getElementById('streetAddress').value = details.streetAddress || '';
            document.getElementById('city').value = details.city || '';
            document.getElementById('postalCode').value = details.postalCode || '';

            // 3. Toggle visibility of pickup fields
            togglePickupDetails(currentOrder.fulfillmentMethod);


            modal.classList.remove('hidden');
            // Add an event listener to close the modal when clicking outside
            setTimeout(() => {
                modal.addEventListener('click', handleOutsideClick);
            }, 0);
        } else {
            // Custom message box simulation instead of alert()
            showMessageBox("Cannot Edit Order", `The order can only be edited when its status is 'Pending'. Your current status is '${currentOrder.status}'.`, 'error');
        }
    };

    // Function to close modal
    const closeModal = () => {
        modal.classList.add('hidden');
        modal.removeEventListener('click', handleOutsideClick);
    };
    
    // Handle clicks outside the inner modal content
    const handleOutsideClick = (event) => {
        const innerModal = modal.querySelector('.bg-white');
        if (innerModal && !innerModal.contains(event.target) && event.target === modal) {
            closeModal();
        }
    };

    // Handle save action (API PUT call)
    const handleSave = async () => {
        saveChangesBtn.disabled = true;
        
        const rawOrderId = getOrderIdString(currentOrder._id);
        if (!rawOrderId) {
            showMessageBox("Error", "Order ID not found. Cannot save changes.", 'error');
            saveChangesBtn.disabled = false;
            return;
        }

        const newFulfillmentMethod = document.querySelector('input[name="fulfillmentMethod"]:checked').value;
        const newInstructions = document.getElementById('instructions').value.trim();
        
        let updatePayload = {
            fulfillmentMethod: newFulfillmentMethod,
            specialInstructions: newInstructions
        };

        // Collect pickup details only if method is 'pickup'
        if (newFulfillmentMethod === 'pickup') {
            const pickupDate = document.getElementById('pickupDate').value;
            const pickupTimeSlot = document.getElementById('pickupTimeSlot').value;
            const streetAddress = document.getElementById('streetAddress').value.trim();
            const city = document.getElementById('city').value.trim();
            const postalCode = document.getElementById('postalCode').value.trim();

            // Simple client-side validation for required fields
            if (!pickupDate || !pickupTimeSlot || !streetAddress || !city || !postalCode) {
                showMessageBox("Validation Error", "All pickup details (Date, Time Slot, Address, City, Postal Code) are required for 'Pickup & Delivery' orders.", 'error');
                saveChangesBtn.disabled = false;
                return;
            }

            updatePayload.pickupDetails = {
                pickupDate,
                pickupTimeSlot,
                streetAddress,
                city,
                postalCode
            };
        }

        try {
            const response = await fetch(`/api/orders/${rawOrderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                // If it's a validation error, extract the message
                let errorMessage = errorData.message || 'Failed to update order.';
                if (errorMessage.includes('Validation Error')) {
                        errorMessage = errorMessage.replace('Validation Error: ', '');
                }
                throw new Error(errorMessage);
            }

            // Get the updated order object from the server response
            const updatedOrder = await response.json();
            
            // Update the local state and re-render the view
            currentOrder = updatedOrder;
            renderOrderDetails(currentOrder);

            closeModal();
            showMessageBox("Success!", "Your order changes have been saved successfully. Total cost updated if fulfillment changed.", 'success');

        } catch (error) {
            console.error('Error saving order changes:', error);
            showMessageBox("Update Failed", error.message, 'error');
        } finally {
            saveChangesBtn.disabled = false;
        }
    };

    // Event Listeners
    editBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    saveChangesBtn.addEventListener('click', handleSave);

    // Listener to toggle visibility of pickup details based on radio button
    fulfillmentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            togglePickupDetails(e.target.value);
        });
    });

    // --- Custom Message Box Implementation (No window.alert/confirm) ---

    const createMessageBox = () => {
        const box = document.createElement('div');
        box.id = 'messageBox';
        box.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] hidden';
        box.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 transform scale-100 transition-transform duration-300">
                <h4 id="boxTitle" class="text-xl font-bold text-gray-800 mb-3"></h4>
                <p id="boxMessage" class="text-gray-600 mb-6"></p>
                <div class="flex justify-end">
                    <button id="closeBoxBtn" class="btn-primary">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(box);
        return box;
    };

    const messageBox = createMessageBox();
    const boxTitle = document.getElementById('boxTitle');
    const boxMessage = document.getElementById('boxMessage');
    const closeBoxBtn = document.getElementById('closeBoxBtn');

    closeBoxBtn.addEventListener('click', () => {
        messageBox.classList.add('hidden');
    });

    function showMessageBox(title, message, type = 'info') {
        // Reset styling
        boxTitle.classList.remove('text-red-600', 'text-green-600', 'text-indigo-600');
        closeBoxBtn.classList.remove('bg-red-600', 'hover:bg-red-700', 'bg-green-600', 'hover:bg-green-700', 'bg-indigo-600', 'hover:bg-indigo-700');


        boxTitle.textContent = title;
        boxMessage.textContent = message;

        // Simple styling based on type
        if (type === 'error') {
            boxTitle.classList.add('text-red-600');
            closeBoxBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        } else if (type === 'success') {
            boxTitle.classList.add('text-green-600');
            closeBoxBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            boxTitle.classList.add('text-indigo-600');
            closeBoxBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        }

        messageBox.classList.remove('hidden');
    }

    // Start fetching data when the page loads
    fetchUserOrder();
});