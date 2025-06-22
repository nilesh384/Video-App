import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewire.js";

import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/video/:videoId").get(getVideoComments);

router.route("/add-comment/:videoId").post(verifyJwt, addComment);

router.route("/update-comment/:commentId").patch(verifyJwt, updateComment);

router.route("/delete-comment/:commentId").delete(verifyJwt, deleteComment);

export default router;