import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewire.js";

import {toggleCommentLike, toggleVideoLike, toggleTweetLike, getLikedVideos} from "../controllers/like.controller.js";

const router = Router();

// 🔐 All like routes should be protected
router.use(verifyJwt);

// 🎥 VIDEO LIKES
router.post("/video/:videoId", toggleVideoLike);

router.get("/video", getLikedVideos);

// 💬 COMMENT LIKES
router.post("/comment/:commentId", toggleCommentLike);

// 🐦 TWEET LIKES
router.post("/tweet/:tweetId", toggleTweetLike);

export default router;