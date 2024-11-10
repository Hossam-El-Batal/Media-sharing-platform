import express from 'express';
const router = express.Router();
const { validateToken } = require("../controllers/AuthenticationController");
const { getLikes, toggleLike } = require("../controllers/LikesController");

router.get('/posts/:postId/likes', validateToken, getLikes);
router.post('/posts/:postId/toggle-like', validateToken, toggleLike);

export default router;