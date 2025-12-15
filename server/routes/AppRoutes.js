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
};

export default APP_ROUTES;