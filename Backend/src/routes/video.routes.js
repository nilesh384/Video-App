import { Router } from 'express';
import {deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateThumbnail, updateVideoDetails, incrementVideoView} from "../controllers/video.controller.js"
import verifyJwt from "../middlewares/auth.middlewire.js";
import {upload} from "../middlewares/multer.middlewire.js"

const router = Router();

router.route("/get-all-videos").get(getAllVideos);

router.route("/publish-video")
    .post(
        verifyJwt,
        upload.fields([
            {
                name: "video",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router.route("/:videoId").get(getVideoById)

router.route("/:videoId").delete(verifyJwt, deleteVideo)

router.route("/:videoId").patch(verifyJwt, upload.single("thumbnail"), updateVideoDetails);

router.route("/update-thumbnail/:videoId").patch(verifyJwt, upload.single("thumbnail"), updateThumbnail);

router.route("/toggle/publish/:videoId").patch(verifyJwt, togglePublishStatus);

router.route("/:videoId/view").post(incrementVideoView)


export default router