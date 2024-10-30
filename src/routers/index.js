import { Router } from "express";
import paths from "../common/paths.js"
import boardRoutes from "./boardRoutes.js"

const apiRouter = Router();

apiRouter.use(paths.board.base, boardRoutes);

export default apiRouter;