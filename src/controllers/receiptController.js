import { createWorker } from 'tesseract.js';
import { logInfo, logError } from '../middlewares/logger.js';
import fs from 'fs/promises';
import openai from '../config/openai.js';

export const receiptController = {
    analyzeReceipt: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'NO_FILE',
                        message: 'No receipt image provided'
                    }
                });
            }

            logInfo(`Analyzing receipt image: ${req.file.filename}`);

            // 1. OCR로 텍스트 추출
            const worker = await createWorker();
            await worker.loadLanguage('eng+kor');
            await worker.initialize('eng+kor');

            logInfo('Starting OCR processing...');
            const { data: { text } } = await worker.recognize(req.file.path);
            await worker.terminate();
            logInfo(`OCR Result: ${text}`);

            // 2. GPT로 식재료 분석
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert at identifying food ingredients from receipt text.
                                 Analyze the following receipt text and identify all food ingredients.
                                 Return ONLY a JSON array of ingredients in both Korean and English if possible.
                                 Format: ["ingredient1", "ingredient2", ...]`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.3
            });

            const ingredients = JSON.parse(completion.choices[0].message.content);
            logInfo(`GPT Identified Ingredients: ${JSON.stringify(ingredients)}`);

            // 3. 임시 파일 삭제
            await fs.unlink(req.file.path);

            // 4. 결과 반환
            return res.status(200).json({
                success: true,
                data: {
                    ingredients,
                    rawText: text  // 디버깅용
                }
            });

        } catch (error) {
            logError(`Receipt analysis error: ${error.message}`);
            
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    logError(`Failed to delete temporary file: ${unlinkError.message}`);
                }
            }

            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECEIPT_ANALYSIS_ERROR',
                    message: error.message
                }
            });
        }
    }
}; 