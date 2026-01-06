let currentOrders = [];
let orderToDeny = null;

document.addEventListener('DOMContentLoaded', fetchPendingOrders);

async function fetchPendingOrders() {
    const loader = document.getElementById('adminLoader');
    const tableWrapper = document.getElementById('tableWrapper'); // Changed from grid
    const noOrders = document.getElementById('noOrders');
    const errorBox = document.getElementById('adminError');
    const countLabel = document.getElementById('pendingCount');

    try {
        // Updated to your actual admin endpoint
        const response = await fetch('/api/orders/pending');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const allOrders = await response.json();
        
        // Filter only pending orders
        currentOrders = allOrders.filter(o => o.status === 'Pending');
        countLabel.textContent = currentOrders.length;

        // Hide loader
        if (loader) loader.classList.add('hidden');
        
        if (currentOrders.length === 0) {
            if (noOrders) noOrders.classList.remove('hidden');
            if (tableWrapper) tableWrapper.classList.add('hidden');
        } else {
            if (noOrders) noOrders.classList.add('hidden');
            if (tableWrapper) tableWrapper.classList.remove('hidden');
            renderOrders(currentOrders);
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        if (loader) loader.classList.add('hidden');
        if (errorBox) errorBox.classList.remove('hidden');
    }
}

function renderOrders(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    
    if (!tableBody) return;

    tableBody.innerHTML = orders.map(order => {
        const orderId = `LS-${order._id.toString().slice(-6).toUpperCase()}`;
        const serviceName = order.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Handling deep objects safely
        const dateStr = order.pickupDetails?.pickupDate;
        const date = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
        const time = order.pickupDetails?.pickupTimeSlot || 'N/A';
        
        // Use user name if populated, otherwise fallback to sliced ID
        const customerName = order.user?.id ;

        return `
            <tr>
                <td class="font-mono text-xs font-bold text-gray-600">${orderId}</td>
                <td>
                    <div class="text-sm font-semibold text-gray-900">${customerName}</div>
                    <div class="text-xs text-gray-500">${order.user?.email || 'No email'}</div>
                </td>
                <td>
                    <div class="text-sm text-gray-900">${serviceName}</div>
                    <div class="text-xs text-gray-500">${order.estimatedQuantity} ${order.serviceType === 'wash_fold' ? 'kg' : 'items'}</div>
                </td>
                <td>
                    <span class="text-xs px-2 py-1 rounded bg-gray-100 font-medium text-gray-600">
                        ${order.fulfillmentMethod.toUpperCase()}
                    </span>
                </td>
                <td>
                    <div class="text-sm font-medium text-gray-900">${date}</div>
                    <div class="text-xs text-gray-500">${time}</div>
                </td>
                <td>
                    <div class="text-sm font-bold text-indigo-600">₱${order.estimatedCost.total.toFixed(2)}</div>
                </td>
                <td>
                    <span class="status-badge badge-pending">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" stroke-width="2"></circle>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 2"></path>
                        </svg>
                        Pending
                    </span>
                </td>
                <td>
                    <div class="flex justify-center gap-2">
                        <button onclick="handleAction('${order._id}', 'In Progress')" class="action-btn btn-approve">
                            Approve
                        </button>
                        <button onclick="openDenyModal('${order._id}')" class="action-btn btn-deny" title="Deny Request">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function handleAction(orderId, newStatus, reason = '') {
    try {
        const response = await fetch(`/api/orders/handle-request/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: newStatus,
                adminNote: reason 
            })
        });

        if (response.ok) {
            fetchPendingOrders();
            if (newStatus === 'Denied') closeDenyModal();
        } else {
            const err = await response.json();
            alert("Error updating order: " + (err.message || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
    }
}

function openDenyModal(id) {
    orderToDeny = id;
    const modal = document.getElementById('denyModal');
    if (modal) modal.classList.remove('hidden');
}

function closeDenyModal() {
    orderToDeny = null;
    const reasonInput = document.getElementById('denyReason');
    const modal = document.getElementById('denyModal');
    if (reasonInput) reasonInput.value = '';
    if (modal) modal.classList.add('hidden');
}

function submitDeny() {
    const reason = document.getElementById('denyReason').value.trim();
    if (!reason) return alert("Please provide a reason for denial.");
    handleAction(orderToDeny, 'Denied', reason);
}