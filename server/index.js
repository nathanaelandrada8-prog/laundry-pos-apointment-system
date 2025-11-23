
import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import APP_ROUTES from './routes/AppRoutes.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.set('views', path.join(__dirname, '..', 'client'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '..', 'client')));

app.get(Object.keys(APP_ROUTES), (req, res) => {
    const routeConfig = APP_ROUTES[req.path];

    if (routeConfig) {
        console.log(`Rendering ${req.path} with layout: ${routeConfig.layout} and content: ${routeConfig.content}`);
        return res.render(`layout/${routeConfig.layout}`, {
            contentPartial: routeConfig.content,
        });
    }
    
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`🔗 Access the server at http://localhost:${PORT}`);
});