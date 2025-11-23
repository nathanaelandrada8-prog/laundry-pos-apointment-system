/**
 * Maps the URL path to the required layout and content partials (EJS templates).
 * Layouts are defined relative to 'client/layout/'.
 * Content partials are defined relative to 'client/'.
 *
 * NOTE: The 'content' value refers to the EJS file name without the .ejs extension.
 */

const APP_ROUTES = {
    // --- Public Facing Routes (uses frontpageLayout.ejs) ---
    '/': { layout: 'frontpageLayout', content: '../public/home' },
    '/login': { layout: 'frontpageLayout', content: '../public/login' },
    '/signup': { layout: 'frontpageLayout', content: '../public/signup' },

    // --- Authenticated User Routes (uses userLayout.ejs) ---
    // These paths should be protected by middleware later on
    '/user/dashboard': { layout: 'userLayout', content: '../user/dashboard' },
    '/user/schedule': { layout: 'userLayout', content: '../user/schedule' },

    // --- Admin/Owner Routes (uses adminLayout.ejs) ---
    // These paths must be protected by admin-specific middleware
    '/admin/dashboard': { layout: 'adminLayout', content: '../admin/dashboard' },
    '/admin/pos': { layout: 'adminLayout', content: '../admin/pos' },
};

export default APP_ROUTES;