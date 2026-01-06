import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { routes } from './routes';

const app = express();

app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity in this setup, or configure it properly
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API routes
app.use('/api', routes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Serve frontend in production
// Try to find the dist folder relative to this file or from CWD
let distPath = path.join(process.cwd(), 'dist');
if (!require('fs').existsSync(distPath)) {
    // If not in root dist, try parent dist (when running from backend dir)
    distPath = path.join(process.cwd(), '../dist');
}

app.use(express.static(distPath));

// Handle client-side routing
app.get(/.*/, (req, res) => {
    // Check if it's an API request that missed or just random path
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});


export default app;

