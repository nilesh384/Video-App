import Tweet from "../models/tweet.model.js";
import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;

    if(!content) {
        throw new apiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })

    if(!tweet) {
        throw new apiError(500, "Failed to create tweet")
    }

    return res
    .status(200)
    .json(new apiResponse(200, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    
    if(!userId) {
        throw new apiError(400, "User id is required")
    }

    const tweets = await Tweet.find({owner: userId}).sort({createdAt: -1}).populate("owner", "fullname username")

    return res
    .status(200)
    .json(new apiResponse(200, tweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    const {content} = req.body;

    if(!content || content.trim() === ""){
        throw new apiError(400, "tweet cannot be empty")
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new apiError(404, "could not find the tweet")
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new apiError(403, "you are not authorised to edit this tweet")
    }

    tweet.content = content;
    await tweet.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new apiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params;
    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new apiError(404, "tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You are not authorized to delete this tweet");
    }

    await tweet.deleteOne();

    return res
    .status(200)
    .json(new apiResponse(200, {}, "tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}