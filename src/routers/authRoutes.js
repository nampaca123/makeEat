import express from "express";
import paths from "../common/paths.js";
import { authController } from "../controllers/authController.js";

const router = express.Router();

router.post(paths.auth.register, authController.register);
router.post(paths.auth.login, authController.login);
router.post(paths.auth.logout, authController.logout);

export default router; 