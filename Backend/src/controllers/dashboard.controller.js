import mongoose, { isValidObjectId } from "mongoose"
import Video from "../models/video.model.js"
import Subscription from "../models/subscription.model.js"
import Like from "../models/like.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }

    // Count total videos uploaded by the channel
    const totalVideos = await Video.countDocuments({ owner: channelId });

    // Sum total views of all videos by the channel
    const videoViewStats = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = videoViewStats[0]?.totalViews || 0;

    // Count total likes on videos of the channel
    const videoIds = await Video.find({ owner: channelId }).select("_id");
    const videoIdArray = videoIds.map((v) => v._id);
    const totalLikes = await Like.countDocuments({ video: { $in: videoIdArray } });

    // Count total subscribers to the channel
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    return res
        .status(200)
        .json(new apiResponse(200, {
            totalVideos,
            totalViews,
            totalLikes,
            totalSubscribers
        }, "Channel statistics fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videos = await Video.find({ owner: channelId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments({ owner: channelId });

    return res
        .status(200)
        .json(new apiResponse(200, {
            videos,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit),
            currentPage: parseInt(page)
        }, "Channel videos fetched successfully"));
});

export {
    getChannelStats, 
    getChannelVideos
    }