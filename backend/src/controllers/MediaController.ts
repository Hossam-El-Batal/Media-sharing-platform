import { Request, Response, NextFunction } from "express";
import pool from '../utils/db_connect';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

//handling media CRUD
// create a supbase client
const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string
);
// handling file uploads with multer 
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb ) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});
//generate a new file name to prevent conflicts 
const generateFileName = (originalname: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalname.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
};
// upload a video/photo 

