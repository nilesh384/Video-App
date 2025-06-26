import mongoose from "mongoose";
import Like from "../models/like.model.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import Tweet from "../models/tweet.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(404, "Invalid video");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  let isLiked;
  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();
    isLiked = false;
  } else {
    // Like
    const newLike = await Like.create({ video: videoId, likedBy: userId });
    if (!newLike) {
      throw new apiError(500, "Could not like the video");
    }
    isLiked = true;
  }

  // Get updated like count
  const likeCount = await Like.countDocuments({ video: videoId });

  return res.status(200).json(
    new apiResponse(
      200,
      { isLiked, likeCount },
      isLiked ? "Liked the video successfully" : "Video unliked successfully"
    )
  );
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
  
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new apiError(404, "Invalid comment");
    }
  
    const comment = await Comment.findById(commentId);
  
    if (!comment) {
      throw new apiError(200, "Comment not found");
    }
  
    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });
  
    if (existingLike) {
      // Remove like (unlike)
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new apiResponse(200, null, "Video unliked successfully"));
    }else{
      const newLike = await Like.create({ comment: commentId, likedBy: userId });
  
      if(!newLike){
          throw new apiError(404, "could not like , some error occured")
      }
  
      return res
      .status(200)
      .json(new apiResponse(200, newLike, "Liked the video successfully"))
    }
  
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;
  
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      throw new apiError(404, "Invalid tweet");
    }
  
    const tweet = await Tweet.findById(tweetId);
  
    if (!tweet) {
      throw new apiError(200, "tweet not found");
    }
  
    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });
  
    if (existingLike) {
      // Remove like (unlike)
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new apiResponse(200, null, "tweet unliked successfully"));
    }else{
      const newLike = await Like.create({ tweet: tweetId, likedBy: userId });
  
      if(!newLike){
          throw new apiError(404, "could not like , some error occured")
      }
  
      return res
      .status(200)
      .json(new apiResponse(200, newLike, "Liked the tweet successfully"))
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new apiError(400, "Invalid user ID");
  }

  const likedVideoEntries = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  })
    .populate({
      path: "video",
      populate: {
        path: "owner",
        select: "username avatar", // Only fetch these fields
      },
    });

  const likedVideos = likedVideoEntries.map((entry) => entry.video);

  return res.status(200).json(
    new apiResponse(200, likedVideos, "All liked videos fetched successfully")
  );
});


export { toggleCommentLike, toggleVideoLike, toggleTweetLike, getLikedVideos };
