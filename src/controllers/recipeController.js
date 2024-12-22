import { logError, logInfo } from '../middlewares/logger.js';
import prisma from '../config/prisma.js';
import openai from '../config/openai.js';

export const recipeController = {
    generateRecipe: async (req, res) => {
        try {
            const {
                meal_type,
                cuisine_type,
                dietary_restrictions,
                allergies,
                servings,
                calorie_limit,
                ingredients,
                additional_preferences
            } = req.body;

            logInfo(`Generating recipe for user: ${req.user.uid}`);

            const prompt = `Create a recipe with the following requirements:
                - Meal Type: ${meal_type}
                - Cuisine: ${cuisine_type}
                - Dietary Restrictions: ${dietary_restrictions.join(', ')}
                - Allergies to avoid: ${allergies.join(', ')}
                - Servings: ${servings}
                - Calorie Limit: ${calorie_limit}
                - Must use these ingredients: ${ingredients.join(', ')}
                - Additional preferences: ${JSON.stringify(additional_preferences)}
                
                Please provide the recipe in the following JSON format:
                {
                    "title": "Recipe name",
                    "description": "Brief description",
                    "ingredients": ["ingredient1", "ingredient2"],
                    "instructions": ["step1", "step2"],
                    "cookingTime": "30 minutes",
                    "skillLevel": "beginner/intermediate/advanced"
                }`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        "role": "system",
                        "content": "You are a professional chef who creates detailed recipes."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });

            const recipeData = JSON.parse(completion.choices[0].message.content);

            const recipe = await prisma.recipe.create({
                data: {
                    title: recipeData.title,
                    description: recipeData.description,
                    ingredients: recipeData.ingredients,
                    instructions: recipeData.instructions,
                    mealType: meal_type,
                    cuisineType: cuisine_type,
                    dietaryRestrictions,
                    allergies,
                    servings,
                    calorieLimit: calorie_limit,
                    cookingTime: recipeData.cookingTime,
                    skillLevel: recipeData.skillLevel,
                    userId: req.user.uid
                }
            });

            return res.status(201).json({
                success: true,
                data: recipe
            });
        } catch (error) {
            logError(`Recipe generation error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECIPE_GENERATION_ERROR',
                    message: error.message
                }
            });
        }
    },

    saveRecipe: async (req, res) => {
        try {
            const { recipe_id } = req.body;
            
            // TODO: Implement database storage
            logInfo(`Saving recipe ${recipe_id} for user: ${req.user.uid}`);

            return res.status(200).json({
                success: true,
                data: {
                    recipe_id
                }
            });
        } catch (error) {
            logError(`Recipe save error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECIPE_SAVE_ERROR',
                    message: error.message
                }
            });
        }
    },

    getSavedRecipes: async (req, res) => {
        try {
            // TODO: Implement database retrieval
            logInfo(`Fetching saved recipes for user: ${req.user.uid}`);

            return res.status(200).json({
                success: true,
                data: {
                    recipes: []
                }
            });
        } catch (error) {
            logError(`Fetch saved recipes error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_RECIPES_ERROR',
                    message: error.message
                }
            });
        }
    },

    submitFeedback: async (req, res) => {
        try {
            const { recipe_id, rating, comments, issues } = req.body;
            
            // TODO: Implement feedback storage
            logInfo(`Feedback submitted for recipe ${recipe_id} by user: ${req.user.uid}`);

            return res.status(200).json({
                success: true,
                data: {
                    feedback_id: 'generated_feedback_id'
                }
            });
        } catch (error) {
            logError(`Feedback submission error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'FEEDBACK_ERROR',
                    message: error.message
                }
            });
        }
    },

    searchRecipes: async (req, res) => {
        try {
            const { query, filters } = req.query;
            
            logInfo(`Searching recipes with query: ${query} for user: ${req.user.uid}`);

            // TODO: Implement search logic with Prisma
            const recipes = await prisma.recipe.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { ingredients: { has: query } }
                    ],
                    ...(filters?.cuisineType && { cuisineType: filters.cuisineType }),
                    ...(filters?.mealType && { mealType: filters.mealType })
                },
                include: {
                    feedbacks: {
                        select: {
                            rating: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: {
                    recipes: recipes.map(recipe => ({
                        ...recipe,
                        average_rating: recipe.feedbacks.length 
                            ? recipe.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / recipe.feedbacks.length 
                            : null
                    }))
                }
            });
        } catch (error) {
            logError(`Recipe search error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECIPE_SEARCH_ERROR',
                    message: error.message
                }
            });
        }
    },

    getRecipeDetails: async (req, res) => {
        try {
            const { recipeId } = req.params;
            
            logInfo(`Fetching recipe details for recipe: ${recipeId}`);

            const recipe = await prisma.recipe.findUnique({
                where: { id: recipeId },
                include: {
                    feedbacks: {
                        include: {
                            user: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    }
                }
            });

            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'RECIPE_NOT_FOUND',
                        message: 'Recipe not found'
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    ...recipe,
                    average_rating: recipe.feedbacks.length 
                        ? recipe.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / recipe.feedbacks.length 
                        : null
                }
            });
        } catch (error) {
            logError(`Recipe details fetch error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECIPE_DETAILS_ERROR',
                    message: error.message
                }
            });
        }
    }
}; 