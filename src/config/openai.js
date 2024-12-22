import OpenAI from 'openai';
import { logError } from '../middlewares/logger.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default openai; 