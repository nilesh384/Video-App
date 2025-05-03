import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewire.js";

import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller.js";

const router = Router();

// 🔐 All like routes should be protected
router.use(verifyJwt);

router.route("/video/:videoId").get(getVideoComments);

router.route("/add-comment/:videoId").post(addComment);

router.route("/update-comment/:commentId").patch(updateComment);

router.route("/delete-comment/:commentId").delete(deleteComment);

export default router;