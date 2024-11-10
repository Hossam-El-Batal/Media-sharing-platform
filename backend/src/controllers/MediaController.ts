import { Request, Response, NextFunction } from "express";
import pool from '../utils/db_connect';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';


declare global {
    namespace Express {
      interface Request {
        file?: Express.Multer.File;
      }
    }
  }
  interface CustomRequest extends Request {
    id?: string;
}

//handling media CRUD
// create a supbase client
const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        }
    }
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

const uploadMedia = async (req: CustomRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        console.log('Current user ID:', req.id);

        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const file = req.file;
        const fileName = generateFileName(file.originalname);
        const fileType = file.mimetype.startsWith('image/') ? 'photo' : 'video';
        const filePath = `${fileType}s/${fileName}`; // organize files
        
        // upload to supbase
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('Bucket')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            throw new Error(uploadError.message);   
        }
        
        // get public url
        const { data, error: urlError } = await supabase
            .storage
            .from('Bucket')   
            .createSignedUrl(filePath, 60 * 60);
        
        const signedUrl = data?.signedUrl; 

        if (!signedUrl) {
            throw new Error("Failed to generate signed URL");
        }
       //create post
        const { data: post, error: dbError } = await supabase
            .from('posts')
            .insert({
                user_id: userId,
                content: req.body.content,
                type: fileType,
                url: signedUrl
            })
            .select()
            .single();

        if (dbError) {
            throw new Error(dbError.message);
        }

        return res.status(201).json({
            message: 'Uploaded successfully',
            post,
            url: signedUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: 'Error uploading file' });
    }
};

const getUserPosts = async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return res.status(200).json({
            posts: posts || [],
            metadata: {
                total: posts?.length || 0
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ message: 'Error fetching posts' });
    }
};

// add endpoint to get all posts
const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                post_id,
                content,
                type,
                url,
                created_at,
                user_id,
                users:user_id (
                    username
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }
        const transformedPosts = posts?.map(post => ({
            ...post,
            username: post.users[0]?.username,
            users: undefined
        }));

        return res.status(200).json({
            posts: transformedPosts || [],
            metadata: {
                total: posts?.length || 0
            }
        });
    } catch (error) {
        console.error('Error fetching all posts:', error);
        return res.status(500).json({ message: 'Error fetching posts' });
    }
};
//end point to delete posts 
const deletePost = async (req: CustomRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.id;

    try {
        const post = await pool.query(
            'SELECT * FROM posts WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );

        if (post.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        await pool.query(
            'DELETE FROM posts WHERE post_id = $1',
            [postId]
        );

        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Error deleting post' });
    }
};
module.exports = {uploadMedia,upload,getUserPosts,getAllPosts,deletePost}