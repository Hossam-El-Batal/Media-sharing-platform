import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import pool from '../utils/db_connect';

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


//login logic 

export default register;
