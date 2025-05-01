import { Router } from "express";
import { toogleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js";
import verifyJWT from "../middlewares/auth.middlewire.js";

const router = Router();

router.use(verifyJWT);

// Toggle subscribe/unsubscribe to a channel
router.route("/toggle/:channelId").patch(toogleSubscription);

// Get list of subscribers of user
router.route("/subscribers/:channelId").get(getUserChannelSubscribers);

// Get list of channels the user has subscribed to
router.route("/channels/:subscriberId").get(getSubscribedChannels);

export default router;
