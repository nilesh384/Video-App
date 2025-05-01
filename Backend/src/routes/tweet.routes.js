import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewire.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();
router.use(verifyJwt)
// create tweet
router.route("/create-tweet").post(createTweet);

// Get all tweets by a specific user
router.route("/get-user-tweets/:userId").get(getUserTweets);

// Update a tweet
router.route("/update/:tweetId").patch(updateTweet);

// Delete a tweet
router.route("/delete/:tweetId").delete(deleteTweet);

export default router;
