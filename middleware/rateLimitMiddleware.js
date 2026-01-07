import AppError from '../utils/AppError.js';

// Simple in-memory rate limiter
const requests = {};

// Clean up old entries every hour
setInterval(() => {
    const now = Date.now();
    for (const ip in requests) {
        if (now - requests[ip].firstRequest > 3600000) {
            delete requests[ip];
        }
    }
}, 3600000);

export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!requests[ip]) {
            requests[ip] = { count: 1, firstRequest: now };
            return next();
        }

        const timePassed = now - requests[ip].firstRequest;

        if (timePassed > windowMs) {
            // Reset window
            requests[ip] = { count: 1, firstRequest: now };
            return next();
        }

        requests[ip].count++;

        if (requests[ip].count > maxRequests) {
            return next(new AppError(`Too many requests, please try again after 15 minutes`, 429));
        }

        next();
    };
};

export default rateLimiter;
