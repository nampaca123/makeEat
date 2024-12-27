import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import easyocr
from PIL import Image
import io
import numpy as np

class OCRService:
    def __init__(self):
        # CUDA 사용 가능 여부 확인
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # EasyOCR 초기화 (CRAFT 기반)
        self.reader = easyocr.Reader(['ko', 'en'])  # 한국어, 영어 지원
        
        # TrOCR 모델 초기화
        self.processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten')
        self.model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')
        self.model.to(self.device)
        
    async def process_image(self, image_bytes):
        # 이미지 로드
        image = Image.open(io.BytesIO(image_bytes))
        
        # EasyOCR로 텍스트 영역 감지
        results = self.reader.readtext(np.array(image))
        
        if not results:
            return ""
            
        texts = []
        for bbox, text, conf in results:
            # 텍스트 영역 추출
            x_min = min(pt[0] for pt in bbox)
            y_min = min(pt[1] for pt in bbox)
            x_max = max(pt[0] for pt in bbox)
            y_max = max(pt[1] for pt in bbox)
            
            cropped_image = image.crop((x_min, y_min, x_max, y_max))
            
            # TrOCR로 텍스트 인식
            pixel_values = self.processor(cropped_image, return_tensors="pt").pixel_values.to(self.device)
            generated_ids = self.model.generate(pixel_values)
            trocr_text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            # 신뢰도가 높은 텍스트 선택
            final_text = trocr_text if len(trocr_text.strip()) > len(text.strip()) else text
            texts.append(final_text)
            
        return "\n".join(text.strip() for text in texts if text.strip())