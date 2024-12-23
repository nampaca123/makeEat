import { Router } from "express";
import paths from "../common/paths.js"
import authRoutes from "./authRoutes.js"
import recipeRoutes from "./recipeRoutes.js"
import mealPlanRoutes from "./mealPlanRoutes.js"
import receiptRoutes from "./receiptRoutes.js"

const apiRouter = Router();

apiRouter.use(paths.auth.base, authRoutes);
apiRouter.use(paths.recipe.base, recipeRoutes);
apiRouter.use(paths.mealPlan.base, mealPlanRoutes);
apiRouter.use(paths.receipt.base, receiptRoutes);

export default apiRouter;