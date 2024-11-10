const {uploadMedia,upload,getUserPosts} = require("../controllers/MediaController")
import express, { Response } from 'express';
import { Request } from 'express';
const router = express.Router();

router.post('/upload', upload.single('file'), uploadMedia);
router.get('/user-posts/:userId', getUserPosts);

export default router