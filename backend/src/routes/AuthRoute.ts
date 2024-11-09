import { Router } from "express";
const {register,login} = require("../controllers/AuthenticationController")
const router = Router();
// authentication routes 

router.post("/register", register);
router.post("/login",login)

export default router;