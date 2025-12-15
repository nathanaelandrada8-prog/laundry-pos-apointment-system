import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import APP_ROUTES from './routes/AppRoutes.js';

// IMPORT ERROR HANDLERS
import { errorHandler, notFound } from './middleware/errorMiddleware.js'; 

// --- ROUTE IMPORTS ---
import authRoutes from './routes/authRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import apiUserRoutes from './routes/apiUserRoutes.js'; // <-- NEW IMPORT
// ---------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database connection
connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000; 

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

// EJS View Engine Setup
app.set('views', path.join(__dirname, '..', 'client'));
app.set('view engine', 'ejs');

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// --- API ROUTES ------
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', apiUserRoutes); // <-- NEW API ROUTE
// ---------------------

// --- PROTECTED EJS ROUTES ---
app.use('/user', userRoutes); 
app.use('/admin', adminRoutes);

// --- PUBLIC EJS ROUTE HANDLER ---
app.get(Object.keys(APP_ROUTES), (req, res) => {
    const routeConfig = APP_ROUTES[req.path];

    if (routeConfig) {
        // Render the main layout, passing the specific content partial
        return res.render(`layout/${routeConfig.layout}`, {
            contentPartial: routeConfig.content,
            activePath: routeConfig.content
        });
    }
    
    res.redirect('/');
});

// --- ERROR MIDDLEWARE (MUST be last) ---

// 404 Not Found Handler
app.use(notFound);

// General Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🔗 Access the server at http://localhost:${PORT}`);
});