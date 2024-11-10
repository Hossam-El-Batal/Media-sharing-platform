import { Request, Response } from "express";
import pool from '../utils/db_connect';

interface CustomRequest extends Request {
    id?: string;
}
//
const getLikes = async (req: CustomRequest, res: Response) => {
    const { postId } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT COUNT(*) as like_count, 
            EXISTS(SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2) as user_liked
            FROM likes WHERE post_id = $1`,
            [postId, req.id]
        );
        
        return res.status(200).json({
            likeCount: parseInt(result.rows[0].like_count),
            userLiked: result.rows[0].user_liked
        });
    } catch (error) {
        console.error('Error fetching likes:', error);
        return res.status(500).json({ message: 'Error fetching likes' });
    }
};

const toggleLike = async (req: CustomRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.id;

    try {
        // start a transaction
        await pool.query('BEGIN');  

        
        await pool.query(
            'SELECT id FROM posts WHERE id = $1 FOR UPDATE',
            [postId]
        );

        // check if we liked post before
        const existingLike = await pool.query(
            'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );

        let result;
        if (existingLike.rows.length > 0) {
            // unlike if u already liked a post
            result = await pool.query(
                'DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING id',
                [postId, userId]
            );
        } else {
            // add like
            result = await pool.query(
                'INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING id',
                [postId, userId]
            );
        }
        // get likes count
        const updatedCount = await pool.query(
            'SELECT COUNT(*) as like_count FROM likes WHERE post_id = $1',
            [postId]
        );

        await pool.query('COMMIT');

        return res.status(200).json({
            liked: existingLike.rows.length === 0,
            likeCount: parseInt(updatedCount.rows[0].like_count)
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error toggling like:', error);
        return res.status(500).json({ message: 'Error toggling like' });
    }
};

module.exports = { getLikes, toggleLike };
