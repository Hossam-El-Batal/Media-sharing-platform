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
    sameSite: "none" as const, 
    secure: false,
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

module.exports = {
    register,login
}
