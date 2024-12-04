import admin from '../config/firebase.js';
import { logError, logInfo } from '../middlewares/logger.js';

export const authController = {
    register: async (req, res) => {
        try {
            const { email, password, username, preferences } = req.body;

            // Create user in Firebase
            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName: username
            });

            // Set custom claims for user preferences
            await admin.auth().setCustomUserClaims(userRecord.uid, {
                preferences
            });

            logInfo(`New user registered: ${userRecord.uid}`);

            // Create custom token for initial sign-in
            const customToken = await admin.auth().createCustomToken(userRecord.uid);

            return res.status(201).json({
                success: true,
                data: {
                    user_id: userRecord.uid,
                    email: userRecord.email,
                    username: userRecord.displayName,
                    token: customToken
                }
            });
        } catch (error) {
            logError(`Registration error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'REGISTRATION_ERROR',
                    message: error.message
                }
            });
        }
    },

    login: async (req, res) => {
        try {
            const { idToken } = req.body;

            // Verify the ID token
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            
            // Get user details
            const userRecord = await admin.auth().getUser(decodedToken.uid);

            logInfo(`User logged in: ${userRecord.uid}`);

            return res.status(200).json({
                success: true,
                data: {
                    user_id: userRecord.uid,
                    email: userRecord.email,
                    username: userRecord.displayName,
                    preferences: decodedToken.preferences || {}
                }
            });
        } catch (error) {
            logError(`Login error: ${error.message}`);
            return res.status(401).json({
                success: false,
                error: {
                    code: 'LOGIN_ERROR',
                    message: error.message
                }
            });
        }
    },

    logout: async (req, res) => {
        try {
            // Firebase handles token invalidation on the client side
            // Here we just clear any server-side session data if needed
            
            logInfo(`User logged out: ${req.user.uid}`);

            return res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            logError(`Logout error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'LOGOUT_ERROR',
                    message: error.message
                }
            });
        }
    }
}; 