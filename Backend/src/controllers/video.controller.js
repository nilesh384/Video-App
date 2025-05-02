import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { extractPublicIdFromUrl, uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  // Convert types
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const sortOrder = sortType === "asc" ? 1 : -1;

  // Build Mongo filter
  const filter = {};

  // Full-text search in title/description
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Filter by specific user (video owner)
  if (userId) {
    filter.owner = userId;
  }

  // Execute the paginated query
  const videos = await Video.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .populate("owner", "fullname username avatar");

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        videos,
        totalPages: Math.ceil(totalVideos / limitNumber),
        currentPage: pageNumber,
        totalResults: totalVideos,
      },
      "Videos fetched successfully"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  // const videoLocalPath = req.file?.path;
  // const thumbnailLocalPath = req.file?.path;

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new apiError(400, "Video and thumbnail file is required");
  }

  const uploadVideo = await uploadOnCloudinary(videoLocalPath, "video");
  const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

  if (!uploadVideo?.url) {
    throw new apiError(500, "Failed to upload video to Cloudinary");
  }

  if (!uploadThumbnail?.url) {
    throw new apiError(500, "Failed to upload thumbnail to Cloudinary");
  }

  // save to database
  const video = await Video.create({
    video: uploadVideo.url,
    thumbnail: uploadThumbnail.url,
    title: title,
    description: description,
    duration: uploadVideo.duration || 0,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new apiResponse(201, video, "Video created successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  // validation of videoId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(400, "Invalid video id");
  }

  //database call
  const video = await Video.findById(videoId).populate(
    "owner",
    "fullname username avatar"
  );

  return res
    .status(200)
    .json(new apiResponse(200, video, "Video fetched successfully"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description

  const { title, description } = req.body;

  if(!title && !description) {
    throw new apiError(400, "Title or description or thumbnail is required");
  }
 
  //database call
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || Video.title,
        description: description || Video.description
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new apiResponse(200, video, "Video updated successfully"));
});

const updateThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update thumbnail

  if(!req.file?.path){
    throw new apiError(400, "Thumbnail is required");
  }

  const video = await Video.findById(videoId);

  if(!video){
    throw new apiError(400, "Could not find the video")
  }

  //delete from cloudinary
  const oldThumbnailPublicId  = extractPublicIdFromUrl(video.thumbnail)
  await deleteOnCloudinary(oldThumbnailPublicId, "image");

  //upload new thumbnail on cloudinary 
  const newThumbnailUpload = await uploadOnCloudinary(req.file.path, "image");

  if(!newThumbnailUpload){
    throw new apiError(400, "Could not upload new thumbnail to cloudinary")
  }

  //update in database
  video.thumbnail = newThumbnailUpload.url;
  await video.save({validateBeforeSave: false});

  return res
    .status(200)
    .json(new apiResponse(200, video, "Thumbnail updated successfully"));

});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  //database call
  const video = await Video.findById(videoId);

  if(!video){
    throw new apiError(404, "Video not found");
  }

  const videoPublicUrl = extractPublicIdFromUrl(video.video);
  const thumbnailPublicUrl = extractPublicIdFromUrl(video.thumbnail);

  //delete from cloudinary

  await deleteOnCloudinary(videoPublicUrl, "video");
  await deleteOnCloudinary(thumbnailPublicUrl, "image");

  //delete from database
  await video.deleteOne();

  return res
  .status(200)
  .json(new apiResponse(200, video, "Video deleted successfully"));

});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    // Fetch video by ID
    const video = await Video.findById(videoId);
  
    if (!video) {
      throw new apiError(404, "Video not found");
    }
  
    // Toggle the isPublished status
    video.isPublished = !video.isPublished;
  
    // Save the updated video
    await video.save({ validateBeforeSave: false });
  
    return res.status(200).json(
      new apiResponse(
        200,
        video,
        `Video has been ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
  });
  

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
  updateThumbnail
};
