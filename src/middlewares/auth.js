import admin from '../config/firebase.js';
import { logError, logInfo } from './logger.js';

export const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_ERROR',
                    message: 'No token provided or invalid token format'
                }
            });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Add user info to request object
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified
        };

        logInfo(`Authenticated user: ${req.user.uid}`);
        next();
    } catch (error) {
        logError(`Authentication error: ${error.message}`);
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTH_ERROR',
                message: 'Invalid or expired token'
            }
        });
    }
}; 