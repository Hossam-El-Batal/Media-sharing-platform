const {register,login,logout,validateToken,refreshToken,getUserData} = require("../controllers/AuthenticationController")
import express, { Response } from 'express';
import { Request } from 'express';
const router = express.Router();

// custom request 
interface CustomRequest extends Request {
    id?: string;
}

// authentication routes 
router.post("/register", register);
router.post("/login",login)
router.post('/refresh-token', refreshToken);

// protected routes
router.get('/user', validateToken, getUserData);
router.post('/logout', validateToken, logout);

export default router;