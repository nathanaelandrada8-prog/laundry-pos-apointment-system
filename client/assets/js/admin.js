const sidebar = document.getElementById('sidebar');
const contentArea = document.getElementById('content-area');
const toggleButton = document.getElementById('sidebar-toggle');
const logoFull = document.getElementById('logo-full');
const logoIcon = document.getElementById('logo-icon');

// Initial settings for full width sidebar
sidebar.style.width = '16rem'; // w-64
contentArea.style.marginLeft = '16rem'; // ml-64

toggleButton.addEventListener('click', () => {
    if (sidebar.classList.contains('minimized')) {
        // Expand the sidebar
        sidebar.classList.remove('minimized');
        sidebar.style.width = '16rem'; // 256px
        contentArea.style.marginLeft = '16rem';
        logoFull.classList.remove('hidden');
        logoIcon.classList.add('hidden');
    } else {
        // Minimize the sidebar
        sidebar.classList.add('minimized');
        sidebar.style.width = '4rem'; // 64px (w-16)
        contentArea.style.marginLeft = '4rem';
        logoFull.classList.add('hidden');
        logoIcon.classList.remove('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    const washFoldWeightInput = document.getElementById('wash-fold-weight');
    const addWashFoldButton = document.getElementById('add-wash-fold');
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalDisplay = document.getElementById('subtotal');
    const totalDueDisplay = document.getElementById('total-due');
    const clearOrderButton = document.getElementById('clear-order');

    const PRICE_PER_LB = 1.50;

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500 italic">No items added yet.</p>';
            subtotalDisplay.textContent = '$0.00';
            totalDueDisplay.textContent = '$0.00';
            return;
        }

        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.qty * item.price;
            subtotal += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex justify-between items-center text-sm';
            itemDiv.innerHTML = `
                <span class="text-gray-800">${item.name} (${item.qty} lbs)</span>
                <span class="font-medium">$${itemTotal.toFixed(2)}</span>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
        totalDueDisplay.textContent = `$${subtotal.toFixed(2)}`; // No tax/discount for simplicity
    }

    addWashFoldButton.addEventListener('click', () => {
        const weight = parseFloat(washFoldWeightInput.value);
        if (weight > 0) {
            cart.push({
                name: "Wash & Fold",
                qty: weight,
                price: PRICE_PER_LB
            });
            washFoldWeightInput.value = 0; // Reset input
            updateCartDisplay();
        }
    });

    clearOrderButton.addEventListener('click', () => {
        cart = [];
        updateCartDisplay();
    });

    // Initial render
    updateCartDisplay();
});
