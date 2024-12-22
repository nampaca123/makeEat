import { logError, logInfo } from '../middlewares/logger.js';
import prisma from '../config/prisma.js';

export const mealPlanController = {
    createMealPlan: async (req, res) => {
        try {
            const {
                start_date,
                end_date,
                preferences,
                exclude_ingredients,
                include_recipes
            } = req.body;

            logInfo(`Creating meal plan for user: ${req.user.uid}`);

            const mealPlan = await prisma.mealPlan.create({
                data: {
                    startDate: new Date(start_date),
                    endDate: new Date(end_date),
                    preferences,
                    excludeIngredients: exclude_ingredients,
                    userId: req.user.uid,
                    recipes: {
                        create: include_recipes?.map(recipeId => ({
                            recipe: {
                                connect: { id: recipeId }
                            },
                            scheduledFor: new Date(start_date) // 기본값으로 시작일 설정
                        }))
                    }
                },
                include: {
                    recipes: {
                        include: {
                            recipe: true
                        }
                    }
                }
            });

            return res.status(201).json({
                success: true,
                data: mealPlan
            });
        } catch (error) {
            logError(`Meal plan creation error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'MEAL_PLAN_CREATION_ERROR',
                    message: error.message
                }
            });
        }
    },

    getMealPlan: async (req, res) => {
        try {
            const { mealPlanId } = req.params;
            
            logInfo(`Fetching meal plan ${mealPlanId} for user: ${req.user.uid}`);

            const mealPlan = await prisma.mealPlan.findUnique({
                where: {
                    id: mealPlanId,
                    userId: req.user.uid // 자신의 식단만 조회 가능
                },
                include: {
                    recipes: {
                        include: {
                            recipe: true
                        }
                    }
                }
            });

            if (!mealPlan) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'MEAL_PLAN_NOT_FOUND',
                        message: 'Meal plan not found'
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: mealPlan
            });
        } catch (error) {
            logError(`Meal plan fetch error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'MEAL_PLAN_FETCH_ERROR',
                    message: error.message
                }
            });
        }
    },

    getWeeklyPlan: async (req, res) => {
        try {
            const { date } = req.query; // 특정 주의 시작일
            const startDate = date ? new Date(date) : new Date();
            
            // 주의 시작일과 종료일 계산
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);

            logInfo(`Fetching weekly meal plan for user: ${req.user.uid}`);

            const weeklyPlan = await prisma.mealPlan.findFirst({
                where: {
                    userId: req.user.uid,
                    startDate: {
                        gte: startDate
                    },
                    endDate: {
                        lte: endDate
                    }
                },
                include: {
                    recipes: {
                        include: {
                            recipe: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: weeklyPlan
            });
        } catch (error) {
            logError(`Weekly meal plan fetch error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'WEEKLY_PLAN_FETCH_ERROR',
                    message: error.message
                }
            });
        }
    },

    getSuggestions: async (req, res) => {
        try {
            const { preferences } = req.query;
            
            logInfo(`Generating meal plan suggestions for user: ${req.user.uid}`);

            // TODO: Implement AI-based meal plan suggestions
            // This will be implemented when we integrate with OpenAI
            const suggestions = await prisma.recipe.findMany({
                where: {
                    ...(preferences?.cuisineType && { cuisineType: preferences.cuisineType }),
                    ...(preferences?.mealType && { mealType: preferences.mealType })
                },
                take: 7 // 일주일치 추천
            });

            return res.status(200).json({
                success: true,
                data: {
                    suggestions
                }
            });
        } catch (error) {
            logError(`Meal plan suggestions error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'SUGGESTIONS_ERROR',
                    message: error.message
                }
            });
        }
    },

    updateMealPlan: async (req, res) => {
        try {
            const { mealPlanId } = req.params;
            const {
                start_date,
                end_date,
                preferences,
                exclude_ingredients,
                include_recipes
            } = req.body;

            logInfo(`Updating meal plan ${mealPlanId} for user: ${req.user.uid}`);

            const mealPlan = await prisma.mealPlan.update({
                where: {
                    id: mealPlanId,
                    userId: req.user.uid
                },
                data: {
                    startDate: new Date(start_date),
                    endDate: new Date(end_date),
                    preferences,
                    excludeIngredients: exclude_ingredients,
                    recipes: {
                        deleteMany: {},
                        create: include_recipes?.map(recipeId => ({
                            recipe: {
                                connect: { id: recipeId }
                            },
                            scheduledFor: new Date(start_date)
                        }))
                    }
                },
                include: {
                    recipes: {
                        include: {
                            recipe: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: mealPlan
            });
        } catch (error) {
            logError(`Meal plan update error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'MEAL_PLAN_UPDATE_ERROR',
                    message: error.message
                }
            });
        }
    },

    deleteMealPlan: async (req, res) => {
        try {
            const { mealPlanId } = req.params;

            logInfo(`Deleting meal plan ${mealPlanId} for user: ${req.user.uid}`);

            await prisma.mealPlan.delete({
                where: {
                    id: mealPlanId,
                    userId: req.user.uid
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Meal plan deleted successfully'
            });
        } catch (error) {
            logError(`Meal plan deletion error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'MEAL_PLAN_DELETION_ERROR',
                    message: error.message
                }
            });
        }
    }
}; 