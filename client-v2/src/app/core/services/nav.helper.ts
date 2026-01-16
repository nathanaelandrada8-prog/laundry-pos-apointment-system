export const USER_MENU = [
    { label: 'Dashboard', icon: 'dashboard', route: '/user/dashboard' },
    { label: 'Order', icon: 'shopping_cart', route: '/user/order' },
    { label: 'Track Order', icon: 'location_on', route: '/user/track-order' },
    { label: 'History', icon: 'history', route: '/user/history' },
    { label: 'Profile', icon: 'person', route: '/user/profile' }
];

export const ADMIN_MENU = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'POS System', icon: 'payment', route: '/admin/pos-system' },
    { label: 'Pending Requests', icon: 'pending', route: '/admin/pending-requests' },
    { label: 'Manage Orders', icon: 'list', route: '/admin/manage-orders' }
];

export const WASH_TYPES = [
    { id: 'wash_dry', name: 'Wash & Dry', icon: 'local_laundry_service', desc: 'Standard machine wash' },
    { id: 'wash_dry_fold', name: 'Wash, Dry & Fold', icon: 'layers', desc: 'Cleaned and neatly folded' },
    { id: 'dry_clean', name: 'Dry Cleaning', icon: 'dry_cleaning', desc: 'For delicate garments' },
    { id: 'hand_wash', name: 'Hand Wash', icon: 'front_loader', desc: 'Extra care for your items' }
];

export const PROGRESS_STEPS = [
    { label: 'Pending', status: 'Pending', icon: 'pending_actions' },
    { label: 'Approved', status: 'Approved', icon: 'check_circle' },
    { label: 'For Pick-up', status: 'Pick Up', icon: 'local_shipping' },
    { label: 'In Progress', status: 'In Progress', icon: 'wash' },
    { label: 'Out for Delivery', status: 'Out for Delivery', icon: 'local_shipping' },
    { label: 'Completed', status: 'Completed', icon: 'task_alt' }
]
