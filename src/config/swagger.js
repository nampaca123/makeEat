import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Recipe API Documentation',
            version: '1.0.0',
            description: 'API documentation for Recipe Management System',
        },
        servers: [
            {
                url: 'http://localhost:8010/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routers/*.js'], // 라우터 파일들의 경로
};

const specs = swaggerJsdoc(options);

export default specs; 