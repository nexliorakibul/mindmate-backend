import admin from '../config/firebase.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.log('Auth Middleware: No token provided');
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        // Bypass for dev mode if Firebase is not initialized
        if (admin.apps.length === 0) {
            console.warn('⚠️  Auth Middleware: Firebase not initialized. Bypassing verification (Dev Mode).');
            req.user = {
                uid: 'dev-user-id',
                email: 'dev@mindmate.ai',
            };
            return next();
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Auth Middleware: Token verified for UID:', decodedToken.uid);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };
        next();
    } catch (error) {
        console.error('Auth Middleware: Verification Error:', error.message);
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
};
