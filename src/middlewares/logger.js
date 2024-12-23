import morgan from "morgan";
import logger from "jet-logger";

//ANSI 색상을 로그에 적용하기 위한 함수
const colorsizeStatus = (status) => {
    if (status >= 500) {
        return `\x1b[31m${status}\x1b[0m`; // 빨간색 (500번대 에러)
    } else if (status >= 400) {
        return `\x1b[33m${status}\x1b[0m`; // 노란색 (400번대 에러)
    } else if (status >= 300) {
        return `\x1b[36m${status}\x1b[0m`; // 청록색 (300번대 리다이렉션)
    } else if (status >= 200) {
        return `\x1b[32m${status}\x1b[0m`; // 초록색 (200번대 성공)
    }
    return `\x1b[37m${status}\x1b[0m`; // 흰색 (기타)
};

// Morgan이 로그를 Jet-Logger로 보내도록 설정
const stream = {
    write: (message) => logger.info(message.trim())
};

// 환경에 따른 morgan 포맷 설정
const morganFormat =
    process.env.NODE_ENV === "production"
        ? `:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" \nheaders :headers \nquery :query \nbody :body`
        : `:method :url :status :response-time ms - :res[content-length] \nheaders :headers \nquery :query \nbody :body`;

// 커스텀 토큰 설정
morgan.token("body", (req) => {
    return JSON.stringify(req.body); // 요청 본문 데이터를 JSON 문자열로 변환
});

morgan.token("query", (req) => {
    return JSON.stringify(req.query); // 요청 쿼리 데이터를 JSON 문자열로 변환
});
  
morgan.token("headers", (req) => {
    return JSON.stringify(req.headers); // 요청 헤더 데이터를 JSON 문자열로 변환
});

morgan.token("status", (req, res) => {
    const status = res.statusCode;
    return colorsizeStatus(status); // 상태 코드에 ANSI 색상 코드 적용
});

// Morgan 미들웨어 설정
const morganMW = morgan(morganFormat, {stream});

// 로그 함수 정의
export const logInfo = (message) => logger.info(message);
export const logError = (message) => logger.error(message);
export const logWarn = (message) => logger.warn(message);

export { logger, morganMW };