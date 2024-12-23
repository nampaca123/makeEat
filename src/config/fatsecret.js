import axios from 'axios';

export class FatSecretService {
    constructor() {
        // API 기본 설정
        this.baseUrl = 'https://platform.fatsecret.com/rest/server.api';
        this.clientId = process.env.FATSECRET_CLIENT_ID;
        this.clientSecret = process.env.FATSECRET_CLIENT_SECRET;
    }

    // OAuth 2.0 토큰 발급 받기
    async getAccessToken() {
        const auth = await axios.post('https://oauth.fatsecret.com/connect/token', 
            'grant_type=client_credentials',
            {
                auth: {
                    username: this.clientId,
                    password: this.clientSecret
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return auth.data.access_token;
    }

    // 음식 검색 API
    async searchFood(query) {
        const token = await this.getAccessToken();
        const response = await axios.get(this.baseUrl, {
            params: {
                method: 'foods.search',
                search_expression: query,
                format: 'json'
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }

    // 특정 음식의 영양 정보 가져오기
    async getFoodNutrition(foodId) {
        const token = await this.getAccessToken();
        const response = await axios.get(this.baseUrl, {
            params: {
                method: 'food.get.v2',
                food_id: foodId,
                format: 'json'
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }
} 