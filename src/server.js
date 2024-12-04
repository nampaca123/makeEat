import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { morganMW } from "./middlewares/logger.js";
import apiRouter from "./routers/index.js";
import paths from "./common/paths.js";

// .env 파일 설정
dotenv.config();

// Express 개발서버 기초설정
const app = express();
const port = process.env.PORT;

// middlewares 설정
app.use(express.json()); // JSON 요청 파싱
app.use(express.urlencoded({extended: false})); // URL 인코딩된 데이터를 파싱
app.use(cookieParser()); // 쿠키 파싱
app.use(morganMW); // HTTP 요청에 대한 로깅

app.get("/", (req, res) => {
    res.send("Hello, World!")
});

// Add this line after your middleware setup
app.use(paths.base, apiRouter);

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });