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

        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        
        try {
            // ID 토큰 검증 시도
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
            // ID 토큰 검증 실패 시 customToken으로 시도
            const userInfo = await admin.auth().verifySessionCookie(token, true);
            decodedToken = {
                uid: userInfo.sub,
                email: userInfo.email,
                email_verified: userInfo.email_verified
            };
        }
        
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