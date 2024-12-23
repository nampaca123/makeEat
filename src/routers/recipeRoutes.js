import express from "express";
import paths from "../common/paths.js";
import { recipeController } from "../controllers/recipeController.js";

const router = express.Router();

/**
 * @swagger
 * /recipe/generate:
 *   post:
 *     summary: Generate a new recipe based on requirements
 *     description: Generates a detailed recipe including ingredients, instructions, and nutrition facts
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meal_type
 *               - cuisine_type
 *               - servings
 *             properties:
 *               meal_type:
 *                 type: string
 *                 enum: ["breakfast", "lunch", "dinner"]
 *                 example: "dinner"
 *               cuisine_type:
 *                 type: string
 *                 enum: ["korean", "italian", "japanese", "chinese", "western", "indian", "thai"]
 *                 example: "italian"
 *               dietary_restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ["vegetarian", "vegan", "pescatarian", "gluten-free", "dairy-free", "keto", "low-carb", "halal", "kosher"]
 *                 example: ["gluten-free", "dairy-free"]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ["peanuts", "tree-nuts", "dairy", "eggs", "soy", "shellfish", "fish", "wheat"]
 *                 example: ["shellfish", "tree-nuts"]
 *               servings:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 2
 *               calorie_limit:
 *                 type: integer
 *                 minimum: 200
 *                 maximum: 2000
 *                 example: 800
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["chicken", "pasta", "garlic"]
 *               additional_preferences:
 *                 type: object
 *                 properties:
 *                   spiciness:
 *                     type: string
 *                     enum: ["mild", "medium", "spicy"]
 *                   cooking_time:
 *                     type: string
 *                     enum: ["under 15 minutes", "under 30 minutes", "under 1 hour"]
 *                 example:
 *                   spiciness: "medium"
 *                   cooking_time: "under 30 minutes"
 *     responses:
 *       200:
 *         description: Recipe generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "cm50kynlg00012z8lxic3emze"
 *                     title:
 *                       type: string
 *                       example: "Italian Garlic Chicken with Gluten-Free Pasta"
 *                     description:
 *                       type: string
 *                       example: "A delicious, gluten-free and dairy-free Italian dinner, this recipe combines tender chicken with aromatic garlic and gluten-free pasta. Perfect for a cozy dinner for two!"
 *                     mealType:
 *                       type: string
 *                       example: "dinner"
 *                     cuisineType:
 *                       type: string
 *                       example: "italian"
 *                     dietaryRestrictions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["gluten-free", "dairy-free"]
 *                     allergies:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["shellfish", "tree-nuts"]
 *                     servings:
 *                       type: integer
 *                       example: 2
 *                     calorieLimit:
 *                       type: integer
 *                       example: 800
 *                     ingredients:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [
 *                         "chicken breasts: 2 pieces",
 *                         "gluten-free pasta: 200 grams",
 *                         "garlic cloves: 3 pieces",
 *                         "olive oil: 2 tablespoons"
 *                       ]
 *                     instructions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [
 *                         "Season the chicken breasts with salt, pepper, dried oregano, and dried basil.",
 *                         "Heat olive oil in a pan over medium heat."
 *                       ]
 *                     cookingTime:
 *                       type: string
 *                       example: "30 minutes"
 *                     skillLevel:
 *                       type: string
 *                       example: "Intermediate"
 *                     nutritionFacts:
 *                       type: object
 *                       properties:
 *                         calories:
 *                           type: string
 *                           example: "561"
 *                         protein:
 *                           type: string
 *                           example: "27.29g"
 *                         carbs:
 *                           type: string
 *                           example: "50.42g"
 *                         fat:
 *                           type: string
 *                           example: "18.22g"
 *                     userId:
 *                       type: string
 *                       example: "test_user_123"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-23T05:12:10.993Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-23T05:12:10.993Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "RECIPE_GENERATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "Failed to generate recipe"
 */
router.post(paths.recipe.generate, recipeController.generateRecipe);
router.post(paths.recipe.save, recipeController.saveRecipe);
router.get(paths.recipe.saved, recipeController.getSavedRecipes);
router.post(paths.recipe.feedback, recipeController.submitFeedback);
router.get(paths.recipe.search, recipeController.searchRecipes);
router.get(paths.recipe.details, recipeController.getRecipeDetails);

// 추후 authenticateUser 미들웨어 추가

/**
 * @swagger
 * /recipe/search:
 *   get:
 *     summary: Search recipes
 *     description: Search recipes by query string and optional filters
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query string
 *         example: "chicken"
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *           properties:
 *             cuisineType:
 *               type: string
 *               example: "korean"
 *             mealType:
 *               type: string
 *               example: "dinner"
 *     responses:
 *       200:
 *         description: List of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           average_rating:
 *                             type: number
 *                             nullable: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             message:
 *               type: string
 */

export default router; 