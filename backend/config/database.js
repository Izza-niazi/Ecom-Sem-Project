const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const MONGO_URI = process.env.MONGO_URI;
const MAX_ATTEMPTS = Number(process.env.MONGO_CONNECT_RETRIES || 5);
const RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS || 4000);

/**
 * Connect with retries (Atlas cold start, flaky Wi‑Fi, IP whitelist just added).
 * @returns {Promise<void>}
 */
async function connectDatabase() {
    if (!MONGO_URI) {
        throw new Error('MongoDB: MONGO_URI is missing. Set it in backend/.env');
    }

    const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000,
    };

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            await mongoose.connect(MONGO_URI, opts);
            console.log('Mongoose connected');
            return;
        } catch (err) {
            console.error(
                `MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
                err.message
            );
            if (attempt >= MAX_ATTEMPTS) {
                throw new Error(
                    'Could not connect after ' +
                        MAX_ATTEMPTS +
                        ' attempts. Check Atlas Network Access, cluster is running, and MONGO_URI in backend/.env'
                );
            }
            console.error(`Retrying in ${RETRY_DELAY_MS / 1000}s…`);
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
    }
}

module.exports = connectDatabase;
