const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

const connectDatabase = () => {
    if (!MONGO_URI) {
        console.error('MongoDB: MONGO_URI is missing. Set it in backend/.env');
        process.exit(1);
    }
    mongoose
        .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Mongoose connected');
        })
        .catch((err) => {
            console.error('MongoDB connection failed:', err.message);
            console.error(
                'Check: Atlas cluster is running, IP access (0.0.0.0/0 for dev), and MONGO_URI in backend/.env matches Atlas → Connect → Drivers.'
            );
            process.exit(1);
        });
};

module.exports = connectDatabase;