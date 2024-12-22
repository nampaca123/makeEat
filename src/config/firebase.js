import admin from 'firebase-admin';
import { logError, logInfo } from '../middlewares/logger.js';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
    try {
        console.log('Firebase Config:', {
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key_length: process.env.FIREBASE_PRIVATE_KEY?.length
        });

        const serviceAccount = {
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };

        console.log('Service Account:', {
            ...serviceAccount,
            private_key_length: serviceAccount.private_key?.length
        });

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        logInfo('Firebase Admin SDK initialized successfully');
    } catch (error) {
        logError('Firebase Admin SDK initialization error:', error.message);
        console.error('Firebase initialization error details:', error);
    }
}

export default admin; 