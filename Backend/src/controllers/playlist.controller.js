import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async(req, res) => {
    const {name, description} = req.body;

    if(!name){
        throw new apiError(400, "Name is required")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user._id
    })

    return res
    .status(200)
    .json(new apiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new apiError(400, "Valid userId is required");
  }

    // Ensure a permanent "Watch later" playlist exists for the user.
    let playlists = await Playlist.find({ owner: userId }).populate({
        path: "videos",
        populate: { path: "owner", select: "username avatar" },
    });

    // If watch-later doesn't exist, create it (marked isPermanent)
    const hasWatchLater = playlists.some((p) => p.name === "Watch later");
    if (!hasWatchLater) {
        const wl = await Playlist.create({
            name: "Watch later",
            description: "Videos saved to watch later",
            owner: userId,
            isPermanent: true,
        });
        playlists = [wl, ...playlists];
    } else {
        // make sure watch-later appears first in returned list
        playlists = playlists.sort((a, b) => (a.name === "Watch later" ? -1 : 1));
    }

    return res.status(200).json(new apiResponse(200, playlists, "User's playlists fetched successfully"));
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new apiError(400, "playlistId and videoId is required")
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new apiError(404, "playlist could not be found")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new apiError(404, "video could not be found")
    }

    // Avoid duplicate addition
    if (playlist.videos.includes(videoId)) {
        throw new apiError(400, "Video already exists in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new apiResponse(200, playlist, "Video added to playlist successfully"))
})

const deleteVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if(!playlistId || !videoId){
        throw new apiError(400, "playlistId and videoId is required")
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new apiError(404, "playlist could not be found")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new apiError(404, "video could not be found")
    }

    // find and delete
    if (!playlist.videos.includes(videoId)) {
        throw new apiError(400, "Video does not exist in playlist");
    }

    playlist.videos.pull(videoId);
    await playlist.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new apiResponse(200, playlist, "Video deleted from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Valid playlistId is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You are not authorized to delete this playlist");
    }

    // Prevent deleting permanent playlists (e.g., Watch later)
    if (playlist.isPermanent) {
        throw new apiError(403, "This playlist cannot be deleted");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Playlist deleted successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    addVideoToPlaylist,
    deleteVideoFromPlaylist,
    deletePlaylist
}