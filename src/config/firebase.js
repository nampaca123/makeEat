import admin from 'firebase-admin';
import { logInfo } from '../middlewares/logger.js';

// Initialize Firebase Admin with service account
try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
    
    logInfo('Firebase Admin SDK initialized successfully');
} catch (error) {
    logError('Firebase Admin SDK initialization error:', error);
}

export default admin; 