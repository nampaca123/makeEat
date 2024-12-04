import express from "express";
import paths from "../common/paths.js";
import { recipeController } from "../controllers/recipeController.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

router.post(paths.recipe.generate, authenticateUser, recipeController.generateRecipe);
router.post(paths.recipe.save, authenticateUser, recipeController.saveRecipe);
router.get(paths.recipe.saved, authenticateUser, recipeController.getSavedRecipes);
router.post(paths.recipe.feedback, authenticateUser, recipeController.submitFeedback);

export default router; 