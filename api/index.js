const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const connectDatabase = require('../backend/config/database');

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'frontend', 'build');

const app = require('../backend/app');

let dbReady = null;

async function ensureDatabase() {
    if (mongoose.connection.readyState === 1) {
        return;
    }
    if (!dbReady) {
        dbReady = connectDatabase();
    }
    await dbReady;
}

app.use(express.static(buildDir));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(buildDir, 'index.html'), (err) => {
        if (err) {
            res.status(404).send('Frontend build missing. Redeploy after a successful build.');
        }
    });
});

/** Vercel serverless entry — connect MongoDB before handling any request. */
module.exports = async (req, res) => {
    try {
        await ensureDatabase();
    } catch (err) {
        console.error('MongoDB:', err.message);
        if (req.url && req.url.startsWith('/api')) {
            return res.status(503).json({
                success: false,
                message:
                    'Database unavailable. Set MONGO_URI in Vercel Environment Variables and allow 0.0.0.0/0 in MongoDB Atlas Network Access.',
            });
        }
    }
    return app(req, res);
};
