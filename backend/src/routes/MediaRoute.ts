const {uploadMedia,upload,getUserPosts,getAllPosts,deletePost} = require("../controllers/MediaController")
import express, { Response } from 'express';
import { Request } from 'express';
const router = express.Router();
const { validateToken,checkAuthentication  } = require("../controllers/AuthenticationController");


router.post('/upload', validateToken, upload.single('file'), uploadMedia);
router.get('/user-posts', validateToken, getUserPosts); 
router.get('/posts', validateToken, getAllPosts);
router.get('/check-auth', checkAuthentication);
router.delete('/posts/:postId', validateToken, deletePost);

export default router