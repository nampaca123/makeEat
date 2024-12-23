import admin from 'firebase-admin';
import { logError, logInfo } from '../middlewares/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
};

try {
    logInfo("Firebase Config: {" + 
        "\n  project_id: '" + firebaseConfig.project_id + "'" +
        "\n}"
    );

    const serviceAccount = {
        project_id: firebaseConfig.project_id,
        client_email: firebaseConfig.client_email,
        private_key: firebaseConfig.private_key,
    };

    logInfo("Service Account initialized for project: " + serviceAccount.project_id);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

} catch (error) {
    logError("Firebase initialization error");
    logError(error.message);
}

export default admin; 