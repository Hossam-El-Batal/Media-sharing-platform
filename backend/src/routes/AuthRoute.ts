import { Router } from "express";
import register from "../controllers/AuthenticationController";
const router = Router();
router.post("/register", register);

export default router;