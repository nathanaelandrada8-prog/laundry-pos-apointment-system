document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const loader = document.getElementById('dashboardLoader');
    const errorBox = document.getElementById('dashboardError');
    const content = document.getElementById('dashboardContent');
    const currentOrderCard = document.getElementById('currentOrderStatusCard');
    const recentOrdersBody = document.getElementById('recentOrdersTableBody');

    const statTotalOrders = document.getElementById('statTotalOrders');
    const statTotalQuantity = document.getElementById('statTotalQuantity');
    const statLifetimeSpend = document.getElementById('statLifetimeSpend');

    // Helper function to map order status to Tailwind CSS class for visual tags
    const getStatusClass = (status) => {
        if (!status) return 'tag-pending';
        const lowerStatus = status.toLowerCase().replace(/[\s&]/g, '_');
        
        if (lowerStatus === 'pending') return 'tag-pending';
        if (lowerStatus.includes('processing') || lowerStatus.includes('in_progress') || lowerStatus.includes('washing') || lowerStatus.includes('drying')) {
            return 'tag-processing';
        }
        if (lowerStatus.includes('completed') || lowerStatus.includes('delivered') || lowerStatus.includes('ready')) {
            return 'tag-completed';
        }
        if (lowerStatus.includes('cancelled')) return 'tag-cancelled';
        return 'tag-pending'; // Default fallback
    };

    // Renders the Current Order Status Card
    const renderCurrentOrder = (order) => {
        if (!order) {
            currentOrderCard.innerHTML = `
                <h2 class="text-xl font-semibold text-gray-700 mb-4">Current Order Status</h2>
                <div class="py-8 text-center bg-gray-50 rounded-lg">
                    <p class="text-lg font-medium text-gray-500 mb-2">No active orders right now.</p>
                    <p class="text-sm text-gray-400">Time to schedule your next laundry pickup!</p>
                </div>
            `;
            return;
        }

        const statusClass = getStatusClass(order.status);

        currentOrderCard.innerHTML = `
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Current Order Status</h2>
            <div class="flex items-center justify-between mb-4">
                <p class="text-gray-500">Order #LS-${order.orderId}</p>
                <span class="status-tag ${statusClass}">${order.status}</span>
            </div>
            
            <p class="text-lg font-medium text-gray-900 mb-1">Service: ${order.serviceType}</p>
            <p class="text-lg font-medium text-gray-900 mb-1">Est. Completion:</p>
            <p class="text-indigo-600 text-2xl font-bold">${order.estimatedCompletion}</p>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
                <a href="${order.trackingLink}" class="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                    View Tracking Details &rarr;
                </a>
            </div>
        `;
    };

    // Renders the Recent Activity table
    const renderRecentOrders = (orders) => {
        if (!orders || orders.length === 0) {
            recentOrdersBody.innerHTML = `
                <tr><td colspan="4" class="text-center py-4 text-gray-500 bg-white rounded-lg">No recent activity found.</td></tr>
            `;
            return;
        }

        recentOrdersBody.innerHTML = orders.map(order => {
            const statusClass = getStatusClass(order.status);
            return `
                <tr>
                    <td class="font-medium">
                        <a href="${order.orderLink}" class="text-indigo-600 hover:text-indigo-700">
                            LS-${order.orderId}
                        </a>
                    </td>
                    <td>${order.date}</td>
                    <td>${order.serviceType}</td>
                    <td><span class="status-tag ${statusClass}">${order.status}</span></td>
                </tr>
            `;
        }).join('');
    };

    // Main fetch function: Fetches data from the /api/orders/summary endpoint
    const fetchDashboardData = async () => {
        // Show loading state
        loader.classList.remove('hidden');
        errorBox.classList.add('hidden');
        content.classList.add('hidden');
        
        try {
            const response = await fetch('/api/orders/summary'); 
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server returned an error status.');
            }

            const data = await response.json();
            
            // 1. Update Aggregated Statistics
            statTotalOrders.textContent = data.totalOrders;
            statTotalQuantity.textContent = `${data.totalQuantity} kg/items`;
            // Assuming currency is Philippine Peso (₱) based on your original mock
            statLifetimeSpend.textContent = `₱ ${data.lifetimeSpend}`; 

            // 2. Render Current Order Card
            renderCurrentOrder(data.currentOrder);

            // 3. Render Recent Orders Table
            renderRecentOrders(data.recentOrders);

            // Show content
            content.classList.remove('hidden');

        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            errorBox.textContent = `Error loading dashboard: ${error.message}`;
            errorBox.classList.remove('hidden');
        } finally {
            // Hide loader
            loader.classList.add('hidden');
        }
    };

    // Execute the fetch function when the page loads
    fetchDashboardData();
});