import { logInfo } from './logger.js';

export const validateRequestSchema = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.details[0].message
                }
            });
        }
        next();
    };
};

export const logAPIAccess = (req, res, next) => {
    logInfo(`API Access: ${req.method} ${req.path}`);
    next();
}; 