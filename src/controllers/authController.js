import admin from '../config/firebase.js';
import { logError, logInfo } from '../middlewares/logger.js';

export const authController = {
    register: async (req, res) => {
        try {
            const { email, password, username, preferences } = req.body;

            // 파이어베이스에 사용자 생성
            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName: username
            });

            // 사용자 선호 설정
            await admin.auth().setCustomUserClaims(userRecord.uid, {
                preferences
            });

            logInfo(`New user registered: ${userRecord.uid}`);

            // 초기 로그인을 위한 사용자 토큰 생성
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

            // ID 토큰 검증
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            
            // 사용자 세부 정보 조회
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
            // 서버 측 세션 데이터 삭제
            
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