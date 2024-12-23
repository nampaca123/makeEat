import express from "express";
import paths from "../common/paths.js";
import { mealPlanController } from "../controllers/mealPlanController.js";
// import { authenticateUser } from "../middlewares/auth.js";  // 주석 처리

const router = express.Router();

// authenticateUser 미들웨어 제거
router.post(paths.mealPlan.create, mealPlanController.createMealPlan);
router.get(paths.mealPlan.get, mealPlanController.getMealPlan);
router.put(paths.mealPlan.update, mealPlanController.updateMealPlan);
router.delete(paths.mealPlan.delete, mealPlanController.deleteMealPlan);

export default router; 