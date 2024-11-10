import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import pool from '../utils/db_connect';
import { CookieOptions } from 'express';


// sign up logic 
const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { username, email, password, profile_pic, bio } = req.body;
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }
    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists!" });
        }
        const validate_profile_pic = profile_pic || null;
        const validate_bio = bio || null;
        
        
        const hashedpassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (username, email, password, profile_pic, bio) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, email, hashedpassword, validate_profile_pic, validate_bio]
        );
        const user = newUser.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '5m' });
        return res.status(201).json({ message: "Registration success", user, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error occurred!" });
    }
};
// defining the cookie options 
const cookieOptions: CookieOptions = {
    path: "/",
    maxAge: 5 * 60 * 1000, 
    sameSite: "lax" as const, 
    secure: false,
    httpOnly:true
};

//login logic 
const login = async (req:Request,res:Response,next:NextFunction): Promise<any> =>{
    const {email,password} = req.body
    try{
        // we get user and check if he exists
        const findUser = await pool.query('select * from users where email = $1',[email])

        if (findUser.rows.length === 0) {
            return res.status(400).json({ message: "Invalid Credentials!" });
        }

        const user = findUser.rows[0];

        if(!user){
            return res.status(400).json({message: "Invalid Credentials !"})
        }
        // check for password validation 
        const password_valid = await bcrypt.compare(password,user.password)
        if(!password_valid){
            return res.status(400).json({message:"Invalid Credentials !"})
        }
        // we generate token and refresh token and save them 

        const token = jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:'5m'})
        const refresh_token = jwt.sign({id:user.id},process.env.REFRESH_TOKEN_SECRET as string,{expiresIn:'1h'})

        //update the db reshtesher token
        await pool.query('update users set refreshtoken = $1 where id = $2',[refresh_token,user.id])

        //save token in cookies
        res.cookie("token", token, cookieOptions);
        res.cookie("tokenExists", true,cookieOptions);

        // set the refresh token as httpOnly as well
        res.cookie("refreshToken", refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            
        });
        return res.status(200).json({message:"Login successfully",user,token})
    }
    catch(err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "An error occurred during login" });
    }   
}

interface JwtPayload {
    id: string;
}

interface CustomRequest extends Request {
    id?: string;
}
// token validation 
const validateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No token found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.id = decoded.id;
        next();
    } catch (error) {
        console.error("Token validation error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// verify then refresh token

const refreshToken = async (req: Request, res: Response): Promise<any> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token" });
        }

        // verify refresh token and explicitly type the decoded payload
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
        
        // check if refresh token exists in database
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND refreshtoken = $2',
            [decoded.id, refreshToken]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        // generate new access token
        const newToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET as string,
            { expiresIn: '5m' }
        );

        // update cookies
        res.cookie("token", newToken, cookieOptions);
        res.cookie("tokenExists", true, cookieOptions);

        return res.status(200).json({ token: newToken });
    } catch (error) {
        console.error("Refresh token  error:", error);
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};

// return user data
const getUserData = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const userId = req.id;
        
        const result = await pool.query(
            'SELECT id, username, email, profile_pic, bio FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        console.error("Get user data error:", error);
        return res.status(500).json({ message: "Error fetching user data" });
    }
};

//logout logic

const logout = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const userId = req.id;
        
        // clear refresh token in database
        await pool.query(
            'UPDATE users SET refreshtoken = NULL WHERE id = $1',
            [userId]
        );

        // clear cookiess
        res.clearCookie("token", cookieOptions);
        res.clearCookie("tokenExists", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Error during logout" });
    }
};

const checkAuthentication = (req: CustomRequest, res: Response) => {
    const token = req.cookies.token;

    if (!token) {
        console.log("No token found");
        return res.status(401).json({ authenticated: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.id = decoded.id;
        console.log("token  valid");
        return res.status(200).json({ authenticated: true });
    } catch (error) {
        console.error("Token validation error:", error);
        return res.status(401).json({ authenticated: false });
    }
};


module.exports = {
    register,login,getUserData,logout,validateToken,refreshToken, checkAuthentication
}
