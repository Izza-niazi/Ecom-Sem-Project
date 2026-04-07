const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
});

/** Sets req.user when a valid cookie exists; otherwise req.user stays undefined. */
exports.optionalAuth = asyncErrorHandler(async (req, res, next) => {
    req.user = undefined;
    const { token } = req.cookies;
    if (!token) {
        return next();
    }
    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedData.id);
        if (user) {
            req.user = user;
        }
    } catch {
        // ignore invalid/expired token
    }
    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
        }
        next();
    }
}