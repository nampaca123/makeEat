import express from "express";
import paths from "../common/paths.js";
import { mealPlanController } from "../controllers/mealPlanController.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

router.post(paths.mealPlan.create, authenticateUser, mealPlanController.createMealPlan);
router.get(paths.mealPlan.get, authenticateUser, mealPlanController.getMealPlan);
router.put(paths.mealPlan.update, authenticateUser, mealPlanController.updateMealPlan);
router.delete(paths.mealPlan.delete, authenticateUser, mealPlanController.deleteMealPlan);

export default router; 