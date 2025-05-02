import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewire.js";
import {createPlaylist, getUserPlaylists, addVideoToPlaylist, deleteVideoFromPlaylist} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJwt)

router.route("/create-playlist").post(createPlaylist);

router.route("/get-user-playlists").get(getUserPlaylists);

router.route("/add-video-to-playlist/:playlistId/:videoId").post(addVideoToPlaylist);

router.route("/delete-video-from-playlist/:playlistId/:videoId").delete(deleteVideoFromPlaylist);

export default router