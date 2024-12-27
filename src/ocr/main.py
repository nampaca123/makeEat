from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.ocr_service import OCRService
import uvicorn
import base64

app = FastAPI()
ocr_service = OCRService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8010"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ocr")
async def process_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = await ocr_service.process_image(contents)
        return {"success": True, "text": text}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)