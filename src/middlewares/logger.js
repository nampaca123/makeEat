import morgan from "morgan";

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

// Morgan stream 설정을 console.log로 변경
const stream = {
    write: (message) => console.log(message.trim())
};

// 환경에 따른 morgan 포맷 설정
const morganFormat =
    process.env.NODE_ENV === "production"
        ? `:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" \nheaders :headers \nquery :query \nbody :body`
        : `:method :url :status :response-time ms - :res[content-length] \nheaders :headers \nquery :query \nbody :body`;

// 커스텀 토큰 설정
morgan.token("body", (req) => JSON.stringify(req.body));
morgan.token("query", (req) => JSON.stringify(req.query));
morgan.token("headers", (req) => JSON.stringify(req.headers));
morgan.token("status", (req, res) => colorsizeStatus(res.statusCode));

// Morgan 미들웨어 설정
const morganMW = morgan(morganFormat, {stream});

// 로그 함수들을 console로 직접 사용
export const logInfo = console.log;
export const logError = console.error;
export const logWarn = console.warn;

export { morganMW };