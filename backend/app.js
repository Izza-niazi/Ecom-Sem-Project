const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');

const app = express();
const mongoose = require('mongoose');

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  res.json({
    ok: true,
    port: process.env.PORT || 4000,
    db: state,
  });
});

// config
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: 'backend/config/config.env' });
}

// Local uploads (see backend/utils/localImageUpload.js)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multipart first; allow large text fields (admin sends images as base64 in form fields).
// Busboy default fieldSize is 1MB — too small for large data URLs.
app.use(
    fileUpload({
        limits: {
            fieldSize: 25 * 1024 * 1024,
            fileSize: 50 * 1024 * 1024,
        },
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
const recommendation = require('./routes/recommendationRoute');
const searchNl = require('./routes/searchNlRoute');
const pageSeo = require('./routes/pageSeoRoute');
const shopChat = require('./routes/shopChatRoute');
const blog = require('./routes/blogRoute');

app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', searchNl);
app.use('/api/v1', pageSeo);
app.use('/api/v1', shopChat);
app.use('/api/v1', blog);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.use('/api/v1', recommendation);

// error middleware
app.use(errorMiddleware);

module.exports = app;