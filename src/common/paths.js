// Express 라우터 경로 설정

export default {
    base: "/api",
    auth: {
        base: "/auth",
        register: "/register",
        login: "/login",
        logout: "/logout",
        validateToken: "/validate-token"
    },
    recipe: {
        base: "/recipe",
        generate: "/generate",
        save: "/save",
        saved: "/saved",
        feedback: "/feedback",
        search: "/search",
        details: "/:recipeId"
    },
    mealPlan: {
        base: "/meal-plan",
        create: "/create",
        get: "/:mealPlanId",
        update: "/:mealPlanId",
        delete: "/:mealPlanId",
        weekly: "/weekly",
        suggestions: "/suggestions"
    }
};