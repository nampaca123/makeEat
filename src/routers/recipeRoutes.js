import express from "express";
import paths from "../common/paths.js";
import { recipeController } from "../controllers/recipeController.js";
// import { authenticateUser } from "../middlewares/auth.js";  // 주석 처리

const router = express.Router();

router.post(paths.recipe.generate, recipeController.generateRecipe);
router.post(paths.recipe.save, recipeController.saveRecipe);
router.get(paths.recipe.saved, recipeController.getSavedRecipes);
router.post(paths.recipe.feedback, recipeController.submitFeedback);
router.get(paths.recipe.search, recipeController.searchRecipes);
router.get(paths.recipe.details, recipeController.getRecipeDetails);

// 추후 authenticateUser 미들웨어 추가

export default router; 