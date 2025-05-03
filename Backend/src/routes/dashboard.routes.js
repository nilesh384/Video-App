import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewire.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/channel-stats").get(getChannelStats);
router.route("/channel-videos").get(getChannelVideos);

export default router;