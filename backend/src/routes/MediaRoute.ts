const {uploadMedia,upload,getUserPosts,getAllPosts} = require("../controllers/MediaController")
import express, { Response } from 'express';
import { Request } from 'express';
const router = express.Router();
const { validateToken } = require("../controllers/AuthenticationController");


router.post('/upload', validateToken, upload.single('file'), uploadMedia);
router.get('/user-posts', validateToken, getUserPosts); 
router.get('/api/posts', getAllPosts);

export default router