import { logInfo, logError } from '../middlewares/logger.js';
import fs from 'fs/promises';
import openai from '../config/openai.js';
import axios from 'axios';
import FormData from 'form-data';
import { createWorker } from 'tesseract.js';

export const receiptController = {
    // 기본 OCR (Tesseract)
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

            logInfo(`Analyzing receipt image with Tesseract: ${req.file.filename}`);

            // Tesseract OCR 처리
            const worker = await createWorker();
            await worker.loadLanguage('eng+kor');
            await worker.initialize('eng+kor');
            const { data: { text } } = await worker.recognize(req.file.path);
            await worker.terminate();

            logInfo(`Tesseract OCR Result: ${text}`);

            // GPT 분석 및 결과 반환
            const ingredients = await analyzeWithGPT(text);

            // 임시 파일 삭제
            await fs.unlink(req.file.path);

            return res.status(200).json({
                success: true,
                data: {
                    ingredients,
                    rawText: text,
                    ocrType: 'tesseract'
                }
            });

        } catch (error) {
            handleError(error, req, res);
        }
    },

    // 고정밀 OCR (PyTorch)
    analyzeReceiptAdvanced: async (req, res) => {
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

            logInfo(`Analyzing receipt image with PyTorch: ${req.file.filename}`);

            // FastAPI 서버 호출
            const formData = new FormData();
            const fileBuffer = await fs.readFile(req.file.path);
            formData.append('file', fileBuffer, { filename: req.file.originalname });

            const ocrResponse = await axios.post('http://localhost:5001/ocr', formData, {
                headers: {
                    ...formData.getHeaders(),
                }
            });

            if (!ocrResponse.data.success) {
                throw new Error(ocrResponse.data.error);
            }

            const text = ocrResponse.data.text;
            logInfo(`PyTorch OCR Result: ${text}`);

            // GPT 분석 및 결과 반환
            const ingredients = await analyzeWithGPT(text);

            // 임시 파일 삭제
            await fs.unlink(req.file.path);

            return res.status(200).json({
                success: true,
                data: {
                    ingredients,
                    rawText: text,
                    ocrType: 'pytorch'
                }
            });

        } catch (error) {
            handleError(error, req, res);
        }
    }
};

// GPT 분석 헬퍼 함수
async function analyzeWithGPT(text) {
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

    return JSON.parse(completion.choices[0].message.content);
}

// 에러 처리 헬퍼 함수
async function handleError(error, req, res) {
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