document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('ordersTableBody');
    const noOrdersRow = document.getElementById('noOrdersRow');
    const orderCountSpan = document.getElementById('orderCount');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    const orderIdSearch = document.getElementById('order-id-search');
    const statusFilter = document.getElementById('status-filter');
    const serviceFilter = document.getElementById('service-filter');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    let allOrders = []; // Store the master list of all fetched orders

    // --- Helper Functions ---

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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getServiceDisplayName = (key) => {
        switch (key) {
            case 'wash_fold': return 'Wash & Fold';
            case 'dry_cleaning': return 'Dry Cleaning';
            default: return 'Unknown';
        }
    };
    
    const getFulfillmentDisplayName = (key) => {
        return key === 'pickup' ? 'Pickup/Delivery' : 'Walk-in';
    };

    // --- Fetching Logic ---

    const fetchAllOrders = async () => {
        loadingIndicator.classList.remove('hidden');
        tableBody.innerHTML = ''; // Clear existing data

        try {
            const response = await fetch('/api/orders', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                showMessageBox("Fetch Error", `Could not retrieve orders: ${errorData.message || 'Server error'}`, 'error');
                return;
            }

            allOrders = await response.json();
            
            // Filter orders based on current selections
            filterAndRenderOrders(); 

        } catch (error) {
            console.error('Error fetching user orders:', error);
            showMessageBox("Connection Error", "Failed to connect to the server to fetch orders.", 'error');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    };

    // --- Filtering and Rendering Logic ---

    const filterAndRenderOrders = () => {
        const searchId = orderIdSearch.value.trim().toLowerCase();
        const filterStatus = statusFilter.value;
        const filterService = serviceFilter.value;

        const filteredOrders = allOrders.filter(order => {
            // 1. Filter by Order ID
            const rawOrderId = getOrderIdString(order._id);
            const orderIdDisplay = `LS-${rawOrderId.slice(-5).toUpperCase()}`;
            if (searchId && !orderIdDisplay.toLowerCase().includes(searchId)) {
                return false;
            }

            // 2. Filter by Status
            if (filterStatus !== 'all' && order.status !== filterStatus) {
                return false;
            }

            // 3. Filter by Service Type
            if (filterService !== 'all' && order.serviceType !== filterService) {
                return false;
            }

            return true;
        });

        renderOrders(filteredOrders);
    };


    const renderOrders = (orders) => {
        tableBody.innerHTML = ''; // Clear previous results
        orderCountSpan.textContent = orders.length;

        if (orders.length === 0) {
            noOrdersRow.querySelector('td').textContent = "No orders match the current filters.";
            tableBody.appendChild(noOrdersRow);
            return;
        }

        orders.forEach(order => {
            const rawOrderId = getOrderIdString(order._id);
            const orderIdDisplay = `LS-${rawOrderId.slice(-5).toUpperCase()}`;
            const serviceName = getServiceDisplayName(order.serviceType);
            const quantityUnit = order.serviceType === 'wash_fold' ? 'kg' : 'items';
            const fulfillmentMethod = getFulfillmentDisplayName(order.fulfillmentMethod);
            const statusClass = `tag-${order.status.replace(/\s/g, '')}`;

            let actionText = 'Track';
            let actionLink = `/user/track?id=${rawOrderId}`; // Link to the track order page

            if (order.status === 'Delivered') {
                actionText = 'Receipt';
            } else if (order.status === 'Pending') {
                actionText = 'Edit/Track';
            }

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition duration-100';
            row.innerHTML = `
                <td class="font-medium text-indigo-600">${orderIdDisplay}</td>
                <td class="text-gray-600">${formatDate(getDateString(order.createdAt))}</td>
                <td class="text-gray-700">${serviceName}</td>
                <td class="text-gray-700">${fulfillmentMethod}</td>
                <td class="text-gray-700">${order.estimatedQuantity} ${quantityUnit}</td>
                <td class="font-bold text-gray-800">₱ ${order.estimatedCost.total.toFixed(2)}</td>
                <td><span class="status-tag ${statusClass}">${order.status}</span></td>
                <td><a href="${actionLink}" class="action-link">${actionText}</a></td>
            `;
            tableBody.appendChild(row);
        });
    };

    // --- Event Listeners ---

    applyFiltersBtn.addEventListener('click', filterAndRenderOrders);

    resetFiltersBtn.addEventListener('click', () => {
        orderIdSearch.value = '';
        statusFilter.value = 'all';
        serviceFilter.value = 'all';
        filterAndRenderOrders(); // Rerun filter with reset values
    });

    // --- Custom Message Box Implementation ---

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

    const messageBox = document.getElementById('messageBox') || createMessageBox();
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

    // Initial data fetch
    fetchAllOrders();
});