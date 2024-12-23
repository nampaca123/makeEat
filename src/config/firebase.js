import admin from 'firebase-admin';
import { logError, logInfo } from '../middlewares/logger.js';
import dotenv from 'dotenv';

dotenv.config();

try {
    const serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
        throw new Error('Missing Firebase configuration');
    }

    logInfo("Firebase Config: {" + 
        "\n  project_id: '" + serviceAccount.project_id + "'" +
        "\n}"
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    logInfo("Service Account initialized for project: " + serviceAccount.project_id);

} catch (error) {
    logError("Firebase initialization error: " + error.message);
}

export default admin; 