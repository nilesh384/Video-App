import Comment from "../models/comment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

// Get comments for a specific video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 3, sortOrder = "desc" } = req.query;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID");
  }

  try {
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const aggregateQuery = [
      {
        $match: { video: new mongoose.Types.ObjectId(videoId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: {
          path: "$ownerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          isEdited: 1, // ✅ Include isEdited field
          owner: "$ownerDetails.username",
        },
      },
      {
        $sort: { createdAt: sortDirection },
      },
    ];

    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 3,
    };

    const comments = await Comment.aggregatePaginate(aggregateQuery, options);

    return res.status(200).json(
      new apiResponse(
        200,
        {
          comments: comments.docs,
          totalPages: comments.totalPages,
          currentPage: comments.page,
          totalComments: comments.totalDocs,
        },
        "Comments retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Error occurred while retrieving comments:", error);
    throw new apiError(500, "Failed to retrieve comments");
  }
});


const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId) {
    throw new apiError(400, "Video ID is required");
  }
  if (!content) {
    throw new apiError(400, "Content is required");
  }

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: userId,
  });

  if (!comment) {
    throw new apiError(500, "Failed to create comment");
  }

  return res
    .status(200)
    .json(new apiResponse(201, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!commentId) {
    throw new apiError(400, "Comment ID is required");
  }
  if (!content) {
    throw new apiError(400, "Content is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new apiError(404, "could not find the comment");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new apiError(403, "you are not authorised to edit this comment");
  }

  comment.content = content;
  comment.isEdited = true;
  await comment.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId) {
    throw new apiError(400, "Comment ID is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new apiError(404, "could not find the comment");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new apiError(403, "you are not authorised to delete this comment");
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new apiResponse(200, null, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
